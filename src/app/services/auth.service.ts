import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, RealtimeChannel, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, catchError, from, map, Observable, switchMap, tap, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { MyEvent } from '../models/event.model';
import { ToastrService } from 'ngx-toastr';

export interface Profile {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  display_name?: string;
  website?: string;
  occupation?: string;
  whatsapp_number?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private bucketName = 'event-images';

  public supabase!: SupabaseClient;
  public userSubject$ = new BehaviorSubject<any>(null);
  private messageSubject = new BehaviorSubject<any>(null);
  message$ = this.messageSubject.asObservable();
  private channel: RealtimeChannel | null = null;
  private readonly SESSION_KEY = 'app_session';

  private unreadMessagesSubject = new BehaviorSubject<number>(0);
  unreadMessages$ = this.unreadMessagesSubject.asObservable();

  
  private profileSubject = new BehaviorSubject<Profile | null>(null);
  profile$ = this.profileSubject.asObservable();

  private sessionInitialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    this.userSubject$ = new BehaviorSubject<User | null>(null);
    this.initSession();
  }
  
  private async initSession() {
    const storedSession = this.getStoredSession();
    if (storedSession) {
      console.log('Stored session found:', storedSession);
      try {
        const { data, error } = await this.supabase.auth.setSession(storedSession);
        if (error) throw error;
        console.log('Session set:', data);

        if (data.user) {
      
          this.userSubject$.next(data.user);

          // const profile = await this.loadProfile(data.user.id);
          // this.userProfileSubject.next(profile);   
        } else {
          console.error('No user found in session');
          this.userSubject$.next(null);
        }

      } catch (error) {

        console.error('Error setting session:', error);
        this.clearStoredSession();
      }
    }
    this.sessionInitialized.next(true);
  }

  async uploadAvatar(userId: string, avatarFile: Blob): Promise<any> {
    const fileName = `${userId}_${new Date().getTime()}.png`;
    const { data, error } = await this.supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, {
        contentType: 'image/png'
      });
  
    if (error) {
      throw error;
    }
  
    const { data: urlData } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
  
    return { data: { path: urlData.publicUrl }, error: null };
  }

  private clearStoredSession() {
    console.log('Clearing stored session');
    localStorage.removeItem(this.SESSION_KEY);
  }
  
  private getStoredSession(): Session | null {
    const storedSession = localStorage.getItem(this.SESSION_KEY);
    return storedSession ? JSON.parse(storedSession) : null;
  }
  
  private async loadUserFromSession() {
    const { data } = await this.supabase.auth.getSession();
    if (data?.session) {
      this.userSubject$.next(data.session.user);
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
    return this.userSubject$.value;
  }

  getCurrentUser(): Observable<User | null> {
    return this.userSubject$.asObservable();
  }

  createEvent(event: MyEvent, file: Blob): Observable<MyEvent> {
    return this.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          throw new Error('User must be authenticated to create an event');
        }
        return from(this.uploadImage(file, user.id));
      }),
      switchMap(imageUrl => {
        event.image_url = imageUrl;
        return from(this.supabase.from('events').insert(event).single());
      }),
      map(({ data, error }) => {
        if (error) {
          throw new Error(`Failed to create event: ${error.message}`);
        }
        return data as MyEvent;
      }),
      catchError((error: any) => {
        console.error('Error in createEvent:', error);
        return throwError(() => new Error(`Failed to create event: ${error.message}`));
      })
    );
  }

  private async uploadImage(file: Blob, userId: string): Promise<string> {
    const filePath = `events/${userId}/${Date.now()}`;
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data: urlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (data.user) {
      this.storeSession(data.session);
      this.userSubject$.next(data.user);
    }
    return { error };
  }


  private storeSession(session: Session) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  async signUp(email: string, password: string, profileData?: any) {
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
    }
  
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    this.userSubject$.next(null);
    if (!error) {
      this.userSubject$.next(null);
      this.router.navigate(['/']);
    }
  }

  async getUsers() {
    return await this.supabase
      .from('profiles')
      .select('id, display_name, avatar_url, occupation, website, bio, is_admin')
      .neq('id', '00000000-0000-0000-0000-000000000000');
  }

  
  async getProfile(userId: string) {
    return await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  }

  async updateProfile(userId: string, updates: any) {
    return await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
  }


  // Live Chat Messaging 
  async sendMessage(user: any, message: any, profile: Profile | null) {
  
    
    const result = await this.supabase.from('messages').insert({
      ...message,
      user_id: user.id,
      user_email: user.email,
      user_avatar_url: profile?.avatar_url || null,
      user_display_name: profile?.display_name || null
    });

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

    this.channel = this.supabase
      .channel('public:messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          this.messageSubject.next(payload.new);
          this.handleNewMessage(payload.new);
        }
      )
      .subscribe((status) => {
        // console.log('Subscription status:', status);
      });
  }

  private async handleNewMessage(message: any) {
    const currentUser = this.getUser();
    console.log('Current User:', currentUser);
    console.log('Message User ID:', message.user_id);
    if (currentUser?.id !== message.user_id) {
      console.log('Incrementing unread messages');
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

  

  private onlineUsersSubject = new BehaviorSubject<number>(0);
  onlineUsers$ = this.onlineUsersSubject.asObservable();
  private presenceChannel: RealtimeChannel | null = null;
  subscribeToPresence() {
    console.log('Subscribing to presence');
    if (this.presenceChannel) return;

    this.presenceChannel = this.supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const presenceState = this.presenceChannel?.presenceState() || {};
        const onlineUsers = Object.keys(presenceState).length;
        console.log('Online users:', onlineUsers);
        this.onlineUsersSubject.next(onlineUsers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await this.presenceChannel?.track({
            user_id: this.getUser()?.id,
            online_at: new Date().toISOString(),
          });
        }
      });
  }

  unsubscribeFromPresence() {
    if (this.presenceChannel) {
      this.supabase.removeChannel(this.presenceChannel);
      this.presenceChannel = null;
    }
  }

  async getUpcomingEvents(limit: number = 6) {
    const currentDate = new Date().toISOString();
    return this.supabase
      .from('events')
      .select('*')
      // .gte('date', currentDate)
      .order('date', { ascending: true })
      .limit(limit);
  }

  async searchEvents(query: string) {
    return this.supabase
      .from('events')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
      .order('date', { ascending: true });
  }
}