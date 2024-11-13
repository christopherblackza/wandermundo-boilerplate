import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ChipsModule } from 'primeng/chips';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { BlogService } from '../../services/blog.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService, Profile } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-blog-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    QuillModule,
    InputTextModule,
    InputTextareaModule,
    ChipsModule,
    ButtonModule,
    DropdownModule,
    ToastModule,
    NavbarComponent
  ],
  providers: [MessageService],
  templateUrl: './blog-create.component.html',
  styleUrls: ['./blog-create.component.scss']
})
export class BlogCreateComponent implements OnInit {
  blogForm: FormGroup;
  categories = [
    { label: 'Travel', value: 'travel' },
    { label: 'Work', value: 'work' },
    { label: 'Lifestyle', value: 'lifestyle' },
    { label: 'Technology', value: 'technology' }
  ];
  isSubmitting = false;

  profile: Profile | null = null;

  quillConfig = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean'],
        ['link', 'image', 'video']
      ]
    },
    // imageHandler: {
    //   upload: (file: File) => {
    //     // Implement your image upload logic here
    //     return new Promise((resolve, reject) => {
    //       // Example: Upload to your server/cloud storage
    //       // Return the URL of the uploaded image
    //       resolve('image-url');
    //     });
    //   }
    // }
  };

  imagePreview: string | null = null;
  imageFile: File | null = null;
  imageError: string | null = null;

  formSubmitted = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private toastService: ToastrService,
    private blogService: BlogService,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.blogForm = this.fb.group({
      title: ['Test Blog', [Validators.required, Validators.minLength(5)]],
      excerpt: ['This is the exceprt for my test blog that has a long excerpt', [Validators.required, Validators.minLength(50)]],
      content: ['', [Validators.required, Validators.minLength(100)]],
      category: ['', Validators.required],
      tags: [[]],
      read_time: [''],
      image: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.formSubmitted = false;

    this.authService.profile$.subscribe(profile => {
        if (profile) {
          // Use profile data
          this.profile = profile;
        }
      });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const element = event.target as HTMLElement;
    element.classList.add('dragover');
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const element = event.target as HTMLElement;
    element.classList.remove('dragover');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const element = event.target as HTMLElement;
    element.classList.remove('dragover');
    
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      this.imageError = 'Please upload an image file';
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      this.imageError = 'Image size should not exceed 5MB';
      return;
    }

    this.imageFile = file;
    this.imageError = null;

    console.log('Image file:', this.imageFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.blogForm.patchValue({ image: this.imagePreview });
    };
    reader.readAsDataURL(file);
  }

  async onSubmit() {
    console.log('Image file:', this.imageFile);
    console.log('Blog form:', this.blogForm);

    this.formSubmitted = true;

    if (this.blogForm.valid && this.imageFile) {
      this.isSubmitting = true;
      try {
        const formValue = this.blogForm.value;
        
        // Create the blog post with the image file
        const blogPost = await this.blogService.createPost(formValue, this.profile, this.imageFile)
          .toPromise();
        console.log('Blog post:', blogPost);

        this.toastService.success('Blog post created successfully!');
        this.router.navigate(['/blog']); // Navigate to blog list or wherever appropriate
      } catch (error) {
        console.error('Error creating blog post:', error);
        this.toastService.error('Failed to create blog post');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}