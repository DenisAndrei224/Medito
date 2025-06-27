import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from '../services/message.service';
import { EchoService } from '../services/echo.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent implements OnInit, OnDestroy {
  teachers: User[] = [];
  selectedTeacher: User | null = null;
  messages: any[] = [];
  newMessage = '';
  currentUser: User | null = null;

  constructor(
    private messageService: MessageService,
    private echoService: EchoService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.authService.currentUser.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.loadTeachers();
        this.setupPrivateChannel(user.id);
      }
    });
  }

  loadTeachers(): void {
    this.userService.getTeachers().subscribe((teachers) => {
      this.teachers = teachers;
      if (this.teachers.length > 0) {
        this.selectTeacher(this.teachers[0]);
      }
    });
  }

  selectTeacher(teacher: User): void {
    this.selectedTeacher = teacher;
    this.messageService.getMessages(teacher.id).subscribe((messages) => {
      this.messages = messages;
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedTeacher) return;

    this.messageService
      .sendMessage(this.selectedTeacher.id, this.newMessage)
      .subscribe((message) => {
        this.messages.push(message);
        this.newMessage = '';
      });
  }

  // markMessagesAsRead(): void {
  //   const unreadMessages = this.messages.filter(
  //     (m) => m.receiver_id === this.currentUser.id && !m.read
  //   );

  //   unreadMessages.forEach((msg) => {
  //     this.messageService.markAsRead(msg.id).subscribe();
  //   });
  // }

  setupPrivateChannel(userId: number): void {
    this.echoService
      .privateChannel(`chat.${userId}`)
      .listen('.message.sent', (message: any) => {
        if (this.selectedTeacher?.id === message.sender_id) {
          this.messages.push(message);
        }
      });
  }

  ngOnDestroy(): void {
    if (this.currentUser) {
      this.echoService.leaveChannel(`chat.${this.currentUser.id}`);
    }
  }
}
