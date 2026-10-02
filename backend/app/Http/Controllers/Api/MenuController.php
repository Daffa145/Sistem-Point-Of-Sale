<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $query = Menu::with('category');

        if ($request->has('category_id') && $request->category_id != '') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'status' => 'success',
            'data' => $query->latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:menus,code',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'is_kitchen_item' => 'boolean',
            'stock' => 'integer|min:0',
            'unit' => 'nullable|string',
        ]);

        if (empty($validated['image'])) {
            $validated['image'] = 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80';
        }

        $menu = Menu::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Menu berhasil ditambahkan',
            'data' => $menu->load('category')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $menu = Menu::findOrFail($id);
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:menus,code,' . $id,
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'is_available' => 'boolean',
            'is_kitchen_item' => 'boolean',
            'stock' => 'integer|min:0',
        ]);

        $menu->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Menu berhasil diperbarui',
            'data' => $menu->load('category')
        ]);
    }

    public function toggleAvailability($id)
    {
        $menu = Menu::findOrFail($id);
        $menu->is_available = !$menu->is_available;
        $menu->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Status ketersediaan menu diperbarui',
            'data' => $menu
        ]);
    }

    public function destroy($id)
    {
        $menu = Menu::findOrFail($id);
        $menu->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Menu berhasil dihapus'
        ]);
    }
}
