import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent {
  lastUpdated = new Date('2024-03-20');
} 