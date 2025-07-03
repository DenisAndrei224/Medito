import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService } from 'src/app/services/course.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-course-form',
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.css'],
})
export class CourseFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  courseId?: number;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.courseId = +params['id'];

        // Load course data for editing
        this.courseService.getCourse(this.courseId).subscribe({
          next: (course) => {
            this.form.patchValue({
              title: course.title,
              description: course.description,
            });
          },
          error: (err) => console.error('Error loading course', err),
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const operation = this.isEditMode
      ? this.courseService.updateCourse(this.courseId!, this.form.value)
      : this.courseService.createCourse(this.form.value);

    operation.subscribe({
      next: () => this.router.navigate(['/teacher/courses']),
      error: (err) => console.error('Error saving course', err),
    });
  }
}
