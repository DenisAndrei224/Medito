import { Component, OnInit } from '@angular/core';
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
    avatar_url: 'assets/default-avatar.jpg',
  };

  isEditing = false;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  isLoading = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = {
          ...user,
          avatar_url: user.avatar_url || 'assets/default-avatar.jpg',
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile', err);
        this.isLoading = false;
      },
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);

      // Upload immediately when file is selected
      this.uploadAvatar();
    }
  }

  uploadAvatar(): void {
    if (!this.selectedFile) return;

    this.isLoading = true;
    this.userService.updateAvatar(this.selectedFile).subscribe({
      next: (updatedUser) => {
        // Use the avatar_url from response which includes full URL
        this.user.avatar_url = updatedUser.avatar_url;
        this.selectedFile = null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error uploading avatar', err);
        this.loadUserProfile();
        this.isLoading = false;
      },
    });
  }

  updateProfile(): void {
    this.isLoading = true;
    this.userService
      .updateProfile({
        fullName: this.user.fullName,
        email: this.user.email,
      })
      .subscribe({
        next: (response) => {
          this.user = response.user;
          this.isEditing = false;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error updating profile', err);
          this.isLoading = false;
        },
      });
  }

  cancelEdit(): void {
    // Reload original data
    this.loadUserProfile();
    this.isEditing = false;
  }
}
