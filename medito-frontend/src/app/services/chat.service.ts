import { Injectable } from '@angular/core';
import Pusher from 'pusher-js';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private pusher: Pusher;
  public channel: any;

  constructor(private http: HttpClient) {
    this.pusher = new Pusher(environment.pusher.key, {
      cluster: environment.pusher.cluster,
      // Removed forceTLS as requested
    });
    this.channel = this.pusher.subscribe('chat');
  }

  getMessages() {
    return this.http.get(`${environment.apiUrl}/chat/messages`);
  }

  sendMessage(message: string) {
    return this.http.post(`${environment.apiUrl}/chat/send`, { message });
  }
}
