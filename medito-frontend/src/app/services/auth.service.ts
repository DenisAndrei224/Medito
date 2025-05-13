import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const AUTH_API = 'http://127.0.0.1:8000/api/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

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
    return this.http.post(
      AUTH_API + 'login',
      {
        email,
        password,
      },
      httpOptions
    );
  }
}
