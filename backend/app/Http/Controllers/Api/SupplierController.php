<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Supplier::latest()->get()
        ]);
    }

    public function show($id)
    {
        $supplier = Supplier::findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $supplier
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
        ]);

        $supplier = Supplier::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Supplier berhasil ditambahkan',
            'data' => $supplier
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
        ]);

        $supplier->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Supplier berhasil diperbarui',
            'data' => $supplier
        ]);
    }

    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Supplier berhasil dihapus'
        ]);
    }
}
