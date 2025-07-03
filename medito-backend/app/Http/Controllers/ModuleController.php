<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ModuleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Course $course)
    {
        // Verify course ownership
        if (Auth::id() !== $course->teacher_id) {
            return response()->json(
                ['error' => 'Unauthorized - You do not own this course'],
                403
            );
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string|max:5000',
            'order' => 'sometimes|integer|min:0',
            'resource_url' => 'nullable|url|max:255'
        ]);

        $module = $course->modules()->create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'order' => $validated['order'] ?? ($course->modules()->count() + 1),
            'resource_url' => $validated['resource_url'] ?? null
        ]);

        return response()->json($module, 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(Course $course, Module $module)
    {
        // Verify module belongs to course
        if ($module->course_id !== $course->id) {
            return response()->json(
                ['error' => 'Module not found in this course'],
                404
            );
        }

        return response()->json(
            $module->load(['course.teacher'])
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course, Module $module)
    {
        // Verify ownership and relationship
        if (Auth::id() !== $course->teacher_id || $module->course_id !== $course->id) {
            return response()->json(
                ['error' => 'Unauthorized - You do not own this resource'],
                403
            );
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'nullable|string|max:5000',
            'order' => 'sometimes|integer|min:0',
            'resource_url' => 'nullable|url|max:255'
        ]);

        $module->update($validated);

        return response()->json($module);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course, Module $module)
    {
        // Verify ownership and relationship
        if (Auth::id() !== $course->teacher_id || $module->course_id !== $course->id) {
            return response()->json(
                ['error' => 'Unauthorized - You do not own this resource'],
                403
            );
        }

        $module->delete();

        // Reorder remaining modules
        $course->modules()
            ->where('order', '>', $module->order)
            ->decrement('order');

        return response()->json([
            'message' => 'Module deleted successfully'
        ]);
    }
}
