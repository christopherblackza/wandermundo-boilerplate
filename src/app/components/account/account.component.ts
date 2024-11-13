import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { User } from '@supabase/supabase-js';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { ToastrService } from 'ngx-toastr';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';
import { NavbarComponent } from '../navbar/navbar.component';

// PrimeNG imports
@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarComponent,
    ImageCropperComponent,
    InputTextModule,
    ButtonModule,
    DialogModule
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  loading = false;


  // user: User | null = null;
  user: User | null = null;
  private unsubscribe$: Subject<void> = new Subject<void>();
  avatarUrl: string | null = null;
  private avatarFile: File | null = null;

  constructor(
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private supabaseService: SupabaseService,
    private toastr: ToastrService
  ) {
    this.profileForm = this.formBuilder.group({
      full_name: ['', Validators.required],
      display_name: [''],
      website: [''],
      occupation: ['', Validators.required],
      whatsapp_number: [''],
      avatar_url: ['']
    });
  }

  ngOnInit() {
    this.authService.userSubject$
    .pipe(takeUntil(this.unsubscribe$))  // Automatically unsubscribe when destroyed
    .subscribe(user => {
      this.user = user;
      

      this.loadUserProfile();
    });
    
  }

  ngOnDestroy(): void {
    // Trigger unsubscribe to clean up the subscription
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.avatarUrl) {
      URL.revokeObjectURL(this.avatarUrl);
    }
  }

  loadUserProfile() {
    console.log('loading user profile');
    this.loading = true;

      if (this.user) {
    

        this.authService.getProfile(this.user.id).then(({ data, error }) => {
          if (error) {
            this.toastr.error('Error loading profile', 'Profile Error');
          } else if (data) {
            console.error('data', data);
            this.avatarUrl = data.avatar_url;
            this.profileForm.patchValue(data);

    
          }
          this.loading = false;
        });
      } 
     
      
  }



  loadImageFailed() {
    this.toastr.error('Failed to load image');
  }

  // async onSubmit() {
  //   console.log('submitting');
  //   if (this.profileForm.invalid) {
  //     return;
  //   }

  //   if (this.user) {
  //     console.log('user', this.user);
  //     let avatarUrl = this.profileForm.get('avatar_url')?.value;

     


  //     const updatedProfile = {
  //       ...this.profileForm.value,
  //       avatar_url: avatarUrl
  //     };

  //     const { error } = await this.supabaseService.updateProfile(this.user.id, updatedProfile);
  //     if (error) {
  //       this.toastr.error('Error updating profile', 'Update Error');
  //     } else {
  //       this.toastr.success('Profile updated successfully', 'Update Success');
  //       this.profileForm.patchValue({ avatar_url: avatarUrl });
  //     }
  //   }

    
  // }

  async onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.avatarFile = file;
      // Create a preview URL
      this.avatarUrl = URL.createObjectURL(file);
    }
  }

  async onSubmit() {
    console.log('submitting');  
    if (this.loading) return;
    this.loading = true;

    try {
      const user = this.authService.getUser();
      if (!user) throw new Error('No user found');

      let avatarUrl = this.profileForm.get('avatar_url')?.value;

      // Upload new avatar if selected
      if (this.avatarFile) {
        const { data, error } = await this.authService.uploadAvatar(user.id, this.avatarFile);
        if (error) throw error;
        avatarUrl = data.path;
      }

      const updates = {
        ...this.profileForm.value,
        avatar_url: avatarUrl,
        updated_at: new Date()
      };

      const { error } = await this.authService.updateProfile(user.id, updates);
      if (error) {
        this.toastr.error('Error updating profile', 'Update Error');
      } else {
        this.toastr.success('Profile updated successfully', 'Update Success');
        this.profileForm.patchValue({ avatar_url: avatarUrl });
      }

      // Rest of your submission logic...
    } catch (error) {
      this.toastr.error('Error updating profile');
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
}