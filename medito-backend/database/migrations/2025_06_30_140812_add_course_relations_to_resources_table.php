<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('resources', function (Blueprint $table) {
            $table->foreignId('course_id')
                ->nullable()
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('module_id')
                ->nullable()
                ->constrained()
                ->onDelete('cascade');

            $table->unsignedInteger('order')
                ->default(0)
                ->after('type');

            $table->index(['course_id', 'module_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resources', function (Blueprint $table) {
            // Drop foreign key constraints first
            $table->dropForeign(['course_id']);
            $table->dropForeign(['module_id']);

            // Then drop the columns
            $table->dropColumn(['course_id', 'module_id', 'order']);
        });
    }
};
