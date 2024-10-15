import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { routes } from './app/app.routes';
import { NavbarComponent } from './app/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container mt-4">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class App {}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes)
  ]
});