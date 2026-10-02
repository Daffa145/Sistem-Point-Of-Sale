<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Customer::latest()->get()
        ]);
    }

    public function show($id)
    {
        $customer = Customer::findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $customer
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'points' => 'nullable|integer|min:0',
        ]);

        $customer = Customer::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Pelanggan berhasil ditambahkan',
            'data' => $customer
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'points' => 'nullable|integer|min:0',
        ]);

        $customer->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Data pelanggan berhasil diperbarui',
            'data' => $customer
        ]);
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Pelanggan berhasil dihapus'
        ]);
    }
}
