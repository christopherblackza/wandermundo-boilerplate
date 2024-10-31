import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { CommunityComponent } from './components/community/community.component';
import { ChatComponent } from './components/chat/chat.component';
import { EventsDetailComponent } from './components/events-detail/events-detail.component';
import { LandingComponent } from './components/landing/landing.component';
import { CreateEventComponent } from './components/create-event/create-event.component';
import { AccountComponent } from './components/account/account.component';
import { MembersComponent } from './components/members/members.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'landing', component: LandingComponent },
  { path: 'account', component: AccountComponent, canActivate: [AuthGuard] },
  { path: 'members', component: MembersComponent, canActivate: [AuthGuard] },
  { path: 'signup', component: SignupComponent },
  { path: 'create-event', component: CreateEventComponent, canActivate: [AuthGuard] },
  { path: 'events-detail', component: EventsDetailComponent, canActivate: [AuthGuard] },
  { path: 'community', component: CommunityComponent, canActivate: [AuthGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/' } 
];