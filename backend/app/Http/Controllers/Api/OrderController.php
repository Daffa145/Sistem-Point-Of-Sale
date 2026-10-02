<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\KitchenOrder;
use App\Models\Table;
use App\Models\Menu;
use App\Models\Inventory;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['table', 'customer', 'cashier', 'items.menu', 'kitchenOrder', 'payment']);

        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        return response()->json([
            'status' => 'success',
            'data' => $query->latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_id' => 'nullable|exists:tables,id',
            'customer_id' => 'nullable|exists:customers,id',
            'order_type' => 'required|in:dine_in,takeaway,qr_self_order',
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:menus,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function() use ($validated, $request) {
            $subtotal = 0;
            $itemsToCreate = [];
            $hasKitchenItems = false;

            foreach ($validated['items'] as $item) {
                $menu = Menu::findOrFail($item['menu_id']);
                $unitPrice = $menu->price;
                $lineSubtotal = $unitPrice * $item['quantity'];
                $subtotal += $lineSubtotal;

                if ($menu->is_kitchen_item) {
                    $hasKitchenItems = true;
                }

                $itemsToCreate[] = [
                    'menu_id' => $menu->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'subtotal' => $lineSubtotal,
                    'notes' => $item['notes'] ?? null,
                    'kitchen_status' => $menu->is_kitchen_item ? 'pending' : 'ready',
                ];

                // Deduct menu stock
                $menu->decrement('stock', $item['quantity']);

                // Deduct raw material inventory stock automatically based on menu category/type
                $inventories = Inventory::all();
                if ($inventories->count() > 0) {
                    // Match inventory item based on category or item name keywords
                    foreach ($inventories as $inv) {
                        $shouldDeduct = false;
                        $deductAmount = 0;

                        if (str_contains(strtolower($menu->name), 'coffee') || str_contains(strtolower($menu->name), 'latte') || str_contains(strtolower($menu->name), 'espresso')) {
                            if (str_contains(strtolower($inv->item_name), 'beans') || str_contains(strtolower($inv->item_name), 'coffee')) {
                                $shouldDeduct = true;
                                $deductAmount = 0.02 * $item['quantity']; // 20g beans
                            } else if (str_contains(strtolower($inv->item_name), 'milk')) {
                                $shouldDeduct = true;
                                $deductAmount = 0.15 * $item['quantity']; // 150ml milk
                            }
                        } else if (str_contains(strtolower($menu->name), 'nasi') || str_contains(strtolower($menu->name), 'rice') || str_contains(strtolower($menu->name), 'burger')) {
                            if (str_contains(strtolower($inv->item_name), 'beras') || str_contains(strtolower($inv->item_name), 'kitchen')) {
                                $shouldDeduct = true;
                                $deductAmount = 0.2 * $item['quantity']; // 200g
                            }
                        }

                        if ($shouldDeduct && $deductAmount > 0) {
                            $inv->quantity = max(0, $inv->quantity - $deductAmount);
                            $inv->save();

                            // Create Inventory Deduction Notification
                            Notification::create([
                                'type' => 'inventory_deduction',
                                'title' => 'Pengurangan Bahan Otomatis',
                                'message' => "Stok {$inv->item_name} berkurang {$deductAmount} {$inv->unit} untuk {$menu->name} (x{$item['quantity']})",
                                'data' => ['inventory_id' => $inv->id, 'remaining' => $inv->quantity]
                            ]);

                            // Check for Low Stock Warning
                            if ($inv->quantity <= $inv->min_stock) {
                                Notification::create([
                                    'type' => 'low_stock',
                                    'title' => 'Peringatan Stok Menipis!',
                                    'message' => "Stok bahan {$inv->item_name} tersisa {$inv->quantity} {$inv->unit} (Batas Min: {$inv->min_stock} {$inv->unit})",
                                    'data' => ['inventory_id' => $inv->id, 'current_stock' => $inv->quantity]
                                ]);
                            }
                        }
                    }
                }
            }

            $tax = round($subtotal * 0.10, 2); // 10% tax
            $serviceCharge = $validated['order_type'] === 'dine_in' ? round($subtotal * 0.05, 2) : 0; // 5% service charge
            $discount = $validated['discount'] ?? 0;
            $totalAmount = max(0, $subtotal + $tax + $serviceCharge - $discount);

            $orderNumber = 'ORD-' . date('Ymd') . '-' . sprintf('%03d', Order::whereDate('created_at', today())->count() + 1);

            $order = Order::create([
                'order_number' => $orderNumber,
                'table_id' => $validated['table_id'] ?? null,
                'customer_id' => $validated['customer_id'] ?? null,
                'user_id' => auth()->id() ?? 1,
                'order_type' => $validated['order_type'],
                'status' => $hasKitchenItems ? 'sent_to_kitchen' : 'pending',
                'subtotal' => $subtotal,
                'tax' => $tax,
                'service_charge' => $serviceCharge,
                'discount' => $discount,
                'total_amount' => $totalAmount,
                'payment_status' => 'unpaid',
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($itemsToCreate as $it) {
                $it['order_id'] = $order->id;
                OrderItem::create($it);
            }

            // Create kitchen order entry if there are kitchen items
            if ($hasKitchenItems) {
                KitchenOrder::create([
                    'order_id' => $order->id,
                    'status' => 'queued',
                    'kitchen_notes' => 'Pesanan baru ' . $orderNumber,
                ]);

                // Create Kitchen Notification
                Notification::create([
                    'type' => 'kitchen',
                    'title' => 'Order Dapur Baru',
                    'message' => "Pesanan {$orderNumber} telah dikirim ke Dapur!",
                    'data' => ['order_id' => $order->id, 'order_number' => $orderNumber]
                ]);
            } else {
                Notification::create([
                    'type' => 'order',
                    'title' => 'Transaksi Baru',
                    'message' => "Pesanan {$orderNumber} berhasil dibuat.",
                    'data' => ['order_id' => $order->id, 'order_number' => $orderNumber]
                ]);
            }

            // Mark table occupied if dine-in
            if (!empty($validated['table_id'])) {
                Table::where('id', $validated['table_id'])->update(['status' => 'occupied']);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Pesanan berhasil dibuat ' . ($hasKitchenItems ? 'dan dikirim ke dapur' : ''),
                'data' => $order->load(['table', 'items.menu', 'kitchenOrder'])
            ], 201);
        });
    }

    public function show($id)
    {
        $order = Order::with(['table', 'customer', 'cashier', 'items.menu', 'kitchenOrder', 'payment'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $order
        ]);
    }
}
