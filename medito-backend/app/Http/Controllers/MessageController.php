<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use App\Events\PrivateMessageSent;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $contactId = $request->input('contact_id');

        return Message::where(function ($q) use ($userId, $contactId) {
            $q->where('sender_id', $userId)
                ->where('receiver_id', $contactId);
        })
            ->orWhere(function ($q) use ($userId, $contactId) {
                $q->where('sender_id', $contactId)
                    ->where('receiver_id', $userId);
            })
            ->with('sender')
            ->orderBy('created_at')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate(['content' => 'required', 'receiver_id' => 'required|exists:users,id']);

        $message = $request->user()->sentMessages()->create([
            'receiver_id' => $request->receiver_id,
            'content' => $request->content
        ]);

        broadcast(new PrivateMessageSent($message))->toOthers();

        return response()->json($message->load('sender'), 201);
    }

    public function markAsRead(Message $message)
    {
        $message->update(['read' => true]);
        return response()->json(['status' => 'success']);
    }
}
