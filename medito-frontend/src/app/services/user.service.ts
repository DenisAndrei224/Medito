import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8000/api/user';

  constructor(private http: HttpClient) {}

  // Update user profile
  updateProfile(profileData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/profile`, profileData);
  }

  // Update avatar
  updateAvatar(file: File): Observable<{ avatar: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<{ avatar: string }>(
      `${this.apiUrl}/user/avatar`,
      formData
    );
  }

  // Get current user
  getCurrentUser(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
