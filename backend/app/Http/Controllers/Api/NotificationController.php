<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::latest()->take(30)->get();
        $unreadCount = Notification::where('is_read', false)->count();

        return response()->json([
            'status' => 'success',
            'unread_count' => $unreadCount,
            'data' => $notifications
        ]);
    }

    public function markAllAsRead()
    {
        Notification::where('is_read', false)->update(['is_read' => true]);

        return response()->json([
            'status' => 'success',
            'message' => 'Semua notifikasi berhasil ditandai telah dibaca'
        ]);
    }

    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->update(['is_read' => true]);

        return response()->json([
            'status' => 'success',
            'data' => $notification
        ]);
    }
}
