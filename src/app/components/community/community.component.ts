import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.scss']
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