import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';

import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, NavbarComponent, CarouselModule, RouterModule, NavbarComponent],
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {
  users: any[] = [];

  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 4,
      numScroll: 1
    },
    {
      breakpoint: '1200px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  constructor(
    public authService: AuthService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const { data, error } = await this.supabaseService.getUsers();
      if (error) {
        console.error('Error fetching users:', error);
      } else {
        this.users = data;
        
        // Duplicate the users array to create a new array with the same data times 10
        // this.users = [...this.users, ...this.users, ...this.users, ...this.users, ...this.users, ...this.users, ...this.users, ...this.users, ...this.users, ...this.users];
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }
}