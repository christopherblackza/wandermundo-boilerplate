import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  author: string;
  author_image: string;
  author_bio: string;
  tags: string[];
  read_time: number;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  constructor(private supabaseService: SupabaseService) {}

  getAllPosts(): Observable<BlogPost[]> {
    return from(this.supabaseService.client
      .from('blog_posts')
      .select('*')
      .order('date', { ascending: false })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      })
    );
  }

  getPostById(id: string): Observable<BlogPost> {
    return from(this.supabaseService.client
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      })
    );
  }

  getRelatedPosts(currentPostId: string, limit: number = 3): Observable<BlogPost[]> {
    return from(this.supabaseService.client
      .from('blog_posts')
      .select('*')
      .neq('id', currentPostId)
      .limit(limit)
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      })
    );
  }

  getTrendingPosts(limit: number = 3): Observable<BlogPost[]> {
    return from(this.supabaseService.client
      .from('blog_posts')
      .select('*')
      .limit(limit)
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      })
    );
  }
}