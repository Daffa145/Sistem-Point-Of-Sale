<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Table;
use App\Models\Category;
use App\Models\Menu;
use Illuminate\Http\Request;

class QrMenuController extends Controller
{
    public function showTableMenu($tableId)
    {
        $table = Table::where('id', $tableId)->orWhere('qr_code', $tableId)->firstOrFail();

        $categories = Category::where('is_active', true)
            ->with(['menus' => function($q) {
                $q->where('is_available', true);
            }])
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'table' => $table,
                'categories' => $categories
            ]
        ]);
    }
}
