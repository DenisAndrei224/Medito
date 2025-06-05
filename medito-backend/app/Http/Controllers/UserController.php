<?php

namespace App\Http\Controllers;

use App\Models\User;
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
                $oldAvatarDbValue = $user->avatar;

                if (filter_var($oldAvatarDbValue, FILTER_VALIDATE_URL)) {
                    $pathToDelete = str_replace(Storage::url(''), '', $oldAvatarDbValue);
                    $pathToDelete = ltrim($pathToDelete, '/');
                } else {
                    $pathToDelete = $oldAvatarDbValue;
                }
                // Ensure we don't accidentally try to delete the default avatar or a non-existent path
                if ($pathToDelete && $pathToDelete !== 'images/default-avatar.jpg' && Storage::disk('public')->exists($pathToDelete)) {
                    Storage::disk('public')->delete($pathToDelete);
                }
            }

            // Store the new avatar file and get its relative path
            // The 'avatars' argument is the directory inside storage/app/public/
            $path = $request->file('avatar')->store('avatars', 'public');

            // Update the user's avatar field in the database with the full URL
            $user->avatar = $path;
            $user->save();

            return response()->json([
                'message' => 'Avatar updated successfully',
                'user' => $user->fresh()
            ], 200);
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

    public function getUsersByRole(Request $request, string $role)
    {
        try {
            if (!in_array($role, ['student', 'teacher', 'admin'])) {
                return response()->json([
                    'message' => 'Invalid role specified',
                ], 400);
            }
            // Get users with the specified role
            $users = User::where('role', $role)
                ->select(['id', 'fullName', 'email', 'role', 'avatar', 'created_at']) // Select only necessary fields
                ->get();

            return response()->json([
                'users' => $users,
                'count' => $users->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching users by role', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
