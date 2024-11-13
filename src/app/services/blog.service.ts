import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { AuthService, Profile } from './auth.service';

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
  user_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private readonly BLOG_IMAGES_BUCKET = 'blog-images';

  
  constructor(private authService: AuthService) {}


  getAllPosts(): Observable<BlogPost[]> {
    return from(this.authService.client
      .from('blog_posts')
      .select('*')
      .eq('active', true)
      .order('date', { ascending: false })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      })
    );
  }

  getPostById(id: string): Observable<BlogPost> {
    return from(this.authService.client
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
    return from(this.authService.client
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
    return from(this.authService.client
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

  async uploadBlogImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log('File name:', fileName);
    console.log('File path:', filePath);
    console.log('File:', file);

    const { data, error } = await this.authService.client.storage
      .from(this.BLOG_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get the public URL
    const { data: urlData } = this.authService.client.storage
      .from(this.BLOG_IMAGES_BUCKET)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  createPost(post: Partial<BlogPost>, profile: Profile | null, imageFile: File): Observable<BlogPost> {
    // First upload the image, then create the post
    return from(this.uploadBlogImage(imageFile)).pipe(
      switchMap(imageUrl => {
        const newPost = {
          ...post,
          image: imageUrl, // Use the uploaded image URL
          read_time: post.read_time || 10,
          date: new Date().toISOString(),
          user_id: this.authService.getUser()?.id,
          author: profile?.display_name || 'Anonymous',
          author_image: profile?.avatar_url || 'assets/images/no-profile-photo.jpg',
          author_bio: profile?.bio || 'This user is keeping things mysterious – no bio yet!'
        };
        console.log('New post:', newPost);

        return from(this.authService.client
          .from('blog_posts')
          .insert([newPost])
          .select()
        ).pipe(
          map(response => {
            if (response.error) throw response.error;
            return response.data[0];
          })
        );
      })
    );
  }

  deletePost(postId: string): Observable<void> {
    return from(this.authService.client
      .from('blog_posts')
      .update({ active: false })
      .eq('id', postId)
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
      })
    );
  }

  canUserDeletePost(post: BlogPost): boolean {
    const currentUser = this.authService.getUser();
    return currentUser?.id === post.user_id;
  }
}