import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Community WhatsApp Groups</h2>
    <div class="row">
      <div *ngFor="let group of whatsappGroups" class="col-md-4 mb-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">{{ group.name }}</h5>
            <p class="card-text">{{ group.description }}</p>
            <a [href]="group.link" target="_blank" class="btn btn-primary">Join Group</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CommunityComponent implements OnInit {
  whatsappGroups: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadWhatsAppGroups();
  }

  async loadWhatsAppGroups() {
    const { data, error } = await this.supabaseService.getWhatsAppGroups();
    if (error) {
      console.error('Error loading WhatsApp groups:', error);
    } else {
      this.whatsappGroups = data || [];
    }
  }
}