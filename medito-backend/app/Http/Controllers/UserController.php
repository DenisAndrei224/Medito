<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log; // Still needed for error logging
use Illuminate\Validation\ValidationException; // Used for specific validation error handling

class UserController extends Controller
{
    /**
     * Update user profile
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();

            $validated = $request->validate([
                'fullName' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            ]);

            $user->update($validated);

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $user->fresh(), // Use fresh() to ensure all latest attributes are returned
            ]);
        } catch (ValidationException $e) {
            // Log validation errors for internal debugging, but don't expose sensitive info to user
            Log::error('Profile update validation failed', [
                'user_id' => $request->user()->id ?? 'Guest',
                'errors' => $e->errors(),
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422); // 422 Unprocessable Entity
        } catch (\Exception $e) {
            // Log any unexpected server errors
            Log::error('Profile update failed unexpectedly', [
                'user_id' => $request->user()->id ?? 'Guest',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Profile update failed due to a server error.',
            ], 500);
        }
    }

    /**
     * Update user avatar
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateAvatar(Request $request)
    {
        try {
            // Validate the incoming file
            $validated = $request->validate([
                'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
            ]);

            $user = $request->user(); // Get the authenticated user

            // Delete the old avatar if it exists
            if ($user->avatar) {
                // Parse the full URL to get the storage path
                $oldAvatarPath = str_replace('/storage/', 'public/', parse_url($user->avatar, PHP_URL_PATH));
                $oldAvatarPath = ltrim($oldAvatarPath, '/'); // Remove any leading slash

                if (Storage::exists($oldAvatarPath)) {
                    Storage::delete($oldAvatarPath);
                }
            }

            // Store the new avatar
            // This returns the internal storage path (e.g., 'public/avatars/unique_filename.jpg')
            $storedPath = $request->file('avatar')->store('public/avatars');

            // Generate the full public URL for the new avatar
            // Make sure APP_URL in your .env is set correctly (e.g., http://localhost:8000)
            $publicUrl = config('app.url') . Storage::url($storedPath);

            // Update the user's avatar field in the database with the full URL
            $user->avatar = $publicUrl;
            $user->save();

            return response()->json([
                'avatar' => $publicUrl, // Return the full URL to the frontend
                'message' => 'Avatar updated successfully'
            ]);
        } catch (ValidationException $e) {
            // Log validation errors
            Log::error('Avatar upload validation failed', [
                'user_id' => $request->user()->id ?? 'Guest',
                'errors' => $e->errors(),
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422); // 422 Unprocessable Entity
        } catch (\Exception $e) {
            // Log any unexpected server errors during the process
            Log::error('Avatar update failed unexpectedly', [
                'user_id' => $request->user()->id ?? 'Guest',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Avatar update failed due to a server error. Please try again.',
            ], 500);
        }
    }
}
