import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getAllPosts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/posts`);
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/posts/${id}`);
  }

  createPost(postData: { title: string; content: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts`, postData);
  }

  updatePost(
    id: number,
    postData: { title: string; body: string }
  ): Observable<Post> {
    // Note: Laravel's update expects 'title' and 'body' based on your validate method.
    // Ensure your Angular form sends 'title' and 'body'
    return this.http.patch<Post>(`${this.apiUrl}/posts/${id}`, postData);
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/posts/${id}`);
  }
}
