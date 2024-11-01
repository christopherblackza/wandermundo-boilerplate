import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Profile {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  website?: string;
  occupation?: string;
  whatsapp_number?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private supabase: SupabaseClient;
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();
  private messageSubject = new BehaviorSubject<any>(null);
  message$ = this.messageSubject.asObservable();
  private channel: RealtimeChannel | null = null;

  private unreadMessagesSubject = new BehaviorSubject<number>(0);
  unreadMessages$ = this.unreadMessagesSubject.asObservable();

  
  private profileSubject = new BehaviorSubject<Profile | null>(null);
  profile$ = this.profileSubject.asObservable();

  constructor(private router: Router) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.loadUserFromSession();
  }

  private async loadUserFromSession() {
    const { data } = await this.supabase.auth.getSession();
    if (data?.session) {
      this.userSubject.next(data.session.user);
      await this.loadProfile(data.session.user.id);
    }
  }

  private async loadProfile(userId: string) {
    // Check if we already have the profile
    if (this.profileSubject.value?.id === userId) {
      return;
    }

    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
      return;
    }

    if (data) {
      this.profileSubject.next(data);
    }
  }

  getUser() {
    return this.userSubject.value;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    console.log('data', data);
    if (data.user) {
      this.userSubject.next(data.user);
    }
    return { error };
  }

  async signUp(email: string, password: string, profileData?: any) {
    console.log('profileData', profileData);  
    const { data, error } = await this.supabase.auth.signUp({ 
      email, 
      password 
    });
  
    if (data?.user && profileData) {
      const resp = await this.supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          ...profileData,
          updated_at: new Date()
        });
        console.log('resp', resp);
    }
  
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (!error) {
      this.userSubject.next(null);
      console.log('signOut: User signed out');
      this.router.navigate(['/']);
    }
  }


  // Live Chat Messaging 
  async sendMessage(user: any, message: any, profile: Profile | null) {
    console.log('Sending message:', message);

    
    
    const result = await this.supabase.from('messages').insert({
      ...message,
      user_id: user.id,
      user_email: user.email,
      user_avatar_url: profile?.avatar_url || null,
      user_full_name: profile?.full_name || null
    });

    console.log('Message sent result:', result);
    return result;
  }

  async getMessages() {
    return this.supabase
      .from('messages')
      .select(`
        *
      `)
      .order('created_at', { ascending: true });
  }

  getCurrentProfile(): Profile | null {
    return this.profileSubject.value;
  }

  private isViewingChat = false;
  setViewingChat(isViewing: boolean) {
    this.isViewingChat = isViewing;
  }

  subscribeToMessages() {
    if (this.channel) return;

    console.log('Subscribing to messages...');
    this.channel = this.supabase
      .channel('public:messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          console.log('Received message:', payload);
          this.messageSubject.next(payload.new);
          this.handleNewMessage(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });
  }

  private async handleNewMessage(message: any) {
    const currentUser = this.getUser();
    if (currentUser?.id !== message.user_id) {
      this.incrementUnreadMessages();
    }
  }

  incrementUnreadMessages() {
    if (!this.isViewingChat) {
      this.unreadMessagesSubject.next(this.unreadMessagesSubject.value + 1);
    }
  }

  unsubscribeFromMessages() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  resetUnreadMessages() {
    this.unreadMessagesSubject.next(0);
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }
}