import {
  Component,
  OnInit,
  OnDestroy,
  importProvidersFrom,
} from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter, RouterOutlet } from "@angular/router";
import { routes } from "./app/app.routes";
import { NavbarComponent } from "./app/components/navbar/navbar.component";
import { SupabaseService } from "./app/services/supabase.service";
import { Subscription, take } from "rxjs";
import { ToastrModule } from "ngx-toastr";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { AuthService } from "./app/services/auth.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class App implements OnInit, OnDestroy {
  private userSubscription!: Subscription;

  loadingPercentage = 0;

  isLoaded = false;

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    // Simulate a longer loading time
    this.startLoading();
    

    this.userSubscription = this.authService.user$.pipe(take(1)).subscribe((user) => {
      if (user) {
        this.supabaseService.subscribeToMessages();
      } else {
        this.supabaseService.unsubscribeFromMessages();
      }
    });
  }

  startLoading() {
    const interval = setInterval(() => {
      this.loadingPercentage += 10; // Increase by 2% every 60ms
      if (this.loadingPercentage >= 100) {
        clearInterval(interval);
        this.isLoaded = true;
      }
    }, 60); // 60ms * 50 steps = 3000ms (3 seconds)
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    this.supabaseService.unsubscribeFromMessages();
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
