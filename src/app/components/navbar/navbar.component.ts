import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
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
export class NavbarComponent implements OnInit {
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

  
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    console.log('onWindowScroll')
    this.isHeaderScrolled = window.pageYOffset > 50;
    console.log('isHeaderScrolled', this.isHeaderScrolled);
  }
  
}
