import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { pipe, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Course } from '../models/course.model';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) {}

  // Get all courses (for teacher dashboard)
  getCourses(): Observable<Course[]> {
    return this.http.get<{ data: Course[] }>(this.apiUrl).pipe(
      map((response) => response.data), // Extract the array from data property
      catchError((error) => {
        console.error('Error loading courses:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  // Create new course
  createCourse(courseData: {
    title: string;
    description: string;
  }): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, courseData);
  }

  // Update existing course
  updateCourse(
    courseId: number,
    courseData: { title?: string; description?: string }
  ): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${courseId}`, courseData);
  }

  // Assign students to course
  assignStudents(courseId: number, studentIds: number[]): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/${courseId}/students`, {
        student_ids: studentIds,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error assigning students:', error);
          throw error;
        })
      );
  }

  // Get students for a course
  getCourseStudents(courseId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${courseId}/students`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching enrolled students:', error);
        throw error;
      })
    );
  }

  // Optional: Get single course details
  getCourse(courseId: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${courseId}`);
  }
}
