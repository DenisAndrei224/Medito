<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
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

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // User routes
    Route::prefix('user')->group(function () {
        Route::get('/', function (Request $request) {
            return $request->user();
        });

        // Profile update route
        Route::patch('/profile', [UserController::class, 'updateProfile']);

        // Avatar upload route
        Route::post('/avatar', [UserController::class, 'updateAvatar']);
    });

    // Logout route
    Route::post('/logout', [AuthController::class, 'logout']);



    // Posts resource
    Route::apiResource('posts', PostController::class);

    Route::post('/requests/send', [RequestController::class, 'send']);
    Route::get('/requests/incoming', [RequestController::class, 'incomingRequests']);
    Route::post('/requests/accept', [RequestController::class, 'accept']);
    Route::post('/requests/deny', [RequestController::class, 'deny']);

    Route::get('/my-teacher-page', [TeacherController::class, 'myTeacherPage']);

    Route::post('/teacher/resources', [TeacherController::class, 'storeResource']);

    Route::get('/teacher/students', [TeacherController::class, 'getMyStudents']); // Added route for fetching students for teacher
});
