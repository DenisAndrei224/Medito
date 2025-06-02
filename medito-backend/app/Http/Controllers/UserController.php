<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Update user avatar
     */
    public function updateAvatar(Request $request)
    {
        // Debug: Log the incoming request
        Log::debug('Avatar upload initiated', [
            'user_id' => $request->user()->id,
            'file' => $request->file('avatar') ? $request->file('avatar')->getClientOriginalName() : null
        ]);

        try {
            $validated = $request->validate([
                'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            $user = $request->user();

            // Delete old avatar if exists
            if ($user->avatar) {
                Log::debug('Attempting to delete old avatar', ['path' => $user->avatar]);
                Storage::delete(str_replace('/storage', 'public', $user->avatar));
            }

            // Store new avatar
            $path = $request->file('avatar')->store('public/avatars');
            $url = Storage::url($path);

            $user->avatar = $url;
            $user->save();

            Log::info('Avatar updated successfully', [
                'user_id' => $user->id,
                'new_path' => $url
            ]);

            return response()->json([
                'avatar' => $url,
                'message' => 'Avatar updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Avatar update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Avatar update failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
