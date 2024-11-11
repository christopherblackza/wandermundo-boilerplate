import { Injectable } from '@angular/core';
import { createClient, RealtimeChannel, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, catchError, filter, from, map, Observable, switchMap, tap, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { MyEvent } from '../models/event.model';
import { UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  public userSubject$ = new BehaviorSubject<User | null>(null);
  public userProfileSubject$ = new BehaviorSubject<UserProfile | null>(null);
  private messageSubject = new BehaviorSubject<any>(null);
  message$ = this.messageSubject.asObservable();
  private channel: RealtimeChannel | null = null;

  private unreadMessagesSubject = new BehaviorSubject<number>(0);
  unreadMessages$ = this.unreadMessagesSubject.asObservable();

  private bucketName = 'event-images';
  private readonly SESSION_KEY = 'app_session';

  private sessionInitialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private isViewingChat = false;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });
    this.userSubject$ = new BehaviorSubject<User | null>(null);
    this.initSession();
  }

  private async initSession() {
    const storedSession = this.getStoredSession();
    console.log('storedSession', storedSession);
    if (storedSession) {
      try {
        const { data, error } = await this.supabase.auth.setSession(storedSession);
        if (error) throw error;

        if (data.user) {
          console.log('data.user', data.user);
          this.userSubject$.next(data.user);
          const profile = await this.getProfile(data.user.id);
          console.log('profile', profile);
          // this.userProfileSubject.next(profile);
        } else {
          this.userSubject$.next(null);
        }

        this.userSubject$.next(data.user);
      } catch (error) {
        console.error('Error setting session:', error);
        this.clearStoredSession();
      }
    }
    this.sessionInitialized.next(true);
  }

  private storeSession(session: Session) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  private getStoredSession(): Session | null {
    const storedSession = localStorage.getItem(this.SESSION_KEY);
    return storedSession ? JSON.parse(storedSession) : null;
  }

  private clearStoredSession() {
    localStorage.removeItem(this.SESSION_KEY);
  }

  isSessionInitialized(): Observable<boolean> {
    return this.sessionInitialized.asObservable();
  }

  setViewingChat(isViewing: boolean) {
    this.isViewingChat = isViewing;
  }



  async loadUser() {
    const { data } = await this.supabase.auth.getUser();
    this.userSubject$.next(data.user);
    this.sessionInitialized.next(true);
  }

  get client() {
    return this.supabase;
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (data.user) {
      this.userSubject$.next(data.user);
    }
    return { data, error };
  }

  async signIn(email: string, password: string): Promise<{ error: any }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    console.log('data', data);
    if (data.user) {
      this.userSubject$.next(data.user);
      if (data.session) {
        this.storeSession(data.session);
      }
    }
    return { error };
  }


  // async signIn(email: string, password: string) {
  //   const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
  //   if (data.user) {
  //     this.userSubject$.next(data.user);
  //   }
  //   return { data, error };
  // }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    this.userSubject$.next(null);
    return { error };
  }

  getUser() {
    return this.userSubject$.value;
  }

  async createEventOld(eventData: MyEvent) {
    return this.supabase.from('events').insert(eventData).single();
  }

  
  createEvent(event: MyEvent, file: Blob): Observable<MyEvent> {

    console.log('Creating event:', event);

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
      tap(createdEvent => console.log('Created event:', createdEvent)),
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


  async getEvents() {
    return this.supabase.from('events').select('*');
  }

  async getWhatsAppGroups() {
    return this.supabase.from('whatsapp_groups').select('*');
  }

  getCurrentUser(): Observable<User | null> {
    return this.sessionInitialized.pipe(
      filter(initialized => initialized),
      switchMap(() => this.userSubject$.asObservable())
    );
  }

  async getCurrentUserNew() {
    return await this.supabase.auth.getUser();
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

  async sendMessage(message: any) {
    console.log('Sending message:', message);
    const { data: { user } } = await this.supabase.auth.getUser();
    if (user) {
      const result = await this.supabase.from('messages').insert({
        ...message,
        user_id: user.id,
        user_email: user.email
      });
      console.log('Message sent result:', result);
      return result;
    } else {
      throw new Error('User not authenticated');
    }
  }

  async getMessages() {
    return this.supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });
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
  


  async getUsers() {
    return await this.supabase
      .from('profiles')
      .select('id, display_name, avatar_url, occupation');
  }
}