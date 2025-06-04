import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  // Initialize with default values
  user: any = {
    fullName: '',
    email: '',
    role: '',
    avatar: '',
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
        this.user = user;
        this.previewUrl = user.avatar || 'assets/default-avatar.jpg';
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
      next: (response) => {
        this.user.avatar = response.avatar;
        this.previewUrl = response.avatar;
        this.selectedFile = null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error uploading avatar', err);
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
