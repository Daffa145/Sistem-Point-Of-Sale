<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\KitchenController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\QrMenuController;
use App\Http\Controllers\Api\AiAnalyticsController;
use App\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| RESTful API Routes (V1)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // Public Auth
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Public QR Menu
    Route::get('/qr-menu/{tableId}', [QrMenuController::class, 'showTableMenu']);
    Route::post('/public/orders', [OrderController::class, 'store']); // Public QR self-ordering

    // Protected API endpoints
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // User Management
        Route::apiResource('users', UserController::class);

        // Master Data
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('menus', MenuController::class);
        Route::patch('/menus/{id}/toggle-availability', [MenuController::class, 'toggleAvailability']);

        // Tables
        Route::apiResource('tables', TableController::class);
        Route::patch('/tables/{id}/status', [TableController::class, 'updateStatus']);

        // Customers & Suppliers
        Route::apiResource('customers', CustomerController::class);
        Route::apiResource('suppliers', SupplierController::class);

        // Inventory & Purchases
        Route::apiResource('inventories', InventoryController::class);
        Route::patch('/inventories/{id}/stock', [InventoryController::class, 'updateStock']);
        Route::apiResource('purchases', PurchaseController::class);
        Route::patch('/purchases/{id}/status', [PurchaseController::class, 'updateStatus']);

        // POS Orders
        Route::get('/orders', [OrderController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);

        // Kitchen Display System (KDS)
        Route::get('/kitchen/orders', [KitchenController::class, 'index']);
        Route::patch('/kitchen/orders/{id}/status', [KitchenController::class, 'updateStatus']);

        // Payments & Receipts
        Route::post('/payments', [PaymentController::class, 'store']);
        Route::get('/payments/receipt/{orderId}', [PaymentController::class, 'receipt']);

        // Reports
        Route::get('/reports/sales', [ReportController::class, 'salesReport']);

        // Reservations
        Route::apiResource('reservations', ReservationController::class);
        Route::patch('/reservations/{id}/status', [ReservationController::class, 'updateStatus']);

        // Analytics AI
        Route::get('/analytics/ai', [AiAnalyticsController::class, 'index']);

        // Notifications System
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    });
});
