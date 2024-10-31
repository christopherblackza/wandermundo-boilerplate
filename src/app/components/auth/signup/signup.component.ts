import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    StepsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  steps: MenuItem[] = [];
  currentStep = 0;
  loading = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      full_name: ['', Validators.required],
      whatsapp_number: ['', Validators.required],
      about_nomad: ['', [Validators.required, Validators.maxLength(500)]],
      country: ['', Validators.required],
      heard_from: ['', Validators.required],
      referred_by: [''],
      comments: ['']
    });
  }

  ngOnInit() {
    this.initializeSteps();
  }

  initializeSteps() {
    this.steps = [
      { label: 'Account' },
      { label: 'Personal Info' },
      { label: 'Nomad Life' },
      { label: 'Community' }
    ];
  }

  get f() { return this.signupForm.controls; }

  nextStep() {
    if (this.isStepValid()) {
      this.currentStep++;
    }
  }

  previousStep() {
    this.currentStep--;
  }

  isStepValid(): boolean {
    switch (this.currentStep) {
      case 0:
        return this.f['email'].valid && this.f['password'].valid;
      case 1:
        return this.f['full_name'].valid && this.f['whatsapp_number'].valid;
      case 2:
        return this.f['about_nomad'].valid && this.f['country'].valid;
      case 3:
        return this.f['heard_from'].valid;
      default:
        return true;
    }
  }

  async onSubmit() {
    if (this.signupForm.invalid) {
      return;
    }

    this.loading = true;
    try {
      const { error } = await this.authService.signUp(
        this.f['email'].value, 
        this.f['password'].value,
        {
          full_name: this.f['full_name'].value,
          whatsapp_number: this.f['whatsapp_number'].value,
          about_nomad: this.f['about_nomad'].value,
          country: this.f['country'].value,
          heard_from: this.f['heard_from'].value,
          referred_by: this.f['referred_by'].value,
          comments: this.f['comments'].value
        }
      );

      if (error) throw error;
      this.toastr.success('Sign up successful! Please check your email for verification.', 'Success');
    } catch (error: any) {
      console.error('Error signing up:', error);
      this.toastr.error(error.message || 'An error occurred during sign up', 'Sign Up Failed');
    } finally {
      this.loading = false;
    }
  }
}