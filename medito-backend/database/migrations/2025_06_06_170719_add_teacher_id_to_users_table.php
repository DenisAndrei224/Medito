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
        Schema::table('users', function (Blueprint $table) {
            // Add the teacher_id column, nullable, unsigned for foreign key
            $table->foreignId('teacher_id')
                ->nullable() // Students might not have a teacher assigned immediately
                ->constrained('users') // Constrain to the 'users' table
                ->onDelete('set null'); // If a teacher is deleted, set their students' teacher_id to null
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('teacher_id'); // Correct way to drop foreign key and column
        });
    }
};
