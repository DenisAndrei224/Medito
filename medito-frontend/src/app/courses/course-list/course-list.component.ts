import { Component, OnInit } from '@angular/core';
import { CourseService } from 'src/app/services/course.service';
import { Router } from '@angular/router';
import { Course } from 'src/app/models/course.model';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css'],
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private courseService: CourseService, private router: Router) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses; // Now gets the actual array
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading courses:', err);
      },
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/teacher/courses/new']);
  }
}
