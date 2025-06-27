<?php

use App\Models\User;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BroadcastAuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\TeacherController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth-related routes
    Route::post('/logout', [AuthController::class, 'logout']);

    // User Profile Routes
    Route::prefix('user')->group(function () {
        Route::get('/', fn(Request $request) => $request->user());
        Route::patch('/profile', [UserController::class, 'updateProfile']);
        Route::post('/avatar', [UserController::class, 'updateAvatar']);
    });

    // Teacher Routes
    Route::prefix('teacher')->group(function () {
        Route::get('/my-teacher-page', [TeacherController::class, 'myTeacherPage']);
        Route::post('/resources', [TeacherController::class, 'storeResource']);
        Route::get('/students', [TeacherController::class, 'getMyStudents']);
    });

    // Request Routes
    Route::prefix('requests')->group(function () {
        Route::post('/send', [RequestController::class, 'send']);
        Route::get('/incoming', [RequestController::class, 'incomingRequests']);
        Route::post('/accept', [RequestController::class, 'accept']);
        Route::post('/deny', [RequestController::class, 'deny']);
    });

    // Message Routes
    Route::prefix('messages')->group(function () {
        Route::get('/', [MessageController::class, 'index']);
        Route::post('/', [MessageController::class, 'store']);
        Route::get('/unread-count', [MessageController::class, 'unreadCount']);
    });

    // User Listing Routes
    Route::get('/users/teachers', [UserController::class, 'getTeachers']);

    // Posts resource
    Route::apiResource('posts', PostController::class);

    // Broadcasting Authentication
    Route::post('/broadcasting/auth', [BroadcastAuthController::class, 'authenticate']);
});
