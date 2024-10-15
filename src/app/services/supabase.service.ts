import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  get client() {
    return this.supabase;
  }

  async signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async getUser() {
    return this.supabase.auth.getUser();
  }

  async createEvent(eventData: any) {
    return this.supabase.from('events').insert(eventData);
  }

  async getEvents() {
    return this.supabase.from('events').select('*');
  }

  async getWhatsAppGroups() {
    return this.supabase.from('whatsapp_groups').select('*');
  }

  subscribeToMessages(callback: (payload: any) => void) {
    return this.supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, callback)
      .subscribe();
  }

  async sendMessage(message: any) {
    return this.supabase.from('messages').insert(message);
  }

  async getMessages() {
    return this.supabase
      .from('messages')
      .select(`
        *,
        user:user_id (
          email
        )
      `)
      .order('created_at', { ascending: true });
  }
}