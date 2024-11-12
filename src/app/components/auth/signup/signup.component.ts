import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import parsePhoneNumberFromString, { CountryCode, isValidPhoneNumber } from 'libphonenumber-js';
import { ToastrService } from 'ngx-toastr';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { StepsModule } from 'primeng/steps';

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
    InputTextareaModule,
    DropdownModule,
    RadioButtonModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  steps: MenuItem[] = [];
  currentStep = 0;
  loading = false;

  genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' }
  ];

  phoneCountryCodes = [
    { name: 'Belgium', dial_code: '+32', code: 'BE' },
    { name: 'Brazil', dial_code: '+55', code: 'BR' },
    { name: 'Germany', dial_code: '+49', code: 'DE' },
    { name: 'India', dial_code: '+91', code: 'IN' },
    { name: 'Italy', dial_code: '+39', code: 'IT' },
    { name: 'Mexico', dial_code: '+52', code: 'MX' },
    { name: 'Netherlands', dial_code: '+31', code: 'NL' },
    { name: 'Portugal', dial_code: '+351', code: 'PT' },
    { name: 'South Africa', dial_code: '+27', code: 'ZA' },
    { name: 'Spain', dial_code: '+34', code: 'ES' },
    { name: 'Sweden', dial_code: '+46', code: 'SE' },
    { name: 'Switzerland', dial_code: '+41', code: 'CH' },
    { name: 'United Kingdom', dial_code: '+44',  code: 'GB' },
    { name: 'United States', dial_code: '+1', code: 'US' }
  ];
  countries: any[] = [
    { name: 'Australia', code: 'AU' },
    { name: 'Belgium', code: 'BE' },
    { name: 'Brazil', code: 'BR' },
    { name: 'Canada', code: 'CA' },
    { name: 'France', code: 'FR' },
    { name: 'Germany', code: 'DE' },
    { name: 'India', code: 'IN' },
    { name: 'Italy', code: 'IT' },
    { name: 'Japan', code: 'JP' },
    { name: 'Netherlands', code: 'NL' },
    { name: 'Portugal', code: 'PT' },
    { name: 'South Africa', code: 'ZA' },
    { name: 'Spain', code: 'ES' },
    { name: 'Sweden', code: 'SE' },
    { name: 'Switzerland', code: 'CH' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'United States', code: 'US' }
  ];

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      full_name: ['', Validators.required],
      display_name: ['', Validators.required],
      about_nomad: ['', [Validators.required, Validators.maxLength(500)]],
      country: ['', Validators.required],
      heard_from: ['', Validators.required],
      referred_by: [''],
      gender: ['', Validators.required],
      comments: [''],
      occupation: ['', Validators.required],
      website: [''],
      phoneCountryCode: [''],
      whatsapp_number: [''],
      // phoneCountryCode: ['', Validators.required],
      // whatsapp_number: ['', [
      //   Validators.required,
      //   this.phoneNumberValidator()
      // ]],
    });
  }

  ngOnInit() {
    this.initializeSteps();
  }

  phoneNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const countryCode = this.signupForm?.get('phoneCountryCode')?.value?.code;
      if (!countryCode) return { invalidPhone: true };

      try {
        const phoneNumber = parsePhoneNumberFromString(
          control.value,
          countryCode as CountryCode
        );

        if (!phoneNumber) {
          return { invalidPhone: true };
        }

        const isValid = isValidPhoneNumber(phoneNumber.number);
        if (!isValid) {
          return { invalidPhone: true };
        }

        return null;
      } catch (e) {
        return { invalidPhone: true };
      }
    };
  }

  getFullPhoneNumber(): string | null {
    try {
      const countryCode = this.signupForm.get('phoneCountryCode')?.value?.code;
      const number = this.signupForm.get('whatsapp_number')?.value;

      if (!countryCode || !number) return null;

      const phoneNumber = parsePhoneNumberFromString(number, countryCode as CountryCode);
      return phoneNumber?.format('E.164') || null; // Returns format like +14155552671
    } catch (e) {
      return null;
    }
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
        return this.f['full_name'].valid && this.f['gender'].valid;
      case 2:
        return this.f['about_nomad'].valid && this.f['country'].valid && this.f['occupation'].valid;
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

    const fullPhoneNumber = this.getFullPhoneNumber();
    // if (!fullPhoneNumber) {
    //   console.log('Invalid phone number');
    //   // Handle invalid phone number
    //   return;
    // }

    this.loading = true;
    try {
      const { error } = await this.authService.signUp(
        this.f['email'].value,
        this.f['password'].value,
        {
          full_name: this.f['full_name'].value,
          whatsapp_number: fullPhoneNumber ?? '',
          about_nomad: this.f['about_nomad'].value,
          display_name: this.f['display_name'].value,
          country: this.f['country'].value,
          heard_from: this.f['heard_from'].value,
          referred_by: this.f['referred_by'].value,
          comments: this.f['comments'].value,
          occupation: this.f['occupation'].value,
          website: this.f['website'].value
        }
      );

      if (error) throw error;
      this.toastr.success('Sign up successful! Please check your email for verification.', 'Success');

      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Error signing up:', error);
      this.toastr.error(error.message || 'An error occurred during sign up', 'Sign Up Failed');
    } finally {
      this.loading = false;
    }
  }
}