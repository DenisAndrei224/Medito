import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  tap,
  catchError,
  throwError,
  finalize,
  map,
} from 'rxjs';
import { Router } from '@angular/router';

// Types
interface User {
  id: number;
  fullName: string;
  email: string;
  avatar?: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

const API_URL = 'http://127.0.0.1:8000/api/';

// const httpOptions = {
//   headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
// };

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  // Register new user
  register(
    fullName: string,
    email: string,
    password: string,
    password_confirmation: string,
    role: string
  ): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}register`, {
      fullName,
      email,
      password,
      password_confirmation,
      role,
    });
  }

  // Login with email and password
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          // Store user and token in local storage
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  // Logout the user
  logout(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
      Accept: 'application/json',
    });

    return this.http.post(`${API_URL}logout`, {}, { headers }).pipe(
      tap(() => this.clearAuthData()),
      catchError((error) => {
        this.clearAuthData();
        return throwError(error);
      }),
      finalize(() => {
        // Ensure navigation happens after all operations
        this.router.navigate(['/login']);
      })
    );
  }

  public clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Verify if user is authenticated
  isAuthenticated(): boolean {
    return !!this.currentUserValue && !!localStorage.getItem('token');
  }

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('token') || '';
  }

  // Initialize auth state on app start
  initializeAuthState(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (user && this.getToken()) {
      this.currentUserSubject.next(user);
    } else {
      this.logout();
    }
  }

  updateCurrentUser(updatedUserData: Partial<User>): void {
    const currentUser = this.currentUserValue;
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updatedUserData };

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    this.currentUserSubject.next(updatedUser);
  }

  setCurrentUser(user: any): void {
    this.currentUserSubject.next(user);
  }

  isTeacher(): Observable<boolean> {
    return this.currentUserSubject.pipe(
      map((user) => user?.role === 'teacher') // Check if user exists and has 'teacher' role
    );
  }
}
