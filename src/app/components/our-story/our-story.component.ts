import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-our-story',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './our-story.component.html',
  styleUrls: ['./our-story.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFade', [
      transition(':enter', [
        query('.animate-item', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(200, [
            animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ])
      ])
    ])
  ]
})
export class OurStoryComponent {
  stats = [
    { number: '1+', label: 'Digital Nomads' },
    { number: '1+', label: 'Countries' },
    // { number: '100+', label: 'Events' },
    { number: '1000+', label: 'Connections Made' }
  ];
}