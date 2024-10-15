import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Events</h2>
    <div class="row">
      <div class="col-md-6">
        <h3>Create Event</h3>
        <form (ngSubmit)="createEvent()">
          <div class="mb-3">
            <label for="title" class="form-label">Title</label>
            <input type="text" class="form-control" id="title" [(ngModel)]="newEvent.title" name="title" required>
          </div>
          <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea class="form-control" id="description" [(ngModel)]="newEvent.description" name="description" required></textarea>
          </div>
          <div class="mb-3">
            <label for="date" class="form-label">Date</label>
            <input type="date" class="form-control" id="date" [(ngModel)]="newEvent.date" name="date" required>
          </div>
          <div class="mb-3">
            <label for="time" class="form-label">Time</label>
            <input type="time" class="form-control" id="time" [(ngModel)]="newEvent.time" name="time" required>
          </div>
          <div class="mb-3">
            <label for="location" class="form-label">Location</label>
            <input type="text" class="form-control" id="location" [(ngModel)]="newEvent.location" name="location" required>
          </div>
          <button type="submit" class="btn btn-primary">Create Event</button>
        </form>
      </div>
      <div class="col-md-6">
        <h3>Upcoming Events</h3>
        <div *ngFor="let event of events" class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">{{ event.title }}</h5>
            <p class="card-text">{{ event.description }}</p>
            <p class="card-text"><small class="text-muted">{{ event.date }} at {{ event.time }}</small></p>
            <p class="card-text"><small class="text-muted">Location: {{ event.location }}</small></p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EventsComponent implements OnInit {
  events: any[] = [];
  newEvent: any = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: ''
  };

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadEvents();
  }

  async loadEvents() {
    const { data, error } = await this.supabaseService.getEvents();
    if (error) {
      console.error('Error loading events:', error);
    } else {
      this.events = data || [];
    }
  }

  async createEvent() {
    const { error } = await this.supabaseService.createEvent(this.newEvent);
    if (error) {
      console.error('Error creating event:', error);
    } else {
      this.newEvent = {
        title: '',
        description: '',
        date: '',
        time: '',
        location: ''
      };
      this.loadEvents();
    }
  }
}