import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { User } from '../models/user.model';
import { MessageService } from '../services/message.service'; // Add this import
import { EchoService } from '../services/echo.service';
import { Message, PusherError } from '../models/message.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  isLoggedIn = false;
  userRole: string = '';
  unreadCount = 0;

  private refreshInterval: any;

  private channel: any;

  constructor(
    public authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private echoService: EchoService
  ) {
    this.currentUser$ = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      this.userRole = user?.role || '';

      if (this.isLoggedIn && user) {
        // this.loadUnreadCount();
        this.setupMessageListener(user.id);
      } else {
        this.cleanupMessageListener();
      }
    });
  }

  private setupMessageListener(userId: number): void {
    // Clean up any existing listener first
    this.cleanupMessageListener();

    this.channel = this.echoService
      .privateChannel(userId)
      .listen('.message.sent', (data: any) => {
        // this.loadUnreadCount();
      })
      .error((error: any) => {
        console.error('Pusher error:', error);
      });
  }

  private cleanupMessageListener(): void {
    if (this.channel) {
      this.channel.stopListening('.message.sent');
      if (this.isLoggedIn && this.authService.currentUserValue?.id) {
        this.echoService.leaveChannel(this.authService.currentUserValue.id);
      }
      this.channel = null;
    }
  }

  // private loadUnreadCount(): void {
  //   this.messageService.getUnreadCount().subscribe((count) => {
  //     this.unreadCount = count;
  //   });
  // }

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

  ngOnDestroy(): void {
    this.cleanupMessageListener();
  }
}
