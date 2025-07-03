<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'data' => Course::with(['teacher', 'modules'])->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!Auth::check() || Auth::user()->role !== 'teacher') {
            return response()->json(
                ['error' => 'Unauthorized - Only teachers can create courses'],
                403
            );
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $course = Course::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'teacher_id' => Auth::id(),
        ]);

        return response()->json($course, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        return response()->json(
            $course->load(['teacher', 'modules'])
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course)
    {
        if (Auth::id() !== $course->teacher_id) {
            return response()->json(
                ['error' => 'Unauthorized - You do not own this course'],
                403
            );
        }

        $course->update(
            $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string|max:1000',
            ])
        );

        return response()->json($course);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        if (Auth::id() !== $course->teacher_id) {
            return response()->json(
                ['error' => 'Unauthorized - You do not own this course'],
                403
            );
        }

        $course->delete();

        return response()->json([
            'message' => 'Course deleted successfully'
        ]);
    }

    public function assignStudents(Request $request, Course $course)
    {
        $request->validate(['student_ids' => 'required|array']);
        $course->students()->sync($request->student_ids);
        return response()->json(['message' => 'Students assigned successfully']);
    }

    public function getEnrolledStudents(Course $course)
    {
        return response()->json($course->students);
    }
}
