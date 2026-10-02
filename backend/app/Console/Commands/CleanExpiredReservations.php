<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reservation;
use App\Models\Table;
use Carbon\Carbon;

class CleanExpiredReservations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:clean-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Otomatis menghapus reservasi yang sudah melewati H+2 (2 hari setelah waktu reservasi)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $expiredReservations = Reservation::where('reservation_time', '<', Carbon::now()->subDays(2))->get();

        $count = 0;
        foreach ($expiredReservations as $res) {
            $tableId = $res->table_id;
            $res->delete();
            $count++;

            if ($tableId) {
                $hasOther = Reservation::where('table_id', $tableId)
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->exists();
                if (!$hasOther) {
                    Table::where('id', $tableId)->where('status', 'reserved')->update(['status' => 'available']);
                }
            }
        }

        $this->info("Berhasil menghapus {$count} reservasi expired (H+2).");
        return Command::SUCCESS;
    }
}
