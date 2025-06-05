<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $fields = $request->validate([
            'fullName' => 'required|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed', // password_confirmation required in the post request
            'role' => 'required|in:student,teacher,admin',
        ]);

        $user = User::create($fields);

        $userData = $fields;
        $userData['avatar'] = null;

        $token = $user->createToken($user->fullName)->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users',
            'password' => 'required'
        ]);

        // This will be used when building an SPA, now we're building an API
        // Auth::attempt([
        //     'email' => $email,
        //     'password' => $password
        // ]);

        $user = User::where('email', $request->email)->first();

        // If the user doesn't exist or the password doesn't correspond
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken($user->fullName)->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }
}
