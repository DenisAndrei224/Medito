import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

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
    console.log('Selected value:', event.target.value);
    this.form.role = event.target.value;
  }

  onSubmit(): void {
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
