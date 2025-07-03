import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  newMessage = '';
  private subscription: any;

  constructor(
    private chatService: ChatService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMessages();

    this.subscription = this.chatService.channel.bind(
      'App\\Events\\NewMessage',
      (data: any) => {
        this.messages.unshift(data.message); // New messages at top
      }
    );
  }

  loadMessages(): void {
    this.chatService.getMessages().subscribe({
      next: (messages: any) => {
        this.messages = messages;
      },
      error: (err) => {
        console.error('Error loading messages', err);
      },
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim() === '') return;

    this.chatService.sendMessage(this.newMessage).subscribe({
      next: () => {
        this.newMessage = '';
      },
      error: (err) => {
        console.error('Error sending message', err);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.chatService.channel.unbind(
        'App\\Events\\NewMessage',
        this.subscription
      );
    }
  }
}
