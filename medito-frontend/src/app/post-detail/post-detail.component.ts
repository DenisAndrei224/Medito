import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
import { PostService } from '../services/post.service'; // Adjust path if needed
import { RequestService } from '../services/request.service';
import { AuthService } from '../services/auth.service';
import { Post } from '../models/post.model'; // Assuming you have a Post model/interface
import { User } from '../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null; // Holds the fetched post data
  postId: number | null = null; // Stores the ID from the URL
  loading: boolean = true; // Indicates if data is being loaded
  error: string | null = null; // Stores any error messages

  currentUserId: number | null = null;

  isRequestSending: boolean = false; // <--- NEW: State for request button loading
  requestSentMessage: string | null = null; // <--- NEW: Message after sending request
  requestErrorMessage: string | null = null; // <--- NEW: Error message for request

  constructor(
    private route: ActivatedRoute, // Inject ActivatedRoute to access URL parameters
    private postService: PostService, // Inject PostService to call the API
    private requestService: RequestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user) => {
      this.currentUserId = user ? user.id : null;
    });

    // Subscribe to route parameter changes. This is important if a user navigates
    // from /posts/1 to /posts/2 without leaving the component.
    this.route.paramMap.subscribe((params) => {
      this.loading = true; // Reset loading state
      this.error = null; // Clear previous errors
      this.requestSentMessage = null; // Clear messages on route change
      this.requestErrorMessage = null; // Clear messages on route change

      // Get the 'id' parameter from the URL
      const id = params.get('id');

      if (id) {
        this.postId = +id; // Convert the string ID from the URL to a number
        this.getPostDetails(this.postId); // Call method to fetch post details
      } else {
        // Handle case where no ID is provided in the URL
        this.error = 'No post ID provided in the URL.';
        this.loading = false;
      }
    });
  }

  getPostDetails(id: number): void {
    this.postService.getPostById(id).subscribe({
      next: (data: Post) => {
        // On successful data retrieval
        this.post = data; // Assign the fetched post data
        this.loading = false; // Set loading to false
      },
      error: (err) => {
        // On error during data retrieval
        console.error('Error fetching post details:', err); // Log the full error to console
        this.error = 'Failed to load post details. Please try again later.'; // User-friendly error message
        this.loading = false; // Set loading to false
      },
    });
  }

  sendRequest(): void {
    if (
      !this.post ||
      !this.post.user ||
      !this.post.user.id ||
      !this.currentUserId
    ) {
      this.requestErrorMessage =
        'Cannot send request: Post or current user information missing.';
      return;
    }

    this.isRequestSending = true;
    this.requestSentMessage = null;
    this.requestErrorMessage = null;

    const receiverId = this.post.user.id;

    this.requestService.sendRequest(receiverId).subscribe({
      next: (response) => {
        this.requestSentMessage =
          response.message || 'Request sent successfully!';
        this.isRequestSending = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isRequestSending = false;
        if (err.status === 409) {
          this.requestErrorMessage =
            err.error.message || 'A request already exists.';
        } else if (err.status === 400) {
          this.requestErrorMessage = err.error.message || 'Invalid request.';
        } else {
          this.requestErrorMessage =
            'Failed to send request. Please try again.';
        }
        console.error('Error sending request:', err);
      },
    });
  }

  showSendRequestButton(): boolean {
    return (
      this.post !== null &&
      this.post.user !== undefined &&
      this.post.user.id !== undefined &&
      this.currentUserId !== null &&
      this.post.user.id !== this.currentUserId
    );
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
