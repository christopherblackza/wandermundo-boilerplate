import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { NavbarComponent } from '../navbar/navbar.component';

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
}

interface TimelineEvent {
  year: number;
  description: string;
}

interface Award {
  icon: string;
  title: string;
  year: number;
}

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {

  timelineEvents: TimelineEvent[] = [
    // { year: 2024, description: 'Reached 1 million active community members' },
    // { year: 2023, description: 'Launched global mentorship program' },
    // { year: 2022, description: 'Expanded to 50 countries worldwide' },
    { year: 2024, description: 'Launched' },
    { year: 2022, description: 'Founded' }
  ];

  teamMembers: TeamMember[] = [
    { name: 'Christopher Black', role: 'Chief Executive Officer', avatar: 'assets/images/christopher.jpeg' },
    // { name: 'Jane Smith', role: 'Lead Developer', avatar: 'assets/avatar-placeholder.png' },
    // { name: 'Mike Johnson', role: 'UX Designer', avatar: 'assets/avatar-placeholder.png' },
    // { name: 'Sarah Wilson', role: 'Community Lead', avatar: 'assets/avatar-placeholder.png' },
    // { name: 'Tom Brown', role: 'Marketing Director', avatar: 'assets/avatar-placeholder.png' },
    // { name: 'Lisa Davis', role: 'Content Strategist', avatar: 'assets/avatar-placeholder.png' }
  ];

  awards: Award[] = [
    { icon: '🏆', title: 'Best Community Platform', year: 2024 },
    { icon: '🌟', title: 'Innovation Award', year: 2023 }
  ];
}
