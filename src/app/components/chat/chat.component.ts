import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { Subject, Subscription, take, takeUntil } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar.component';
import { User } from '@supabase/supabase-js';
import { AuthService, Profile } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;

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
    console.log('ChatComponent initialized');

    this.authService.profile$.subscribe(profile => {
      if (profile) {
        // Use profile data
        console.log('Profile:', profile);
        this.profile = profile;
      }
    });

    this.authService.setViewingChat(true);
    this.authService.resetUnreadMessages();
    this.authService.subscribeToMessages();


    this.authService.user$
    .pipe(takeUntil(this.unsubscribe$))  // Automatically unsubscribe when destroyed
    .subscribe(user => {
      this.user = user;
      console.log('user', user);
      
      if (user) {
        this.loadMessages();
      }
    });



    this.messageSubscription = this.authService.message$.subscribe(message => {
      console.log('New message received:', message);
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

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  async loadMessages() {
    const { data, error } = await this.authService.getMessages();
    if (error) {
      console.error('Error loading messages:', error);
    } else {
      this.messages = data || [];
      console.log('messages', this.messages);
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