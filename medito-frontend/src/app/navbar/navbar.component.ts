import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  currentUser$: Observable<User | null>;
  isLoggedIn = false;
  userRole: string = '';

  constructor(public authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      this.userRole = user?.role || '';
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Navigation is already handled in authService
      },
      error: (err) => {
        console.error('Logout error:', err);
        // Force clear and redirect if logout fails
        this.authService.clearAuthData();
        this.router.navigate(['/login']);
      },
    });
  }

  // Helper function to safely access user properties
  getUserName(user: User | null): string {
    return user?.fullName || user?.email || 'Account';
  }

  // Check if user has specific role(s)
  hasRole(role: string | string[]): boolean {
    if (!this.userRole) return false;

    if (Array.isArray(role)) {
      return role.includes(this.userRole);
    }
    return this.userRole === role;
  }
}
