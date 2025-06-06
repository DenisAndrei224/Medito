<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Resource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Validation\ValidationException;

class TeacherController extends Controller
{
    public function myTeacherPage(): JsonResponse
    {
        /** @var User $student */ // Helps your IDE with type hinting
        $student = Auth::user();

        // Ensure the authenticated user is a student and has a teacher assigned
        if (!$student || $student->role !== 'student' || !$student->teacher_id) {
            return response()->json([
                'message' => 'Unauthorized or no teacher assigned.',
                'teacher' => null,
                'resources' => [],
            ], 403); // Forbidden
        }

        // Eager load the teacher and their resources
        $teacher = User::where('id', $student->teacher_id)
            ->where('role', 'teacher') // Ensure the linked user is actually a teacher
            ->with(['resources' => function ($query) {
                $query->orderBy('created_at', 'desc'); // Order resources by creation date
            }])
            ->select('id', 'fullName', 'email', 'avatar', 'role') // Select specific teacher columns
            ->first();

        if (!$teacher) {
            return response()->json([
                'message' => 'Assigned teacher not found or is not a teacher.',
                'teacher' => null,
                'resources' => [],
            ], 404); // Not Found
        }

        // Get resources assigned specifically to THIS authenticated student, ordered by creation date
        $assignedResources = $student->assignedResources()->orderBy('created_at', 'desc')->get();

        return response()->json([
            'teacher' => $teacher,
            'resources' => $assignedResources, // Resources are now directly on the teacher object
        ]);
    }

    /**
     * Get all students for the authenticated teacher.
     */
    public function getMyStudents()
    {
        /** @var User $teacher */
        $teacher = Auth::user();

        if (!$teacher || $teacher->role !== User::ROLE_TEACHER) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $students = User::where('teacher_id', $teacher->id)
            ->where('role', User::ROLE_STUDENT)
            ->get();

        return response()->json($students);
    }

    /**
     * Allows a teacher to store a new resource (file or link).
     */
    public function storeResource(HttpRequest $request): JsonResponse
    {
        $teacher = Auth::user();

        // 1. Authorization: Only teachers can add resources
        if (!$teacher || $teacher->role !== 'teacher') {
            return response()->json(['message' => 'Unauthorized to add resources.'], 403);
        }

        // 2. Validation
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:file,link',
            // New: Validate student_ids array
            // It must be an array, and each ID must be an integer that exists in the users table and has role 'student'
            // Additionally, ensure these students are actually assigned to *this* teacher.
            'student_ids' => 'required|array',
            'student_ids.*' => [
                'required',
                'integer',
                'exists:users,id,role,student', // Check if it's a valid student user
                function ($attribute, $value, $fail) use ($teacher) {
                    // Custom validation to ensure the student is actually assigned to this teacher
                    if (!User::where('id', $value)->where('teacher_id', $teacher->id)->exists()) {
                        $fail("The selected student is not assigned to this teacher.");
                    }
                },
            ],
        ];

        // Conditional validation based on resource type
        if ($request->input('type') === 'file') {
            $rules['resource_file'] = 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,rar,jpg,jpeg,png|max:10240'; // Max 10MB
            $rules['url'] = 'nullable'; // URL should be null for file types
        } elseif ($request->input('type') === 'link') {
            $rules['url'] = 'required|url'; // URL must be a valid URL for link types
            $rules['resource_file'] = 'nullable'; // File should be null for link types
        }

        try {
            $validatedData = $request->validate($rules);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422); // Unprocessable Entity
        }

        // 3. Handle Resource Storage
        $filePath = null;
        $resourceURL = null;

        if ($validatedData['type'] === 'file' && $request->hasFile('resource_file')) {
            // Store the file in 'teacher_resources' directory within the 'public' disk
            $filePath = $request->file('resource_file')->store('teacher_resources', 'public');
        } elseif ($validatedData['type'] === 'link') {
            $resourceURL = $validatedData['url'];
        }

        // 4. Create Resource in Database
        $resource = Resource::create([
            'teacher_id' => $teacher->id,
            'title' => $validatedData['title'],
            'description' => $validatedData['description'] ?? null,
            'file_path' => $filePath,
            'url' => $resourceURL,
            'type' => $validatedData['type'],
        ]);

        // 5. Attach Resource to Specific Students (NEW CORE LOGIC)
        // The sync method attaches and detaches models, ensuring only the given IDs remain.
        // It handles adding new associations and removing old ones not in the provided list.
        $resource->students()->sync($validatedData['student_ids']);

        return response()->json([
            'message' => 'Resource added and assigned successfully!',
            'resource' => $resource->load('students:id,fullName'),
        ], 201); // 201 Created
    }
}
