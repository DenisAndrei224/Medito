import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from 'src/app/services/course.service';
import { TeacherResourceService } from 'src/app/services/teacher-resource.service';
import { UserService } from 'src/app/services/user.service';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-course-students',
  templateUrl: './course-students.component.html',
  styleUrls: ['./course-students.component.css'],
})
export class CourseStudentsComponent implements OnInit {
  courseId!: number;
  allStudents: User[] = [];
  enrolledStudents: User[] = [];
  selectedStudents: Set<number> = new Set();
  isLoading = true;
  message: string | null = null;
  isError: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private userService: UserService,
    private teacherResourceService: TeacherResourceService
  ) {}

  ngOnInit(): void {
    this.courseId = +this.route.snapshot.params['id'];
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.message = null;
    this.isError = false;

    forkJoin([
      this.teacherResourceService.getMyStudents(),
      this.courseService.getCourseStudents(this.courseId),
    ]).subscribe({
      next: ([acceptedStudents, enrolledStudents]) => {
        this.allStudents = acceptedStudents;
        this.enrolledStudents = enrolledStudents;

        // Initialize selected students
        this.selectedStudents = new Set(
          enrolledStudents.map((student) => student.id)
        );

        if (this.allStudents.length === 0) {
          this.message = 'No students found in the system.';
          this.isError = true;
        }

        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.handleError(err, 'Failed to load student data');
        this.isLoading = false;
      },
    });
  }

  toggleStudentSelection(studentId: number): void {
    if (this.selectedStudents.has(studentId)) {
      this.selectedStudents.delete(studentId);
    } else {
      this.selectedStudents.add(studentId);
    }
  }

  // New method to check if student is enrolled
  isEnrolled(studentId: number): boolean {
    return this.enrolledStudents.some((student) => student.id === studentId);
  }

  saveAssignments(): void {
    this.isLoading = true;
    this.message = null;
    this.isError = false;

    const studentIds = Array.from(this.selectedStudents);
    this.courseService.assignStudents(this.courseId, studentIds).subscribe({
      next: () => {
        this.message = 'Student assignments updated successfully!';
        this.isError = false;
        this.loadStudents(); // Refresh the list
      },
      error: (err: HttpErrorResponse) => {
        this.handleError(err, 'Failed to update student assignments');
        this.isLoading = false;
      },
    });
  }

  private handleError(error: HttpErrorResponse, defaultMessage: string): void {
    if (error.status === 422 && error.error?.errors) {
      // Handle validation errors
      const validationErrors = Object.values(error.error.errors).flat();
      this.message = (validationErrors as string[]).join('<br>');
    } else {
      this.message = error.error?.message || defaultMessage;
    }
    this.isError = true;
    console.error('Error:', error);
  }
}
