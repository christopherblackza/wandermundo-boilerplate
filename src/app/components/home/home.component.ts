import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="jumbotron">
      <h1 class="display-4">Welcome to Wandermundo</h1>
      <p class="lead">Connect with fellow digital nomads, find events, and explore the world together!</p>
      <hr class="my-4">
      <p>Join our community to access exclusive features and connect with like-minded travelers.</p>
      <a class="btn btn-primary btn-lg" routerLink="/signup" role="button">Get Started</a>
    </div>
  `
})
export class HomeComponent {}