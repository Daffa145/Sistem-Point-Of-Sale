<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function salesReport(Request $request)
    {
        $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? now()->endOfDay()->toDateString();

        $paidOrders = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->with(['items.menu', 'payment'])
            ->get();

        $totalRevenue = $paidOrders->sum('total_amount');
        $totalOrdersCount = $paidOrders->count();
        $totalTax = $paidOrders->sum('tax');
        $totalDiscount = $paidOrders->sum('discount');

        $paymentMethodsBreakdown = Payment::selectRaw('payment_method, SUM(amount_paid - change_amount) as total, COUNT(*) as count')
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->groupBy('payment_method')
            ->get();

        $topSellingItems = OrderItem::selectRaw('menu_id, SUM(quantity) as total_qty, SUM(subtotal) as total_sales')
            ->whereHas('order', function($q) use ($startDate, $endDate) {
                $q->where('payment_status', 'paid')
                  ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            })
            ->with('menu')
            ->groupBy('menu_id')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'period' => ['start' => $startDate, 'end' => $endDate],
                'summary' => [
                    'total_revenue' => $totalRevenue,
                    'total_orders' => $totalOrdersCount,
                    'total_tax' => $totalTax,
                    'total_discount' => $totalDiscount,
                    'average_order_value' => $totalOrdersCount > 0 ? round($totalRevenue / $totalOrdersCount, 2) : 0,
                ],
                'payment_breakdown' => $paymentMethodsBreakdown,
                'top_selling_items' => $topSellingItems,
                'orders' => $paidOrders
            ]
        ]);
    }
}
