import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  dashboardOptions = [
    {
      title: 'Create Event',
      description: 'Host your own event and connect with the community',
      icon: 'fa-calendar-plus',
      route: '/create-event'
    },
    {
      title: 'Browse Blogs',
      description: 'Discover interesting stories and experiences',
      icon: 'fa-blog',
      route: '/blog'
    },
    {
      title: 'Community Chat',
      description: 'Connect with others and get real-time information',
      icon: 'fa-comments',
      route: '/chat'
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
} 