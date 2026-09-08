<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_time_logs', function (Blueprint $table) {
            $table->unsignedTinyInteger('rejected')->default(0)->after('approved');
            $table->unsignedInteger('rejected_by')->nullable()->after('rejected');
            $table->timestamp('rejected_at')->nullable()->after('rejected_by');

            $table->foreign('rejected_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('project_time_logs', function (Blueprint $table) {
            $table->dropForeign(['rejected_by']);
            $table->dropColumn(['rejected', 'rejected_by', 'rejected_at']);
        });
    }
};
