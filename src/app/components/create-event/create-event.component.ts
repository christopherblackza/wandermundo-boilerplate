import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { switchMap, take } from 'rxjs';
import { MyEvent } from '../../models/event.model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NavbarComponent } from '../navbar/navbar.component';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

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
export class CreateEventComponent implements OnInit {
  @ViewChild('locationInput') locationInput!: ElementRef;
  eventForm: FormGroup;
  selectedFile: File | null = null;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper = false;
  

  constructor(
    private toastr: ToastrService,
    private fb: FormBuilder,
    private router: Router,
    private supabaseService: SupabaseService,
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

  ngOnInit() {}

  onFileChange(event: any): void {
    console.log(event);
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  loadImageFailed() {
    this.toastr.error('Failed to load image');
  }

  onSubmit() {
    if (this.eventForm.valid && this.croppedImage) {
      this.supabaseService.getCurrentUser().pipe(
        take(1),
        switchMap(user => {
          if (!user) {
            throw new Error('You must be logged in to create an event');
          }
          const eventData: Partial<MyEvent> = {
            name: this.eventForm.get('name')?.value,
            description: this.eventForm.get('description')?.value,
            date: this.combineDateAndTime(
              this.eventForm.get('date')?.value,
              this.eventForm.get('time')?.value
            ),
            location: this.eventForm.get('location')?.value,
            max_participants: this.eventForm.get('maxParticipants')?.value,
            created_by: user.id
          };
          return this.supabaseService.createEvent(eventData as MyEvent, this.croppedImage);
        })
      ).subscribe({
        next: (createdEvent) => {
          console.log('Event created successfully:', createdEvent);
          this.toastr.success('Event created successfully');
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error creating event:', error);
          this.toastr.error('Error creating event: ' + error.message);
        }
      });
    } else {
      this.toastr.error('Please fill all required fields and select an image');
    }
  }

  combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const combinedDate = new Date(date);
    combinedDate.setHours(hours, minutes);
    return combinedDate;
  }
}