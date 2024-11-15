import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterModule, RouterLink],
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
  isMobileMenuOpen = false;
  avatarUrl: string | null = null;
  isMobile: boolean = false;

  user$ = this.authService.userSubject$;

  

  constructor(public authService: AuthService, private router: Router) {}

  async ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());

    const { data, error } = await this.authService.supabase.auth.getUser();
    console.log('user', data);

    if (data && data.user) {
      this.authService.getProfile(data.user.id).then(({ data, error }) => {
        if (data) {
          console.log('data', data);
          this.avatarUrl = data.avatar_url;
          
  
  
        }
      });
    }

   


    this.unreadMessagesSubscription = this.authService.unreadMessages$.subscribe(count => {
      console.log('Unread Messages:', count);
      this.unreadMessages = count;
    });


  }

  goToProfile() {
    console.log('goToProfile');
    this.router.navigate(['/account']);
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.unreadMessagesSubscription) {
      this.unreadMessagesSubscription.unsubscribe();
    }
    window.removeEventListener('resize', () => this.checkScreenSize());
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

  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: MouseEvent) {
  //   console.log('onDocumentClick')
  //   // Get references to the menu and hamburger button
  //   const mobileMenu = document.querySelector('.nav-links');
  //   const hamburgerButton = document.querySelector('.mobile-menu-btn');
    
  //   // Check if click is outside both the menu and hamburger button
  //   if (mobileMenu && hamburgerButton && 
  //       !mobileMenu.contains(event.target as Node) && 
  //       !hamburgerButton.contains(event.target as Node)) {
  //     this.isMobileMenuOpen = false;
  //   }
  // }
  
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    console.log('isMobileMenuOpen', this.isMobileMenuOpen);
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }
}
