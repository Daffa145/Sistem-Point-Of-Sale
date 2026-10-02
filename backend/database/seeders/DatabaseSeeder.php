<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Menu;
use App\Models\Table;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\KitchenOrder;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\AiAnalytic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Users
        $admin = User::firstOrCreate(['email' => 'admin@pos.com'], [
            'name' => 'Admin Manager',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '081234567890',
            'is_active' => true,
        ]);

        $cashier = User::firstOrCreate(['email' => 'cashier@pos.com'], [
            'name' => 'Budi Cashier',
            'password' => Hash::make('password'),
            'role' => 'cashier',
            'phone' => '081298765432',
            'is_active' => true,
        ]);

        $kitchen = User::firstOrCreate(['email' => 'kitchen@pos.com'], [
            'name' => 'Chef Alex',
            'password' => Hash::make('password'),
            'role' => 'kitchen',
            'phone' => '081355556666',
            'is_active' => true,
        ]);

        // 2. Categories
        $catCoffee = Category::create(['name' => 'Espresso & Coffee', 'slug' => 'coffee', 'description' => 'Single origin & specialty espresso coffee drinks', 'icon' => 'Coffee']);
        $catNonCoffee = Category::create(['name' => 'Non-Coffee & Teas', 'slug' => 'non-coffee', 'description' => 'Matcha, Chocolate, Artisanal Teas', 'icon' => 'CupSoda']);
        $catFood = Category::create(['name' => 'Main Courses', 'slug' => 'main-course', 'description' => 'Indonesian & Western favorites', 'icon' => 'Utensils']);
        $catSnacks = Category::create(['name' => 'Snacks & Bites', 'slug' => 'snacks', 'description' => 'French fries, Toast, Nachos', 'icon' => 'Pizza']);
        $catDessert = Category::create(['name' => 'Desserts & Pastry', 'slug' => 'dessert', 'description' => 'Croissants, Cakes & Gelato', 'icon' => 'Cake']);

        // 3. Master Menus
        $menusData = [
            // Coffee
            ['category_id' => $catCoffee->id, 'name' => 'Espresso Single', 'code' => 'CF-001', 'price' => 20000, 'cost_price' => 5000, 'description' => 'Pure rich double shot espresso', 'is_kitchen_item' => false, 'image' => 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80', 'stock' => 150],
            ['category_id' => $catCoffee->id, 'name' => 'Caffè Latte', 'code' => 'CF-002', 'price' => 32000, 'cost_price' => 9000, 'description' => 'Espresso with silky steamed fresh milk', 'is_kitchen_item' => false, 'image' => 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500&q=80', 'stock' => 120],
            ['category_id' => $catCoffee->id, 'name' => 'Caramel Macchiato', 'code' => 'CF-003', 'price' => 38000, 'cost_price' => 11000, 'description' => 'Espresso, vanilla syrup, steamed milk & caramel drizzle', 'is_kitchen_item' => false, 'image' => 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&q=80', 'stock' => 90],
            ['category_id' => $catCoffee->id, 'name' => 'Ice Americano', 'code' => 'CF-004', 'price' => 25000, 'cost_price' => 6000, 'description' => 'Espresso over cold ice and filtered water', 'is_kitchen_item' => false, 'image' => 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&q=80', 'stock' => 200],
            ['category_id' => $catCoffee->id, 'name' => 'Manual Brew V60', 'code' => 'CF-005', 'price' => 35000, 'cost_price' => 12000, 'description' => 'Single origin Arabica pour over brew', 'is_kitchen_item' => false, 'image' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80', 'stock' => 60],

            // Non Coffee
            ['category_id' => $catNonCoffee->id, 'name' => 'Matcha Latte Ice', 'code' => 'NC-001', 'price' => 34000, 'cost_price' => 10000, 'description' => 'Uji Kyoto premium matcha with fresh milk', 'is_kitchen_item' => false, 'image' => 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&q=80', 'stock' => 80],
            ['category_id' => $catNonCoffee->id, 'name' => 'Signature Belgian Chocolate', 'code' => 'NC-002', 'price' => 35000, 'cost_price' => 11000, 'description' => 'Rich dark cocoa brew with creamy texture', 'is_kitchen_item' => false, 'image' => 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500&q=80', 'stock' => 70],

            // Food
            ['category_id' => $catFood->id, 'name' => 'Nasi Goreng Special POS', 'code' => 'FD-001', 'price' => 45000, 'cost_price' => 18000, 'description' => 'Smoky fried rice with sunny egg, chicken satay & crackers', 'is_kitchen_item' => true, 'image' => 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80', 'stock' => 50],
            ['category_id' => $catFood->id, 'name' => 'Beef Burger & Fries', 'code' => 'FD-002', 'price' => 55000, 'cost_price' => 22000, 'description' => 'Juicy Australian beef patty, cheddar & crisp fries', 'is_kitchen_item' => true, 'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80', 'stock' => 40],
            ['category_id' => $catFood->id, 'name' => 'Spaghetti Carbonara', 'code' => 'FD-003', 'price' => 48000, 'cost_price' => 19000, 'description' => 'Creamy egg yolk sauce, smoked beef & parmesan', 'is_kitchen_item' => true, 'image' => 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&q=80', 'stock' => 45],

            // Snacks
            ['category_id' => $catSnacks->id, 'name' => 'Truffle Parmesan Fries', 'code' => 'SN-001', 'price' => 28000, 'cost_price' => 9000, 'description' => 'Crispy cut potatoes with white truffle oil & parmesan', 'is_kitchen_item' => true, 'image' => 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&q=80', 'stock' => 100],

            // Dessert
            ['category_id' => $catDessert->id, 'name' => 'Butter Croissant', 'code' => 'DS-001', 'price' => 24000, 'cost_price' => 8000, 'description' => 'Flaky French butter croissant freshly baked', 'is_kitchen_item' => true, 'image' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80', 'stock' => 30],
        ];

        foreach ($menusData as $m) {
            Menu::create($m);
        }

        // 4. Tables
        $tablesData = [
            ['name' => 'Table 01', 'code' => 'T01', 'capacity' => 2, 'status' => 'available', 'area' => 'Indoor', 'qr_code' => Str::random(12)],
            ['name' => 'Table 02', 'code' => 'T02', 'capacity' => 4, 'status' => 'occupied', 'area' => 'Indoor', 'qr_code' => Str::random(12)],
            ['name' => 'Table 03', 'code' => 'T03', 'capacity' => 4, 'status' => 'available', 'area' => 'Indoor', 'qr_code' => Str::random(12)],
            ['name' => 'Table 04', 'code' => 'T04', 'capacity' => 6, 'status' => 'reserved', 'area' => 'Indoor', 'qr_code' => Str::random(12)],
            ['name' => 'Outdoor 01', 'code' => 'OUT01', 'capacity' => 4, 'status' => 'available', 'area' => 'Outdoor', 'qr_code' => Str::random(12)],
            ['name' => 'Outdoor 02', 'code' => 'OUT02', 'capacity' => 4, 'status' => 'available', 'area' => 'Outdoor', 'qr_code' => Str::random(12)],
            ['name' => 'VIP Lounge 1', 'code' => 'VIP01', 'capacity' => 8, 'status' => 'available', 'area' => 'VIP', 'qr_code' => Str::random(12)],
        ];

        foreach ($tablesData as $t) {
            Table::create($t);
        }

        // 5. Customers & Suppliers
        $cust1 = Customer::create(['name' => 'Dewi Sartika', 'phone' => '081122334455', 'email' => 'dewi@example.com', 'points' => 120, 'address' => 'Jakarta South']);
        $cust2 = Customer::create(['name' => 'Rizky Ramadhan', 'phone' => '087788990011', 'email' => 'rizky@example.com', 'points' => 45, 'address' => 'Bandung Central']);

        $sup1 = Supplier::create(['name' => 'Gayo Coffee Roasters', 'contact_person' => 'Pak Hendra', 'phone' => '082199887766', 'email' => 'supply@gayocoffee.com', 'address' => 'Aceh Tengah']);
        $sup2 = Supplier::create(['name' => 'PT Fresh Dairy Nusantara', 'contact_person' => 'Ibu Maria', 'phone' => '085544332211', 'email' => 'orders@freshdairy.co.id', 'address' => 'Bogor']);

        // 6. Inventories
        Inventory::create(['item_name' => 'Arabica Gayo Espresso Beans', 'sku' => 'RAW-001', 'category' => 'Raw Material', 'quantity' => 25.5, 'unit' => 'kg', 'min_stock' => 5.0, 'unit_cost' => 180000, 'supplier_id' => $sup1->id]);
        Inventory::create(['item_name' => 'Fresh Whole Milk 1L', 'sku' => 'RAW-002', 'category' => 'Beverage Base', 'quantity' => 48, 'unit' => 'liter', 'min_stock' => 10, 'unit_cost' => 1900, 'supplier_id' => $sup2->id]);
        Inventory::create(['item_name' => 'Vanilla Syrup 750ml', 'sku' => 'RAW-003', 'category' => 'Beverage Base', 'quantity' => 6, 'unit' => 'bottle', 'min_stock' => 2, 'unit_cost' => 140000, 'supplier_id' => $sup1->id]);

        // 7. Active Sample Order (Table 02)
        $t2 = Table::where('code', 'T02')->first();
        $order = Order::create([
            'order_number' => 'ORD-' . date('Ymd') . '-001',
            'table_id' => $t2->id,
            'customer_id' => $cust1->id,
            'user_id' => $cashier->id,
            'order_type' => 'dine_in',
            'status' => 'sent_to_kitchen',
            'subtotal' => 125000,
            'tax' => 12500,
            'service_charge' => 6250,
            'discount' => 0,
            'total_amount' => 143750,
            'payment_status' => 'unpaid',
            'notes' => 'Table 02 - Less ice on drinks',
        ]);

        $mLatte = Menu::where('code', 'CF-002')->first();
        $mNasiGoreng = Menu::where('code', 'FD-001')->first();

        OrderItem::create([
            'order_id' => $order->id,
            'menu_id' => $mLatte->id,
            'quantity' => 2,
            'unit_price' => 32000,
            'subtotal' => 64000,
            'notes' => 'Oat milk if available',
            'kitchen_status' => 'ready',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'menu_id' => $mNasiGoreng->id,
            'quantity' => 1,
            'unit_price' => 45000,
            'subtotal' => 45000,
            'notes' => 'Extra spicy',
            'kitchen_status' => 'cooking',
        ]);

        KitchenOrder::create([
            'order_id' => $order->id,
            'status' => 'cooking',
            'started_at' => now()->subMinutes(8),
            'kitchen_notes' => '1 Nasi Goreng Extra Spicy in progress',
        ]);

        // 8. Sample Past Completed Order with Payment
        $pastOrder = Order::create([
            'order_number' => 'ORD-' . date('Ymd') . '-000',
            'table_id' => 1,
            'customer_id' => $cust2->id,
            'user_id' => $cashier->id,
            'order_type' => 'dine_in',
            'status' => 'completed',
            'subtotal' => 63000,
            'tax' => 6300,
            'service_charge' => 3150,
            'discount' => 0,
            'total_amount' => 72450,
            'payment_status' => 'paid',
            'payment_method' => 'qris',
        ]);

        Payment::create([
            'order_id' => $pastOrder->id,
            'payment_method' => 'qris',
            'amount_paid' => 72450,
            'change_amount' => 0,
            'transaction_reference' => 'QRIS-992817263',
            'status' => 'completed',
            'cashier_id' => $cashier->id,
        ]);

        // 9. Reservations
        Reservation::create([
            'customer_id' => $cust1->id,
            'customer_name' => 'Dewi Sartika',
            'customer_phone' => '081122334455',
            'table_id' => 4,
            'reservation_time' => now()->addHours(3)->toDateTimeString(),
            'guest_count' => 5,
            'status' => 'confirmed',
            'notes' => 'Birthday celebration preparation',
        ]);

        // 10. AI Analytics Data
        AiAnalytic::create([
            'type' => 'sales_forecast',
            'title' => 'Peak Hours & Sales Forecast',
            'insight_summary' => 'Predicted 35% spike in Coffee & Pastry sales between 14:00 - 17:00 today. Ensure 2 baristas are scheduled.',
            'priority' => 'high',
            'is_actionable' => true,
            'metrics_data' => ['predicted_revenue' => 4500000, 'peak_hours' => ['14:00', '15:00', '16:00'], 'top_recommended' => 'Caffè Latte + Croissant Combo'],
        ]);

        AiAnalytic::create([
            'type' => 'inventory_alert',
            'title' => 'Fresh Whole Milk Stock Warning',
            'insight_summary' => 'Milk stock will run out in approximately 1.5 days based on current latte order velocity.',
            'priority' => 'critical',
            'is_actionable' => true,
            'metrics_data' => ['current_stock' => 48, 'daily_consumption' => 32, 'reorder_suggested_qty' => 100],
        ]);
    }
}
