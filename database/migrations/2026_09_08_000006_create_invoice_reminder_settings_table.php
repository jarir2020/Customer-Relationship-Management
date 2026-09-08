<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_reminder_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->tinyInteger('days_before_due')->default(0);
            $table->tinyInteger('days_after_due')->default(0);
            $table->tinyInteger('repeat_every_days')->nullable();
            $table->tinyInteger('max_reminders')->nullable();
            $table->tinyInteger('is_active')->default(1);
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_reminder_settings');
    }
};
