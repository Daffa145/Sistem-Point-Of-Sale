<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KitchenOrder;
use App\Models\Order;
use Illuminate\Http\Request;

class KitchenController extends Controller
{
    public function index()
    {
        $orders = KitchenOrder::with(['order.table', 'order.items.menu'])
            ->whereIn('status', ['queued', 'cooking', 'ready'])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $kitchenOrder = KitchenOrder::findOrFail($id);
        $request->validate([
            'status' => 'required|in:queued,cooking,ready,served'
        ]);

        $status = $request->status;
        $kitchenOrder->status = $status;

        if ($status === 'cooking' && !$kitchenOrder->started_at) {
            $kitchenOrder->started_at = now();
        } elseif ($status === 'ready' || $status === 'served') {
            $kitchenOrder->completed_at = now();
        }

        $kitchenOrder->save();

        // Sync main order status
        $order = $kitchenOrder->order;
        if ($order) {
            if ($status === 'cooking') {
                $order->status = 'preparing';
            } elseif ($status === 'ready') {
                $order->status = 'ready';
            } elseif ($status === 'served') {
                $order->status = 'completed';
            }
            $order->save();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Status Dapur berhasil diperbarui menjadi ' . ucfirst($status),
            'data' => $kitchenOrder->load(['order.table', 'order.items.menu'])
        ]);
    }
}
