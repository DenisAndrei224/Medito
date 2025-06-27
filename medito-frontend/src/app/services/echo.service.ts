import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

// Add these type definitions
interface PusherChannel {
  listen: (event: string, callback: (data: any) => void) => PusherChannel;
  error: (callback: (error: any) => void) => PusherChannel;
  stopListening: (event: string) => PusherChannel;
}

declare global {
  interface Window {
    Pusher: any;
  }
}

window.Pusher = Pusher;

@Injectable({
  providedIn: 'root',
})
export class EchoService {
  private echo: any;

  constructor(private authService: AuthService) {
    this.echo = new Echo({
      broadcaster: 'pusher',
      key: environment.pusherKey,
      cluster: environment.pusherCluster,
      forceTLS: true,
      authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${this.authService.getToken()}`,
          Accept: 'application/json',
        },
      },
    });
  }

  listen(
    channel: string,
    event: string,
    callback: (data: any) => void
  ): PusherChannel {
    return this.echo.channel(channel).listen(event, callback);
  }

  privateChannel(channelIdentifier: string | number): PusherChannel {
    return this.echo.private(`chat.${channelIdentifier}`);
  }

  leaveChannel(channelIdentifier: string | number): void {
    this.echo.leave(`chat.${channelIdentifier}`);
  }

  getConnection(): Echo<any> {
    return this.echo;
  }
}
