import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  // user: User | null = null;
  unreadMessages: number = 0;
  private userSubscription!: Subscription;
  private unreadMessagesSubscription!: Subscription;

  isMenuOpen = false;
  isHeaderScrolled = false;

  user$ = this.authService.user$;

  

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {


    this.unreadMessagesSubscription = this.authService.unreadMessages$.subscribe(count => {
      this.unreadMessages = count;
      console.log('unreadMessages', this.unreadMessages);
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.unreadMessagesSubscription) {
      this.unreadMessagesSubscription.unsubscribe();
    }
  }

  signOut() {
    this.authService.signOut();
  }

  goToChat() {
    this.authService.resetUnreadMessages();
    this.router.navigate(['/chat']);
  }

  

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.isHeaderScrolled = window.pageYOffset > 50;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Optional: Close menu when clicking outside
  @HostListener('window:click', ['$event'])
  onClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.hamburger') && !target.closest('.mobile-menu')) {
      this.isMenuOpen = false;
    }
  }
  
}
