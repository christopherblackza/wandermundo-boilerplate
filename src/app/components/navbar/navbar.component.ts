import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <a class="navbar-brand" routerLink="/">Wandermundo</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" routerLink="/events">Events</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/community">Community</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/chat">Chat</a>
            </li>
          </ul>
          <ul class="navbar-nav ms-auto">
            <li class="nav-item" *ngIf="!user">
              <a class="nav-link" routerLink="/login">Login</a>
            </li>
            <li class="nav-item" *ngIf="!user">
              <a class="nav-link" routerLink="/signup">Sign Up</a>
            </li>
            <li class="nav-item" *ngIf="user">
              <a class="nav-link" (click)="signOut()">Sign Out</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  user: any;

  constructor(private supabaseService: SupabaseService) {
    this.supabaseService.getUser().then(({ data }) => {
      this.user = data.user;
    });
  }

  signOut() {
    this.supabaseService.signOut().then(() => {
      this.user = null;
    });
  }
}