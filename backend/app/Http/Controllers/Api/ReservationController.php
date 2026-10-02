<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Table;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReservationController extends Controller
{
    /**
     * Auto delete reservations older than H+2 (2 days past reservation_time)
     */
    private function autoDeleteExpired()
    {
        $expiredReservations = Reservation::where('reservation_time', '<', Carbon::now()->subDays(2))->get();

        foreach ($expiredReservations as $res) {
            $tableId = $res->table_id;
            $res->delete();

            if ($tableId) {
                $hasOther = Reservation::where('table_id', $tableId)
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->exists();
                if (!$hasOther) {
                    Table::where('id', $tableId)->where('status', 'reserved')->update(['status' => 'available']);
                }
            }
        }
    }

    public function index()
    {
        $this->autoDeleteExpired();

        return response()->json([
            'status' => 'success',
            'data' => Reservation::with('table')->latest('reservation_time')->get()
        ]);
    }

    public function show($id)
    {
        $this->autoDeleteExpired();
        $reservation = Reservation::with('table')->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $reservation
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string',
            'table_id' => 'required|exists:tables,id',
            'reservation_time' => 'required|date',
            'guest_count' => 'required|integer|min:1',
            'status' => 'nullable|in:pending,confirmed,seated,cancelled',
            'notes' => 'nullable|string',
        ]);

        $validated['status'] = $validated['status'] ?? 'confirmed';

        $reservation = Reservation::create($validated);

        if (in_array($reservation->status, ['pending', 'confirmed'])) {
            Table::where('id', $validated['table_id'])->update(['status' => 'reserved']);
        } elseif ($reservation->status === 'seated') {
            Table::where('id', $validated['table_id'])->update(['status' => 'occupied']);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Reservasi meja berhasil disimpan',
            'data' => $reservation->load('table')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);

        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string',
            'table_id' => 'required|exists:tables,id',
            'reservation_time' => 'required|date',
            'guest_count' => 'required|integer|min:1',
            'status' => 'required|in:pending,confirmed,seated,cancelled',
            'notes' => 'nullable|string',
        ]);

        $oldTableId = $reservation->table_id;
        $reservation->update($validated);

        if ($oldTableId != $validated['table_id']) {
            $hasOtherOld = Reservation::where('table_id', $oldTableId)
                ->where('id', '!=', $reservation->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->exists();
            if (!$hasOtherOld) {
                Table::where('id', $oldTableId)->where('status', 'reserved')->update(['status' => 'available']);
            }
        }

        if (in_array($validated['status'], ['pending', 'confirmed'])) {
            Table::where('id', $validated['table_id'])->update(['status' => 'reserved']);
        } elseif ($validated['status'] === 'seated') {
            Table::where('id', $validated['table_id'])->update(['status' => 'occupied']);
        } elseif ($validated['status'] === 'cancelled') {
            $hasOtherNew = Reservation::where('table_id', $validated['table_id'])
                ->where('id', '!=', $reservation->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->exists();
            if (!$hasOtherNew) {
                Table::where('id', $validated['table_id'])->update(['status' => 'available']);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Reservasi meja berhasil diperbarui',
            'data' => $reservation->load('table')
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $res = Reservation::findOrFail($id);
        $request->validate(['status' => 'required|in:pending,confirmed,seated,cancelled']);

        $res->status = $request->status;
        $res->save();

        if ($request->status === 'seated') {
            Table::where('id', $res->table_id)->update(['status' => 'occupied']);
        } elseif ($request->status === 'cancelled') {
            $hasOther = Reservation::where('table_id', $res->table_id)
                ->where('id', '!=', $res->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->exists();
            if (!$hasOther) {
                Table::where('id', $res->table_id)->update(['status' => 'available']);
            }
        } elseif (in_array($request->status, ['pending', 'confirmed'])) {
            Table::where('id', $res->table_id)->update(['status' => 'reserved']);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Status reservasi diperbarui',
            'data' => $res->load('table')
        ]);
    }

    public function destroy($id)
    {
        $reservation = Reservation::findOrFail($id);
        $tableId = $reservation->table_id;

        $reservation->delete();

        if ($tableId) {
            $hasOther = Reservation::where('table_id', $tableId)
                ->whereIn('status', ['pending', 'confirmed'])
                ->exists();
            if (!$hasOther) {
                Table::where('id', $tableId)->where('status', 'reserved')->update(['status' => 'available']);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Reservasi meja berhasil dihapus'
        ]);
    }
}

