import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyTeacherPageData } from '../models/my-teacher-page.model';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { Resource } from '../models/resource.model';

@Injectable({
  providedIn: 'root',
})
export class TeacherResourceService {
  private apiUrl = environment.apiUrl; // Your Laravel API base URL

  constructor(private http: HttpClient) {}

  /**
   * Fetches data for the authenticated student's teacher page.
   * @returns Observable<MyTeacherPageData>
   */
  getMyTeacherPage(): Observable<MyTeacherPageData> {
    return this.http.get<MyTeacherPageData>(`${this.apiUrl}/my-teacher-page`);
  }

  /**
   * Fetches the list of students assigned to the authenticated teacher.
   * This is used by the teacher to select students when assigning resources.
   * @returns Observable<{ students: User[] }>
   */
  getMyStudents(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/teacher/students`);
  }

  /**
   * Allows a teacher to upload a new resource (file or link) and assign it to students.
   * @param data FormData for file upload, or object for link.
   * @returns Observable<Resource>
   */
  storeResource(
    data:
      | FormData
      | {
          title: string;
          description?: string;
          type: 'link';
          url: string;
          student_ids: number[];
        }
  ): Observable<{ message: string; resource: Resource }> {
    // If it's FormData (for file upload), Angular HttpClient handles content-type automatically.
    // If it's a plain object (for link), it will be sent as application/json.
    return this.http.post<{ message: string; resource: Resource }>(
      `${this.apiUrl}/teacher/resources`,
      data
    );
  }

  // Helper to get full file path if needed (e.g., from backend's file_path)
  getPublicResourceUrl(filePath: string): string {
    // This assumes your Laravel storage link is correctly set up
    // and public files are served from /storage/
    return `${environment.baseUrl}/storage/${filePath}`;
    // environment.baseUrl should be 'http://localhost:8000' or your domain
  }
}
