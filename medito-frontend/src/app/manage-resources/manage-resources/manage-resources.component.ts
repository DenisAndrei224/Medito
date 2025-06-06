import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { TeacherResourceService } from '../../services/teacher-resource.service'; // Use your new service!
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../models/user.model'; // Import User model
import { Resource } from '../../models/resource.model'; // Import Resource model

@Component({
  selector: 'app-manage-resources',
  templateUrl: './manage-resources.component.html',
  styleUrls: ['./manage-resources.component.css'],
})
export class ManageResourcesComponent implements OnInit {
  resourceForm!: FormGroup;
  students: User[] = [];
  selectedFile: File | null = null;
  resourceTypes = [
    { value: 'file', viewValue: 'File' },
    { value: 'link', viewValue: 'Link' },
  ];

  message: string | null = null; // New property to hold messages
  isError: boolean = false; // New property to indicate if message is an error

  constructor(
    private fb: FormBuilder,
    private teacherResourceService: TeacherResourceService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.fetchStudents();

    this.resourceForm.get('type')?.valueChanges.subscribe((type) => {
      this.updateValidators(type);
    });
  }

  private initializeForm(): void {
    this.resourceForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      type: ['file', Validators.required],
      resource_file: [null],
      url: [''],
      student_ids: this.fb.array([], Validators.required),
    });
    this.updateValidators('file');
  }

  private updateValidators(type: string): void {
    const fileControl = this.resourceForm.get('resource_file');
    const urlControl = this.resourceForm.get('url');

    if (type === 'file') {
      fileControl?.setValidators(Validators.required);
      urlControl?.clearValidators();
    } else {
      // type === 'link'
      fileControl?.clearValidators();
      urlControl?.setValidators([
        Validators.required,
        Validators.pattern('^(https?|ftp)://[^\\s/$.?#].[^\\s]*$'),
      ]);
    }
    fileControl?.updateValueAndValidity();
    urlControl?.updateValueAndValidity();
  }

  private fetchStudents(): void {
    this.message = null; // Clear previous messages
    this.isError = false;

    this.teacherResourceService.getMyStudents().subscribe({
      next: (data: User[]) => {
        this.students = data;
        if (this.students.length === 0) {
          this.message =
            'No students found under your account. You cannot assign resources.';
          this.isError = true; // Consider this an informative error for the teacher
        }
      },
      error: (err: HttpErrorResponse) => {
        this.message =
          'Error fetching students: ' + (err.error?.message || err.statusText);
        this.isError = true;
        console.error('Error fetching students', err);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.resourceForm.get('resource_file')?.setValue(this.selectedFile.name);
    } else {
      this.selectedFile = null;
      this.resourceForm.get('resource_file')?.setValue(null);
    }
  }

  onStudentSelectionChange(event: Event, studentId: number): void {
    const checked = (event.target as HTMLInputElement).checked;
    const studentIdsArray = this.resourceForm.get('student_ids') as FormArray;

    if (checked) {
      studentIdsArray.push(this.fb.control(studentId));
    } else {
      const index = studentIdsArray.controls.findIndex(
        (control) => control.value === studentId
      );
      if (index >= 0) {
        studentIdsArray.removeAt(index);
      }
    }
  }

  onSubmit(): void {
    this.message = null; // Clear previous messages
    this.isError = false;
    this.resourceForm.markAllAsTouched();

    if (this.resourceForm.invalid) {
      this.message =
        'Please fill in all required fields and select at least one student.';
      this.isError = true;
      return;
    }

    const resourceType = this.resourceForm.get('type')?.value;

    let submitData:
      | FormData
      | {
          title: string;
          description?: string;
          type: 'link';
          url: string;
          student_ids: number[];
        };

    if (resourceType === 'file') {
      const formData = new FormData();
      formData.append('title', this.resourceForm.get('title')?.value);
      formData.append(
        'description',
        this.resourceForm.get('description')?.value
      );
      formData.append('type', resourceType);
      if (this.selectedFile) {
        formData.append(
          'resource_file',
          this.selectedFile,
          this.selectedFile.name
        );
      }
      const studentIds = this.resourceForm.get('student_ids')?.value;
      studentIds.forEach((id: number) => {
        formData.append('student_ids[]', id.toString());
      });
      submitData = formData;
    } else {
      // type === 'link'
      submitData = {
        title: this.resourceForm.get('title')?.value,
        description: this.resourceForm.get('description')?.value,
        type: 'link',
        url: this.resourceForm.get('url')?.value,
        student_ids: this.resourceForm.get('student_ids')?.value,
      };
    }

    this.teacherResourceService.storeResource(submitData).subscribe({
      next: (response) => {
        this.message =
          response.message || 'Resource created and assigned successfully!';
        this.isError = false;
        this.resourceForm.reset({ type: 'file' });
        this.selectedFile = null;
        (this.resourceForm.get('student_ids') as FormArray).clear();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 422 && err.error && err.error.errors) {
          // If Laravel returns validation errors
          const validationErrors = Object.values(err.error.errors).flat();
          this.message = (validationErrors as string[]).join('<br>');
        } else {
          this.message =
            err.error?.message ||
            err.statusText ||
            'An unknown error occurred.';
        }
        this.isError = true;
        console.error('Error storing resource', err);
      },
    });
  }

  get f() {
    return this.resourceForm.controls;
  }
  get studentIdsArray() {
    return this.resourceForm.get('student_ids') as FormArray;
  }
}
