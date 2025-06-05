import { Component, OnInit } from '@angular/core';
import { PostService } from '../services/post.service';
import { Post } from '../models/post.model';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.getAllPosts();
  }

  getAllPosts(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.postService.getAllPosts().subscribe({
      next: (data: Post[]) => {
        // Specify the expected type of data
        this.posts = data;
        this.isLoading = false;
        console.log('Posts fetched successfully:', this.posts);
      },
      error: (err) => {
        this.errorMessage = 'Failed to load posts. Please try again later.';
        this.isLoading = false;
        console.error('Error fetching posts:', err);
      },
      complete: () => {
        console.log('Post fetching completed.');
      },
    });
  }
}
