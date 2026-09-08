<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_tags', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->string('name');
            $table->string('color')->nullable();
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->unique(['company_id', 'name']);
        });

        Schema::create('project_project_tag', function (Blueprint $table) {
            $table->unsignedBigInteger('project_id');
            $table->unsignedBigInteger('project_tag_id');

            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->foreign('project_tag_id')->references('id')->on('project_tags')->onDelete('cascade');
            $table->primary(['project_id', 'project_tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_project_tag');
        Schema::dropIfExists('project_tags');
    }
};
