<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Validation\ValidationException;

class RequestController extends Controller
{
    public function send(HttpRequest $request)
    {
        // 1. Validate the incoming request
        $request->validate([
            'receiver_id' => 'required|exists:users,id', // Must be present and exist in users table
        ]);

        $senderId = Auth::id(); // Get the ID of the authenticated user (the sender)
        $receiverId = $request->input('receiver_id');

        // 2. Prevent sending request to self
        if ($senderId === $receiverId) {
            throw ValidationException::withMessages([
                'receiver_id' => 'You cannot send a request to yourself.',
            ])->status(400); // Bad Request
        }

        // 3. Check for existing requests (pending, accepted, or denied)
        // Check if a request already exists from sender to receiver
        $existingRequest = Request::where('sender_id', $senderId)
            ->where('receiver_id', $receiverId)
            ->first();

        if ($existingRequest) {
            // Depending on your app logic, you might:
            // a) Return an error if a request already exists in any state
            // b) Allow resending if it was denied/cancelled, but not if pending/accepted
            // For now, let's just say it already exists.
            return response()->json([
                'message' => 'A request already exists between you and this user.',
                'status' => $existingRequest->status // Provide the current status
            ], 409); // Conflict
        }

        // Optional: Check if the receiver has already sent a request to the sender
        // This is important for "friend request" type systems to avoid duplicate requests
        $reverseRequest = Request::where('sender_id', $receiverId)
            ->where('receiver_id', $senderId)
            ->where('status', 'pending') // Only care if it's pending
            ->first();

        if ($reverseRequest) {
            // If the receiver has already sent a pending request to the sender,
            // you might choose to automatically accept it or just inform the sender.
            // For simplicity, let's just inform for now.
            return response()->json([
                'message' => 'This user has already sent you a pending request. You can accept it from your requests list.',
            ], 409); // Conflict
        }


        // 4. Create the new request
        $newRequest = Request::create([
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'status' => 'pending', // Default status is 'pending'
        ]);

        // 5. Return a success response
        return response()->json([
            'message' => 'Request sent successfully!',
            'request' => $newRequest,
        ], 201); // 201 Created
    }

    public function incomingRequests(): JsonResponse
    {
        $userId = Auth::id();
        $requests = Request::where('receiver_id', $userId)
            ->with('sender:id,fullName,avatar') // Eager load sender's name and avatar
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'requests' => $requests,
        ]);
    }

    public function accept(HttpRequest $request): JsonResponse
    {
        $validatedData = $request->validate([
            'request_id' => 'required|exists:requests,id,receiver_id,' . Auth::id(), // Ensure the request exists and is for the logged-in user
        ]);

        $existingRequest = Request::find($request->input('request_id'));

        if (!$existingRequest) {
            return response()->json(['message' => 'Request not found or you are not authorized.'], 404);
        }

        if ($existingRequest->status !== 'pending') {
            return response()->json(['message' => 'This request cannot be accepted as its status is not pending.'], 400);
        }

        $student = User::find($existingRequest->sender_id);
        $teacher = Auth::user();

        // Basic sanity checks for roles (highly recommended for robustness)
        if (!$student || $student->role !== 'student') {
            Log::warning("Attempted to accept request where sender is not a student. Request ID: {$existingRequest->id}, Sender ID: {$existingRequest->sender_id}");
            // You might choose to return an error, or just skip assignment if it's an edge case
            // For production, consider throwing an error or a more specific 400 response
            return response()->json(['message' => 'Invalid sender role for request acceptance.'], 400);
        }

        if (!$teacher || $teacher->role !== 'teacher') {
            Log::warning("Authenticated user is not a teacher attempting to accept request. User ID: {$teacher->id}");
            return response()->json(['message' => 'Only teachers can accept requests.'], 403);
        }

        // 3. Assign the teacher_id to the student
        $student->teacher_id = $teacher->id;
        $student->save(); // Persist the change to the database

        $existingRequest->status = 'accepted';
        $existingRequest->save();

        return response()->json(['message' => 'Request accepted successfully.']);
    }

    public function deny(HttpRequest $request): JsonResponse
    {
        $request->validate([
            'request_id' => 'required|exists:requests,id,receiver_id,' . Auth::id(), // Ensure the request exists and is for the logged-in user
        ]);

        $existingRequest = Request::find($request->input('request_id'));

        if (!$existingRequest) {
            return response()->json(['message' => 'Request not found or you are not authorized.'], 404);
        }

        if ($existingRequest->status !== 'pending') {
            return response()->json(['message' => 'This request cannot be denied as its status is not pending.'], 400);
        }

        $existingRequest->status = 'denied';
        $existingRequest->save();

        return response()->json(['message' => 'Request denied successfully.']);
    }
}
