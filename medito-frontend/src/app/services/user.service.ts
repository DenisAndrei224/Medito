import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Update user profile
  updateProfile(profileData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/user/profile`, profileData);
  }

  // Update avatar
  updateAvatar(file: File): Observable<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<{ avatar_url: string }>(
      `${this.apiUrl}/user/avatar`,
      formData
    );
  }

  // Get current user
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`);
  }

  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/by-role/${role}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching students:', error);
        throw error; // Let component handle the error
      })
    );
  }
}
