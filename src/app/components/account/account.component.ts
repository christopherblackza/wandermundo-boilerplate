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
  imageChangedEvent: any = '';
  cropppedImagePreview: any;
  croppedImageBlob: Blob | null = null;
  showCropper = false;

  // user: User | null = null;
  user: User | null = null;
  private unsubscribe$: Subject<void> = new Subject<void>();

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
    this.authService.user$
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
  }

  loadUserProfile() {
    this.loading = true;

      if (this.user) {
    

        this.supabaseService.getProfile(this.user.id).then(({ data, error }) => {
          if (error) {
            this.toastr.error('Error loading profile', 'Profile Error');
          } else if (data) {
            console.error('data', data);
            this.profileForm.patchValue(data);

            if (data.avatar_url) {
              this.cropppedImagePreview = data.avatar_url;
            }
          }
          this.loading = false;
        });
      } 
     
      
  }

  onFileChange(event: any): void {
    this.imageChangedEvent = event;
    this.showCropper = true;
    console.error('event', event);
    this.cropppedImagePreview = this.imageChangedEvent.target.files[0];
  }

  imageCropped(event: ImageCroppedEvent) {
    this.cropppedImagePreview = event.objectUrl;
    this.croppedImageBlob = event.blob || null;
  }


  loadImageFailed() {
    this.toastr.error('Failed to load image');
  }

  async onSubmit() {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;

    if (this.user) {
      let avatarUrl = this.profileForm.get('avatar_url')?.value;

      if (this.croppedImageBlob) {
        const { data, error } = await this.supabaseService.uploadAvatar(this.user.id, this.croppedImageBlob);
        if (error) {
          this.toastr.error('Error uploading avatar', 'Upload Error');
          this.loading = false;
          return;
        }
        avatarUrl = data.path;
      }

      const updatedProfile = {
        ...this.profileForm.value,
        avatar_url: avatarUrl
      };

      const { error } = await this.supabaseService.updateProfile(this.user.id, updatedProfile);
      if (error) {
        this.toastr.error('Error updating profile', 'Update Error');
      } else {
        this.toastr.success('Profile updated successfully', 'Update Success');
        this.profileForm.patchValue({ avatar_url: avatarUrl });
      }
    }
    this.loading = false;
  }
}