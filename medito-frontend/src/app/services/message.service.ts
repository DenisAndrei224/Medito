import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getMessages(teacherId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages`, {
      params: { contact_id: teacherId },
    });
  }

  sendMessage(teacherId: number, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages`, {
      receiver_id: teacherId,
      content,
    });
  }

  // markAsRead(messageId: number): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/messages/${messageId}/read`, {});
  // }

  // getUnreadCount(): Observable<number> {
  //   return this.http.get<number>(`${this.apiUrl}/messages/unread-count`);
  // }
}
