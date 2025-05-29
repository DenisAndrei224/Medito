import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  form: any = {
    fullName: null,
    email: null,
    password: null,
    password_confirmation: null,
    role: null,
  };

  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  onSelectChange(event: any) {
    this.form.role = event.target.value;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    if (this.form.password !== this.form.password_confirmation) {
      this.isSignUpFailed = true;
      this.errorMessage = 'Passwords do not match';
      return;
    }

    const { fullName, email, password, password_confirmation, role } =
      this.form;

    this.authService
      .register(fullName, email, password, password_confirmation, role)
      .subscribe({
        next: (data) => {
          console.log(data);
          this.isSuccessful = true;
          this.isSignUpFailed = false;
          console.log('User registered successfully!');
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.errorMessage = err.error.message;
          this.isSignUpFailed = true;
        },
      });
  }
}
