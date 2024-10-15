import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Real-Time Chat</h2>
    <div class="chat-container">
      <div class="chat-messages">
        <div *ngFor="let message of messages" class="message">
          <strong>{{ message.user_email }}</strong> 
          <small>({{ message.created_at | date:'short' }})</small>: 
          {{ message.content }}
        </div>
      </div>
      <div class="chat-input">
        <input type="text" [(ngModel)]="newMessage" (keyup.enter)="sendMessage()" placeholder="Type a message...">
        <button (click)="sendMessage()" class="btn btn-primary">Send</button>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 400px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
    }
    .chat-input {
      display: flex;
      padding: 10px;
    }
    .chat-input input {
      flex: 1;
      margin-right: 10px;
    }
    .message {
      margin-bottom: 10px;
    }
  `]
})
export class ChatComponent implements OnInit {
  messages: any[] = [];
  newMessage: string = '';
  user: any;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.supabaseService.getUser().then(({ data }) => {
      this.user = data.user;
      this.loadMessages();
    });

    this.supabaseService.subscribeToMessages((payload) => {
      this.messages.push(payload.new);
    });
  }

  async loadMessages() {
    const { data, error } = await this.supabaseService.getMessages();
    if (error) {
      console.error('Error loading messages:', error);
    } else {
      this.messages = data || [];
    }
  }

  async sendMessage() {
    if (this.newMessage.trim() && this.user) {
      const message = {
        user_id: this.user.id,
        content: this.newMessage.trim()
      };
      const { error } = await this.supabaseService.sendMessage(message);
      if (error) {
        console.error('Error sending message:', error);
      } else {
        this.newMessage = '';
      }
    }
  }
}