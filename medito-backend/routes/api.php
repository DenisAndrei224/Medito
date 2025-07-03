<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\TeacherController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User routes
    Route::prefix('user')->group(function () {
        Route::get('/', fn(Request $request) => $request->user());
        Route::patch('/profile', [UserController::class, 'updateProfile']);
        Route::post('/avatar', [UserController::class, 'updateAvatar']);
    });

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);

    // User management
    Route::prefix('users')->group(function () {
        Route::get('/by-role/{role}', [UserController::class, 'getUsersByRole']);
    });

    // Posts
    Route::apiResource('posts', PostController::class);

    // Requests
    Route::prefix('requests')->group(function () {
        Route::post('/send', [RequestController::class, 'send']);
        Route::get('/incoming', [RequestController::class, 'incomingRequests']);
        Route::post('/accept', [RequestController::class, 'accept']);
        Route::post('/deny', [RequestController::class, 'deny']);
    });

    // Teacher routes
    Route::prefix('teacher')->group(function () {
        Route::get('/my-teacher-page', [TeacherController::class, 'myTeacherPage']);
        Route::post('/resources', [TeacherController::class, 'storeResource']);
        Route::get('/students', [TeacherController::class, 'getMyStudents']);
    });

    // Courses
    Route::apiResource('courses', CourseController::class);

    // Course Students
    Route::post('/courses/{course}/students', [CourseController::class, 'assignStudents']);
    Route::get('/courses/{course}/students', [CourseController::class, 'getEnrolledStudents']);

    // Modules
    Route::apiResource('courses.modules', ModuleController::class)->except(['index'])->shallow();

    // Chat routes
    Route::prefix('chat')->group(function () {
        Route::get('/messages', [ChatController::class, 'getMessages']);
        Route::post('/send', [ChatController::class, 'sendMessage']);
    });
});
