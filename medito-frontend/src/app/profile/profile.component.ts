import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  // Initialize with default values
  user: User = {
    id: 0,
    fullName: '',
    email: '',
    role: '',
    avatar: '',
  };

  isEditing = false;
  isUploading = false;
  errorMessage = '';
  selectedFile: File | null = null;
  previewUrl: string = 'assets/default-avatar.jpg';

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {
    // Safely assign user data
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.user = { ...this.user, ...currentUser };
      this.previewUrl = currentUser.avatar || this.previewUrl;
    }
  }

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile(): void {
    this.userService
      .updateProfile({
        fullName: this.user.fullName,
        email: this.user.email,
      })
      .subscribe({
        next: (response) => {
          this.authService.updateCurrentUser(response.user);
          this.isEditing = false;
        },
        error: (err) => console.error('Update failed', err),
      });
  }

  uploadAvatar(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.errorMessage = '';

    this.userService.updateAvatar(this.selectedFile).subscribe({
      next: (response) => {
        // Update both local state and auth service
        this.user.avatar = response.avatar;
        this.previewUrl = response.avatar;
        this.authService.updateCurrentUser({ avatar: response.avatar });
      },
      error: (err) => {
        this.errorMessage = 'Failed to upload avatar';
        this.previewUrl = this.user?.avatar || 'assets/default-avatar.jpg';
      },
      complete: () => {
        this.isUploading = false;
        this.selectedFile = null;
      },
    });
  }
}
