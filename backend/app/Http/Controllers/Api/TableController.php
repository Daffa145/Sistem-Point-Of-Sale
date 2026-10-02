<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TableController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Table::with(['orders' => function($q) {
                $q->whereIn('status', ['pending', 'sent_to_kitchen', 'preparing', 'ready']);
            }])->get()
        ]);
    }

    public function show($id)
    {
        $table = Table::findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $table
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:tables,code',
            'capacity' => 'required|integer|min:1',
            'area' => 'required|string',
            'status' => 'nullable|in:available,occupied,reserved,maintenance',
        ]);

        $validated['qr_code'] = $validated['code'] . '-QR' . rand(100, 999);
        $validated['status'] = $validated['status'] ?? 'available';
        $table = Table::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Meja berhasil ditambahkan',
            'data' => $table
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $table = Table::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:tables,code,' . $id,
            'capacity' => 'required|integer|min:1',
            'area' => 'required|string',
            'status' => 'required|in:available,occupied,reserved,maintenance',
        ]);

        $table->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Data meja berhasil diperbarui',
            'data' => $table
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $table = Table::findOrFail($id);
        $request->validate([
            'status' => 'required|in:available,occupied,reserved,maintenance'
        ]);

        $table->status = $request->status;
        $table->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Status meja diperbarui',
            'data' => $table
        ]);
    }

    public function destroy($id)
    {
        $table = Table::findOrFail($id);
        $table->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Meja berhasil dihapus'
        ]);
    }
}
