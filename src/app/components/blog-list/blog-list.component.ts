import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BlogPost, BlogService } from '../../services/blog.service';
import { NavbarComponent } from '../navbar/navbar.component';
import Swal from 'sweetalert2';

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

  deletePost(post: BlogPost, event: Event) {
    event.preventDefault();
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this post!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.blogService.deletePost(post.id).subscribe({
          next: () => {
            this.blogPosts = this.blogPosts.filter(p => p.id !== post.id);
            Swal.fire(
              'Deleted!',
              'Your post has been deleted.',
              'success'
            );
          },
          error: (error) => {
            console.error('Failed to delete post:', error);
            Swal.fire(
              'Error!',
              'Failed to delete post.',
              'error'
            );
          }
        });
      }
    });
  }

  canDelete(post: BlogPost): boolean {
    return this.blogService.canUserDeletePost(post);
  }
}