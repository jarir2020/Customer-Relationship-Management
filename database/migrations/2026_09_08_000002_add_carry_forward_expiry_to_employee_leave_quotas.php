<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE employee_leave_quotas ADD COLUMN carry_forward_expires_at DATE NULL AFTER carry_forward_applied");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE employee_leave_quotas DROP COLUMN carry_forward_expires_at");
    }
};
