import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { BlogService } from '../../services/blog.service';
import { NavbarComponent } from '../navbar/navbar.component';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  author: string;
  authorImage: string;
  authorBio: string;
  tags: string[];
  readTime: number;
}

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    NavbarComponent,
    FormsModule
  ],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponent implements OnInit {
  post: BlogPost | null = null;
  relatedPosts: BlogPost[] = [];
  isLoading = true;
  error: string | null = null;
  currentUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private metaService: Meta,
    private blogService: BlogService
  ) {
    this.currentUrl = window.location.href;
  }

  ngOnInit() {
    this.loadBlogPost();
  }

  private loadBlogPost() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/blog']);
      return;
    }

    this.blogService.getPostById(id).subscribe({
      next: (post) => {
        this.post = post;
        this.isLoading = false;
        this.updateMetaTags();
        this.loadRelatedPosts(id);
      },
      error: (error) => {
        this.error = 'Failed to load blog post';
        this.isLoading = false;
      }
    });
  }

  private loadRelatedPosts(currentPostId: string) {
    this.blogService.getRelatedPosts(currentPostId).subscribe({
      next: (posts) => {
        this.relatedPosts = posts;
      },
      error: (error) => {
        console.error('Failed to load related posts:', error);
      }
    });
  }

  private updateMetaTags() {
    if (this.post) {
      this.titleService.setTitle(this.post.title);
      this.metaService.updateTag({ name: 'description', content: this.post.excerpt });
      this.metaService.updateTag({ property: 'og:title', content: this.post.title });
      this.metaService.updateTag({ property: 'og:description', content: this.post.excerpt });
      this.metaService.updateTag({ property: 'og:image', content: this.post.image });
      this.metaService.updateTag({ property: 'og:url', content: this.currentUrl });
    }
  }

  shareOnSocialMedia(platform: string) {
    if (!this.post) return;

    const url = encodeURIComponent(this.currentUrl);
    const text = encodeURIComponent(this.post.title);

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }

  async copyLinkToClipboard() {
    try {
      await navigator.clipboard.writeText(this.currentUrl);
      // You could add a toast notification here
      console.log('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }

  subscribeToNewsletter(email: string) {
    // Implement newsletter subscription logic
    console.log('Subscribe email:', email);
  }
}