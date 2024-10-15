import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { EventsComponent } from './components/events/events.component';
import { CommunityComponent } from './components/community/community.component';
import { ChatComponent } from './components/chat/chat.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'events', component: EventsComponent },
  { path: 'community', component: CommunityComponent },
  { path: 'chat', component: ChatComponent },
];