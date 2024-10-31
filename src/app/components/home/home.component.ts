import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  featuredCategories = [
    { name: 'Digital Nomad Meetups', icon: 'fa-users' },
    { name: 'Travel Workshops', icon: 'fa-map-marked-alt' },
    { name: 'Cultural Experiences', icon: 'fa-globe-americas' },
    { name: 'Remote Work Spaces', icon: 'fa-laptop-house' },
    { name: 'Adventure Tours', icon: 'fa-hiking' },
    { name: 'Language Exchanges', icon: 'fa-comments' }
  ];

  searchQuery: string = '';
  upcomingEvents: any[] = [];
  searchResults: any[] = [];
  isSearchPerformed: boolean = false;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadUpcomingEvents();
  }

  async loadUpcomingEvents() {
    const { data, error } = await this.supabaseService.getUpcomingEvents();
    if (error) {
      console.error('Error loading upcoming events:', error);
    } else {
      this.upcomingEvents = data || [];
    }
  }

  navigateToEventDetail(event: any) {
    this.router.navigate(['/events-detail'], { state: { event } });
  }

  async searchEvents() {
    if (this.searchQuery.trim() === '') {
      this.isSearchPerformed = false;
      return;
    }

    const { data, error } = await this.supabaseService.searchEvents(this.searchQuery);
    if (error) {
      console.error('Error searching events:', error);
    } else {
      this.searchResults = data || [];
      this.isSearchPerformed = true;
    }
  }
}