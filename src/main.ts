import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, importProvidersFrom, OnDestroy, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, RouterOutlet } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { Subscription, take } from 'rxjs';

import { routes } from './app/app.routes';
import { FooterComponent } from './app/components/footer/footer.component';
import { AuthService } from './app/services/auth.service';
import { SupabaseService } from './app/services/supabase.service';

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, FooterComponent],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class App implements OnInit, OnDestroy {
  private userSubscription!: Subscription;

  loadingPercentage = 0;
  private backgroundImage: HTMLImageElement;

  isLoaded = false;

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {
    this.backgroundImage = new Image();
  }

  ngOnInit() {
    // Simulate a longer loading time
    const imagePath = window.innerWidth > 768 
    ? '/assets/images/background.jpg' 
    : '/assets/images/background-mobile.jpg';
  
    this.backgroundImage.src = imagePath;
    this.backgroundImage.onload = () => {
      this.startLoading();
    };
      

  
    this.userSubscription = this.authService.user$.pipe().subscribe((user) => {
      console.log('User:', user);
      if (user) {
        this.supabaseService.subscribeToMessages();
        this.authService.subscribeToPresence(); // Add this line
      } else {
        this.supabaseService.unsubscribeFromMessages();
        this.authService.unsubscribeFromPresence(); // Add this line
      }
    });
  }

  startLoading() {
    const interval = setInterval(() => {
      this.loadingPercentage += 10;
      if (this.loadingPercentage >= 100) {
        clearInterval(interval);
        this.isLoaded = true;
      }
    }, 60);
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    this.supabaseService.unsubscribeFromMessages();
    this.authService.unsubscribeFromPresence(); 
  }
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(ToastrModule.forRoot()),
    importProvidersFrom(HttpClientModule)
  ],
});
