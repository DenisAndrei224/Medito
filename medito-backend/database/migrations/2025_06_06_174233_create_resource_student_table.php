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
        Schema::create('resource_student', function (Blueprint $table) {
            $table->id(); // A primary key for the pivot table itself (optional, but convenient)
            $table->foreignId('resource_id')
                ->constrained() // Constrains to the 'resources' table
                ->onDelete('cascade'); // If a resource is deleted, remove its entries from this pivot table

            $table->foreignId('student_id') // Renamed from 'user_id' for clarity in context
                ->constrained('users') // Constrains to the 'users' table
                ->onDelete('cascade'); // If a student is deleted, remove their resource assignments

            $table->timestamps(); // created_at, updated_at for when the assignment was made

            // Ensures that a specific resource is only assigned to a specific student once
            $table->unique(['resource_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resource_student');
    }
};
