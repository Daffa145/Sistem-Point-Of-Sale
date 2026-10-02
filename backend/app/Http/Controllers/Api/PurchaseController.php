<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Purchase::with(['supplier', 'items.inventory'])->latest()->get()
        ]);
    }

    public function show($id)
    {
        $purchase = Purchase::with(['supplier', 'items.inventory'])->findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $purchase
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'purchase_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.inventory_id' => 'required|exists:inventories,id',
            'items.*.quantity' => 'required|numeric|min:0.1',
            'items.*.unit_cost' => 'required|numeric|min:0',
            'status' => 'nullable|string',
            'payment_status' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function() use ($validated, $request) {
            $total = 0;
            foreach ($validated['items'] as $it) {
                $total += ($it['quantity'] * $it['unit_cost']);
            }

            $status = $validated['status'] ?? 'received';
            $paymentStatus = $validated['payment_status'] ?? 'paid';

            $purchase = Purchase::create([
                'po_number' => 'PO-' . date('YmdHis'),
                'supplier_id' => $validated['supplier_id'],
                'purchase_date' => $validated['purchase_date'],
                'total_amount' => $total,
                'status' => $status,
                'payment_status' => $paymentStatus,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $it) {
                $sub = $it['quantity'] * $it['unit_cost'];
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'inventory_id' => $it['inventory_id'],
                    'quantity' => $it['quantity'],
                    'unit_cost' => $it['unit_cost'],
                    'subtotal' => $sub,
                ]);

                // Auto increase inventory stock if received
                if ($status === 'received') {
                    $inv = Inventory::find($it['inventory_id']);
                    if ($inv) {
                        $inv->quantity += $it['quantity'];
                        $inv->save();
                    }
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Purchase Order berhasil dibuat',
                'data' => $purchase->load(['supplier', 'items.inventory'])
            ], 201);
        });
    }

    public function updateStatus(Request $request, $id)
    {
        $purchase = Purchase::with('items')->findOrFail($id);
        $oldStatus = $purchase->status;

        $validated = $request->validate([
            'status' => 'nullable|string',
            'payment_status' => 'nullable|string',
        ]);

        if (isset($validated['status'])) {
            $purchase->status = $validated['status'];
        }
        if (isset($validated['payment_status'])) {
            $purchase->payment_status = $validated['payment_status'];
        }

        $purchase->save();

        // If status changed to received, increase stock
        if ($oldStatus !== 'received' && $purchase->status === 'received') {
            foreach ($purchase->items as $item) {
                $inv = Inventory::find($item->inventory_id);
                if ($inv) {
                    $inv->quantity += $item->quantity;
                    $inv->save();
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Status Purchase Order berhasil diperbarui',
            'data' => $purchase->load(['supplier', 'items.inventory'])
        ]);
    }

    public function destroy($id)
    {
        $purchase = Purchase::findOrFail($id);
        $purchase->items()->delete();
        $purchase->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Purchase Order berhasil dihapus'
        ]);
    }
}
