import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user.model';
import { Resource } from '../../models/resource.model';
import { TeacherResourceService } from '../../services/teacher-resource.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-teacher-page',
  templateUrl: './my-teacher-page.component.html',
  styleUrls: ['./my-teacher-page.component.css'],
})
export class MyTeacherPageComponent implements OnInit {
  teacher: User | null = null;
  resources: Resource[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private teacherResourceService: TeacherResourceService,
    private router: Router // Inject Router for navigation if needed
  ) {}

  ngOnInit(): void {
    this.loadMyTeacherPageData();
  }

  loadMyTeacherPageData(): void {
    this.loading = true;
    this.error = null;
    this.teacherResourceService.getMyTeacherPage().subscribe({
      next: (data) => {
        this.teacher = data.teacher;
        this.resources = data.resources;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.status === 403) {
          this.error =
            'You are not authorized to view this page, or you do not have an assigned teacher.';
          // Optionally redirect non-students or students without teachers
          // this.router.navigate(['/dashboard']);
        } else if (err.status === 404) {
          this.error = 'Your assigned teacher was not found.';
        } else {
          this.error = 'Failed to load teacher page. Please try again later.';
          console.error('Error fetching teacher page:', err);
        }
      },
    });
  }

  getResourceUrl(resource: Resource): string {
    if (resource.type === 'file' && resource.file_path) {
      // Assuming your Laravel backend serves public files from /storage/
      return this.teacherResourceService.getPublicResourceUrl(
        resource.file_path
      );
    } else if (resource.type === 'link' && resource.url) {
      return resource.url;
    }
    return '#'; // Fallback
  }

  openResource(resource: Resource): void {
    const url = this.getResourceUrl(resource);
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  }
}
