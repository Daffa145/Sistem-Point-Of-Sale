<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Inventory::with('supplier')->latest()->get()
        ]);
    }

    public function show($id)
    {
        $item = Inventory::with('supplier')->findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $item
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'sku' => 'required|string|unique:inventories,sku',
            'category' => 'required|string',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'min_stock' => 'required|numeric|min:0',
            'unit_cost' => 'required|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        $item = Inventory::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Barang inventaris berhasil ditambahkan',
            'data' => $item->load('supplier')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $item = Inventory::findOrFail($id);
        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'sku' => 'required|string|unique:inventories,sku,' . $id,
            'category' => 'required|string',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'min_stock' => 'required|numeric|min:0',
            'unit_cost' => 'required|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        $item->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Barang inventaris berhasil diperbarui',
            'data' => $item->load('supplier')
        ]);
    }

    public function destroy($id)
    {
        $item = Inventory::findOrFail($id);
        $item->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Barang inventaris berhasil dihapus'
        ]);
    }

    public function updateStock(Request $request, $id)
    {
        $item = Inventory::findOrFail($id);
        $request->validate([
            'quantity' => 'required|numeric',
            'type' => 'required|in:add,subtract,set'
        ]);

        if ($request->type === 'add') {
            $item->quantity += $request->quantity;
        } elseif ($request->type === 'subtract') {
            $item->quantity = max(0, $item->quantity - $request->quantity);
        } else {
            $item->quantity = $request->quantity;
        }

        $item->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Stok inventaris berhasil diperbarui',
            'data' => $item
        ]);
    }
}
