import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // For Reactive Forms
import { ActivatedRoute, Router } from '@angular/router'; // To get ID from URL and for navigation
import { PostService } from '../services/post.service'; // To fetch/update post
import { AuthService } from '../services/auth.service'; // For authorization checks
import { Post } from '../models/post.model'; // Your Post model
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-post-edit',
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.css'],
})
export class PostEditComponent implements OnInit {
  postForm: FormGroup; // Reactive form for editing
  postId: number | null = null; // ID of the post to edit
  originalPost: Post | null = null; // Store original post data for comparison/reference
  loading: boolean = true; // Loading state for fetching data
  submitting: boolean = false; // Submitting state for saving data
  error: string | null = null; // General error message
  successMessage: string | null = null; // Success message after saving

  constructor(
    private fb: FormBuilder, // FormBuilder for easily creating form groups
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private authService: AuthService
  ) {
    // Initialize the form with empty values initially
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      body: ['', Validators.required], // Note: Laravel validation uses 'body', not 'content'
    });
  }

  ngOnInit(): void {
    // Get the post ID from the URL parameters
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.postId = +id; // Convert string ID to number
        this.loadPostForEditing(this.postId);
      } else {
        this.error = 'No post ID provided for editing.';
        this.loading = false;
      }
    });
  }

  loadPostForEditing(id: number): void {
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    this.postService.getPostById(id).subscribe({
      next: (postData: Post) => {
        this.originalPost = postData; // Store original post data

        // Frontend Authorization Check:
        // Ensure the logged-in user is the owner AND a teacher
        const currentUser = this.authService.currentUserValue;
        if (
          !currentUser ||
          currentUser.id !== this.originalPost.user?.id || // Check ownership
          currentUser.role !== 'teacher' // Check role
        ) {
          this.error = 'You are not authorized to edit this post.';
          this.loading = false;
          // Optionally, redirect to post detail or home page
          this.router.navigate(['/posts', this.postId]);
          return;
        }

        // Patch the form with the fetched post data
        this.postForm.patchValue({
          title: postData.title,
          body: postData.body,
        });
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching post for editing:', err);
        if (err.status === 404) {
          this.error = 'Post not found.';
        } else {
          this.error = 'Failed to load post for editing. Please try again.';
        }
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    this.submitting = true;
    this.error = null;
    this.successMessage = null;

    if (this.postForm.invalid) {
      this.error = 'Please fill in all required fields correctly.';
      this.submitting = false;
      return;
    }

    if (this.postId === null) {
      this.error = 'Cannot update post: ID is missing.';
      this.submitting = false;
      return;
    }

    const updatedPostData = this.postForm.value;

    this.postService.updatePost(this.postId, updatedPostData).subscribe({
      next: (responsePost: Post) => {
        this.successMessage = 'Post updated successfully!';
        this.submitting = false;
        // Optionally, navigate back to the post detail page after successful update
        this.router.navigate(['/posts', this.postId]);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error updating post:', err);
        this.submitting = false;
        if (err.status === 422 && err.error.errors) {
          // Validation errors from Laravel
          this.error =
            'Validation errors: ' + Object.values(err.error.errors).join(', ');
        } else if (err.status === 403) {
          this.error = 'You are not authorized to perform this action.';
        } else {
          this.error = 'Failed to update post. Please try again.';
        }
      },
    });
  }

  // Helper to check if a form control has an error
  isInvalid(controlName: string): boolean {
    const control = this.postForm.get(controlName);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }
}
