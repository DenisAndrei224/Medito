import { Component, OnInit } from '@angular/core';
import { IncomingRequest } from '../models/incoming-request.model';
import { Observable } from 'rxjs';
import {
  RequestService,
  IncomingRequestsResponse,
} from '../services/request.service';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-requests',
  templateUrl: './my-requests.component.html',
  styleUrls: ['./my-requests.component.css'],
})
export class MyRequestsComponent implements OnInit {
  incomingRequests: IncomingRequest[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private requestService: RequestService,
    private authService: AuthService, // If needed for current user context/authentication check
    private router: Router
  ) {}

  ngOnInit(): void {
    // Ensure user is authenticated before fetching requests
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']); // Redirect if not logged in
      return;
    }
    this.getIncomingRequests();
  }

  getIncomingRequests(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null; // Clear messages on new fetch

    this.requestService.getIncomingRequests().subscribe({
      next: (data: IncomingRequestsResponse) => {
        this.incomingRequests = data.requests; // Laravel returns 'requests' array inside object
        this.isLoading = false;
        if (this.incomingRequests.length === 0) {
          this.successMessage = 'No pending requests at the moment.';
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching incoming requests:', err);
        this.errorMessage = 'Failed to load requests. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  handleRequestAction(requestId: number, action: 'accept' | 'deny'): void {
    this.isLoading = true; // Show loading indicator during action
    this.errorMessage = null;
    this.successMessage = null;

    let action$: Observable<any>;

    if (action === 'accept') {
      action$ = this.requestService.acceptRequest(requestId);
    } else {
      action$ = this.requestService.denyRequest(requestId);
    }

    action$.subscribe({
      next: (response) => {
        this.successMessage =
          response.message || `Request ${action}ed successfully!`;
        // After successful action, refresh the list to reflect changes
        this.getIncomingRequests();
      },
      error: (err: HttpErrorResponse) => {
        console.error(`Error ${action}ing request:`, err);
        this.isLoading = false; // Hide loading
        if (err.status === 404) {
          this.errorMessage = 'Request not found or you are not authorized.';
        } else if (err.status === 400) {
          this.errorMessage =
            err.error.message || `This request cannot be ${action}ed.`;
        } else {
          this.errorMessage = `Failed to ${action} request. Please try again.`;
        }
      },
    });
  }

  acceptRequest(requestId: number): void {
    this.handleRequestAction(requestId, 'accept');
  }

  denyRequest(requestId: number): void {
    this.handleRequestAction(requestId, 'deny');
  }
}
