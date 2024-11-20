import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';
import { trigger, transition, style, animate, query, stagger, state } from '@angular/animations';

import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, NavbarComponent, CarouselModule, RouterModule, NavbarComponent],
  providers: [DialogService],
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
  animations: [
    trigger('fadeInOnScroll', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFadeOnScroll', [
      state('visible', style({ 
        opacity: 1, 
        transform: 'translateY(0)' 
      })),
      state('hidden', style({ 
        opacity: 0, 
        transform: 'translateY(30px)' 
      })),
      transition('hidden => visible', [
        animate('600ms ease-out')
      ])
    ])
  ]
})
export class MembersComponent implements OnInit, AfterViewInit {
  users: any[] = [];
  @ViewChildren('memberCard') memberCards!: QueryList<ElementRef>;
  cardStates: { [key: number]: string } = {};

  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '1024px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  constructor(
    public authService: AuthService,
    private dialogService: DialogService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  private setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.3
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = this.memberCards.toArray().findIndex(card => card.nativeElement === entry.target);
          if (index !== -1) {
            this.cardStates[index] = 'visible';
          }
        }
      });
    }, options);

    // Observe each card
    this.memberCards.forEach((card) => {
      observer.observe(card.nativeElement);
      const index = this.memberCards.toArray().indexOf(card);
      this.cardStates[index] = 'hidden';
    });
  }

  async loadUsers() {
    try {
      const { data, error } = await this.authService.getUsers();
      if (error) {
        console.error('Error fetching users:', error);
      } else {
        this.users = data;
        console.log(this.users);
        // Duplicate the users array to create a new array with the same data times 10
        // this.users = [...this.users, ...this.users, ...this.users, ...this.users, ...this.users, ...this.users, ...this.users, ...this.users, ...this.users, ...this.users];
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }


}