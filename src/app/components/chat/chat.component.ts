import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RealtimeChannel, User } from '@supabase/supabase-js';
import { Subject, Subscription, takeUntil } from 'rxjs';

import { AuthService, Profile } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;

  onlineUsers$ = this.authService.onlineUsers$;

  messages: any[] = [];
  newMessage: string = '';
  


  private userSubscription!: Subscription;
  private messageSubscription!: Subscription;

  user: User | null = null;
  profile: Profile | null = null;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.profile$.subscribe(profile => {
      console.log('Profile:', profile);
      if (profile) {
        // Use profile data
        this.profile = profile;
      }
    });

    this.authService.setViewingChat(true);
    this.authService.resetUnreadMessages();
    this.authService.subscribeToMessages();


    this.authService.userSubject$
    .pipe(takeUntil(this.unsubscribe$))  // Automatically unsubscribe when destroyed
    .subscribe(user => {
      this.user = user;
      if (user) {
        this.loadMessages();
      }
    });



    this.messageSubscription = this.authService.message$.subscribe(message => {

      if (message) {
        this.messages.push(message);
        setTimeout(() => this.scrollToBottom(), 0);
      }
    });
  }

  ngOnDestroy() {
    this.authService.setViewingChat(false);

    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  // async loadMessages() {
  //   const { data, error } = await this.authService.getMessages();
  //   if (error) {
  //     console.error('Error loading messages:', error);
  //   } else {
  //     this.messages = data || [];
  //     setTimeout(() => this.scrollToBottom(), 0);
  //   }
  // }
  async loadMessages() {
    const { data, error } = await this.authService.getMessages();
    if (error) {
      console.error('Error loading messages:', error);
    } else {
      console.log('Messages:', data);
      // Ensure system messages appear at the top
      this.messages = (data || []).sort((a, b) => {
        if (a.is_system_message && !b.is_system_message) return -1;
        if (!a.is_system_message && b.is_system_message) return 1;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  async sendMessage() {
    if (this.newMessage.trim() && this.user) {
      const message = {
        content: this.newMessage.trim()
      };
      const { error } = await this.authService.sendMessage(this.user, message, this.profile);
      if (error) {
        console.error('Error sending message:', error);
      } else {
        this.newMessage = '';
        // No need to call loadMessages() here
      }
    }
  }
}