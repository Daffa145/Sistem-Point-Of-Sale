<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'payment_method' => 'required|in:cash,qris,card,e-wallet',
            'amount_paid' => 'required|numeric|min:0',
            'transaction_reference' => 'nullable|string',
        ]);

        return DB::transaction(function() use ($validated, $request) {
            $order = Order::with(['table', 'items.menu'])->findOrFail($validated['order_id']);

            if ($order->payment_status === 'paid') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pesanan ini sudah dibayar sebelumnya.'
                ], 400);
            }

            if ($validated['amount_paid'] < $order->total_amount) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Jumlah pembayaran kurang dari total tagihan (Rp ' . number_format($order->total_amount, 0, ',', '.') . ')'
                ], 400);
            }

            $change = $validated['amount_paid'] - $order->total_amount;

            $payment = Payment::create([
                'order_id' => $order->id,
                'payment_method' => $validated['payment_method'],
                'amount_paid' => $validated['amount_paid'],
                'change_amount' => $change,
                'transaction_reference' => $validated['transaction_reference'] ?? ('TRX-' . strtoupper(uniqid())),
                'status' => 'completed',
                'cashier_id' => auth()->id() ?? 1,
            ]);

            // Update order status
            $order->payment_status = 'paid';
            $order->payment_method = $validated['payment_method'];
            if ($order->status === 'pending' || $order->status === 'ready') {
                $order->status = 'completed';
            }
            $order->save();

            // Free table status if dine-in
            if ($order->table_id) {
                Table::where('id', $order->table_id)->update(['status' => 'available']);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Pembayaran berhasil dikonfirmasi! Struk dapat dicetak.',
                'data' => [
                    'payment' => $payment,
                    'order' => $order->fresh(['table', 'customer', 'cashier', 'items.menu'])
                ]
            ]);
        });
    }

    public function receipt($orderId)
    {
        $order = Order::with(['table', 'customer', 'cashier', 'items.menu', 'payment'])->findOrFail($orderId);

        return response()->json([
            'status' => 'success',
            'data' => [
                'store_name' => 'Kopi POS & Resto',
                'address' => 'Jl. Boulevard Raya No. 88, Jakarta',
                'phone' => '0812-3456-7890',
                'order' => $order,
            ]
        ]);
    }
}
