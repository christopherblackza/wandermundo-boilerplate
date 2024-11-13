import { CommonModule } from '@angular/common';
import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { ToastrService } from 'ngx-toastr';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Subject, takeUntil } from 'rxjs';

import { MyEvent } from '../../models/event.model';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';

// PrimeNG imports
@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NavbarComponent,
    InputTextModule,
    InputTextareaModule,
    CalendarModule,
    InputNumberModule,
    FileUploadModule,
    ButtonModule,
    DialogModule,
    ImageCropperComponent
  ],
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit, OnDestroy {
  @ViewChild('locationInput') locationInput!: ElementRef;
  eventForm: FormGroup;
  selectedFile: File | null = null;
  imageChangedEvent: any = '';
  cropppedImagePreview: any;
  croppedImageBlob!: Blob;
  showCropper = false;

  user: User | null = null;
  private unsubscribe$: Subject<void> = new Subject<void>();
  

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.eventForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.required],
      maxParticipants: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.authService.userSubject$
    .pipe(takeUntil(this.unsubscribe$))  // Automatically unsubscribe when destroyed
    .subscribe(user => {
      this.user = user;
      

    });
    
  }

  ngOnDestroy(): void {
    // Trigger unsubscribe to clean up the subscription
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onFileChange(event: any): void {
    // console.log(event);
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.cropppedImagePreview = event.objectUrl;
    this.croppedImageBlob = event.blob!;
  }

  loadImageFailed() {
    this.toastr.error('Failed to load image');
  }

  onSubmit() {
    if (this.eventForm.valid && this.croppedImageBlob) {
 


      if (this.user) {

        const eventData: Partial<MyEvent> = {
          name: this.eventForm.get('name')?.value,
          description: this.eventForm.get('description')?.value,
          date: this.combineDateAndTime(
            this.eventForm.get('date')?.value,
            this.eventForm.get('time')?.value
          ),
          time: this.eventForm.get('time')?.value,
          location: this.eventForm.get('location')?.value,
          max_participants: this.eventForm.get('maxParticipants')?.value,
          created_by: this.user.id
        };
        // console.log('eventData', eventData);
        this.authService.createEvent(eventData as MyEvent, this.croppedImageBlob).subscribe(resp => {


          this.toastr.success('Event created successfully');
          this.router.navigate(['/']);
        });
      }

    } else {
      this.toastr.error('Please fill all required fields and select an image');
    }
  }

  combineDateAndTime(date: Date, time: Date): Date {
    const combinedDate = new Date(date);
    combinedDate.setHours(time.getHours(), time.getMinutes());
    return combinedDate;
  }
}