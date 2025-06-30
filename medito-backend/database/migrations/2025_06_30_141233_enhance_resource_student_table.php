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
        Schema::table('resource_student', function (Blueprint $table) {
            $table->timestamp('completed_at')->nullable();
            $table->integer('score')->nullable();
            $table->text('feedback')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resource_student', function (Blueprint $table) {
            // Remove the added columns
            $table->dropColumn([
                'completed_at',
                'score',
                'feedback',
                'started_at'
            ]);

            // Drop the index if needed
            $table->dropIndex(['student_id', 'resource_id']);
        });
    }
};
