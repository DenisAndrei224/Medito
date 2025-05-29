import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

const AUTH_API = 'http://127.0.0.1:8000/api/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  register(
    fullName: string,
    email: string,
    password: string,
    password_confirmation: string,
    role: string
  ): Observable<any> {
    return this.http.post(
      AUTH_API + 'register',
      {
        fullName,
        email,
        password,
        password_confirmation,
        role,
      },
      httpOptions
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(
        AUTH_API + 'login',
        {
          email,
          password,
        },
        httpOptions
      )
      .pipe(
        tap((response: any) => {
          if (response && response.token) {
            // Store user details and jwt token in local storage
            localStorage.setItem('currentUser', JSON.stringify(response));
            this.currentUserSubject.next(response);
          }
        })
      );
  }

  logout() {
    // Remove user from local storage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Initialize authentication state when app starts
  initializeAuthState() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    this.currentUserSubject.next(user);
  }
}
