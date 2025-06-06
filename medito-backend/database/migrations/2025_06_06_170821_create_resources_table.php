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
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id') // Links to the user (teacher) who shared the resource
                ->constrained('users')
                ->onDelete('cascade'); // If teacher is deleted, delete their resources

            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path')->nullable(); // Path to the uploaded file in storage
            $table->string('url')->nullable(); // For external links
            $table->string('type')->default('file'); // e.g., 'file', 'link', 'video_embed'
            $table->timestamps(); // created_at, updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resources');
    }
};
