<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Events\NewMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class ChatController extends Controller
{
    /**
     * Send a new message
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'receiver_id' => 'required|exists:users,id'
        ]);

        // Temporary workaround:
        $message = new Message([
            'receiver_id' => $request->receiver_id,
            'message' => $request->input('message')
        ]);

        $message->save();

        broadcast(new NewMessage($message))->toOthers();

        return response()->json([
            'status' => 'success',
            'message' => $message
        ]);
    }

    /**
     * Get recent messages
     */
    public function getMessages(): JsonResponse
    {
        $messages = Message::with('user')
            ->latest()
            ->take(50)
            ->get();

        return response()->json($messages);
    }
}
