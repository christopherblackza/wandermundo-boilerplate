import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BlogPost, BlogService } from '../../services/blog.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss']
})
export class BlogListComponent implements OnInit {
  blogPosts: BlogPost[] = [];
  trendingPosts: BlogPost[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private blogService: BlogService) {}

  ngOnInit() {
    this.loadPosts();
    this.loadTrendingPosts();
  }

  private loadPosts() {
    this.blogService.getAllPosts().subscribe({
      next: (posts) => {
        this.blogPosts = posts;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load blog posts';
        this.isLoading = false;
      }
    });
  }

  private loadTrendingPosts() {
    this.blogService.getTrendingPosts().subscribe({
      next: (posts) => {
        this.trendingPosts = posts;
      },
      error: (error) => {
        console.error('Failed to load trending posts:', error);
      }
    });
  }
}