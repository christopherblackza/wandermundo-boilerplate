import { Routes } from '@angular/router';

import { AboutUsComponent } from './components/about-us/about-us.component';
import { AccountComponent } from './components/account/account.component';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { BlogDetailComponent } from './components/blog-detail/blog-detail.component';
import { BlogListComponent } from './components/blog-list/blog-list.component';
import { ChatComponent } from './components/chat/chat.component';
import { CommunityComponent } from './components/community/community.component';
import { CreateEventComponent } from './components/create-event/create-event.component';
import { EventsDetailComponent } from './components/events-detail/events-detail.component';
import { Landing2Component } from './components/landing-2/landing-2.component';
import { LandingComponent } from './components/landing/landing.component';
import { MembersComponent } from './components/members/members.component';
import { OurStoryComponent } from './components/our-story/our-story.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'our-story', component: OurStoryComponent },
  { path: 'landing', component: LandingComponent },
  { path: 'landing2', component: Landing2Component },
  { path: 'account', component: AccountComponent, canActivate: [AuthGuard] },
  { path: 'members', component: MembersComponent, canActivate: [AuthGuard] },
  { path: 'signup', component: SignupComponent },
  { path: 'create-event', component: CreateEventComponent, canActivate: [AuthGuard] },
  { path: 'events-detail', component: EventsDetailComponent, canActivate: [AuthGuard] },
  { path: 'communities', component: CommunityComponent, canActivate: [AuthGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'blog', component: BlogListComponent, canActivate: [AuthGuard]  },
  { path: 'blog/:id', component: BlogDetailComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/' } 
];