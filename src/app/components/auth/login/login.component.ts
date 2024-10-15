import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h2 class="text-center mb-4">Login</h2>
        <form (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input type="email" class="form-control" id="email" [(ngModel)]="email" name="email" required>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" [(ngModel)]="password" name="password" required>
          </div>
          <button type="submit" class="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async onSubmit() {
    try {
      const { error } = await this.supabaseService.signIn(this.email, this.password);
      if (error) throw error;
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error logging in:', error);
      // Handle error (e.g., show error message to user)
    }
  }
}