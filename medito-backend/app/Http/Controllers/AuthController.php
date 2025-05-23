<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request) {
        $fields = $request->validate([
            'fullName' => 'required|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed', // password_confirmation required in the post request
            'role' => 'required|in:student,teacher,admin'
        ]);

        $user = User::create($fields);

        $token = $user->createToken($request->fullName);

        return [
            'user' => $user,
            'token' => $token->plainTextToken
        ];
    }

    public function login(Request $request) {
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
        if(!$user || !Hash::check($request->password, $user->password)) {
            return [
                'message' => 'The provided credentials are incorrect.'
            ];
        }

        $token = $user->createToken($user->fullName);

        return [
            'user' => $user,
            'token' => $token->plainTextToken
        ];

    }

    public function logout(Request $request) {
        $request->user()->tokens()->delete();
        return [
            'message' => 'You are logged out.'
        ];
    }
}
