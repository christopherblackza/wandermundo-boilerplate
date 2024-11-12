import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SupabaseService } from '../../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private supabaseService: SupabaseService, 
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  get f() { return this.loginForm.controls; }

  async onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    // try {
    //   const { error } = await this.supabaseService.signIn(this.f['email'].value, this.f['password'].value);
    //   if (error) throw error;
    //   this.toastr.success('Login successful!', 'Welcome');
    //   this.router.navigate(['/']);
    // } catch (error: any) {
    //   console.error('Error logging in:', error);
    //   this.toastr.error(error.message || 'An error occurred during login', 'Login Failed');
    // }
    try {
      const { error } = await this.authService.signIn(this.f['email'].value, this.f['password'].value);
      if (error) throw error;
      // this.toastr.success('Login successful!', 'Welcome');
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('Error logging in:', error);
      this.toastr.error(error.message || 'An error occurred during login', 'Login Failed');
    }
  }
}