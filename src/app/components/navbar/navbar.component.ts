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

  
  toggleMenu(event?: MouseEvent) {
    if (event) {
      event.stopPropagation(); // Prevent the document click handler from firing
    }
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.isHeaderScrolled = window.pageYOffset > 50;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    console.log('onDocumentClick')
    // Get references to the menu and hamburger button
    const mobileMenu = document.querySelector('.mobile-menu');
    const hamburgerButton = document.querySelector('.hamburger');
    
    // Check if click is outside both the menu and hamburger button
    if (mobileMenu && hamburgerButton && 
        !mobileMenu.contains(event.target as Node) && 
        !hamburgerButton.contains(event.target as Node)) {
      this.isMenuOpen = false;
    }
  }
  
}
