import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { Subject, BehaviorSubject, ReplaySubject } from 'rxjs';
import { environment } from '../environments/environment';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  private socket: Socket | null = null;
  private urlBE = environment.apiUrl;
  private apiUrl = `${environment.apiUrl}/api/v1/chat`;

  // ReplaySubject(1) giữ lại event cuối cùng cho subscriber mới
  newMessage$ = new ReplaySubject<any>(10);
  messageDeleted$ = new Subject<{ messageId: string }>();
  messageEdited$ = new Subject<any>();
  connected$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  connect() {
    // Nếu đã có socket và đang connected thì không tạo mới
    if (this.socket?.connected) return;

    // Nếu socket tồn tại nhưng bị disconnect thì reconnect
    if (this.socket) {
      this.socket.connect();
      return;
    }

    this.socket = io(this.urlBE, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
      this.connected$.next(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      this.connected$.next(false);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] Connect error:', err.message);
    });

    this.socket.on('new_message', (msg: any) => {
      console.log('[Socket] new_message received:', msg);
      this.newMessage$.next(msg);
    });

    this.socket.on('message_deleted', (data: any) => {
      this.messageDeleted$.next(data);
    });

    this.socket.on('message_edited', (msg: any) => {
      this.messageEdited$.next(msg);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.connected$.next(false);
  }

  // ─── Emit events ────────────────────────────────────────────────────────────
  sendMessage(content: string, imageUrl: string | null = null, conversationUserId?: string) {
    if (!this.socket?.connected) {
      console.warn('[Socket] Not connected, cannot send message');
      return;
    }
    console.log('[Socket] Emitting send_message:', { content, imageUrl, conversationUserId });
    this.socket.emit('send_message', { content, imageUrl, conversationUserId });
  }

  deleteMessage(messageId: string, conversationUserId: string) {
    this.socket?.emit('delete_message', { messageId, conversationUserId });
  }

  editMessage(messageId: string, content: string, conversationUserId: string) {
    this.socket?.emit('edit_message', { messageId, content, conversationUserId });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // ─── REST API ────────────────────────────────────────────────────────────────
  getMyMessages() {
    return lastValueFrom(this.http.get<any>(`${this.apiUrl}/my-messages`));
  }

  getConversationList() {
    return lastValueFrom(this.http.get<any>(`${this.apiUrl}/conversations`));
  }

  getMessagesByUser(userId: string) {
    return lastValueFrom(this.http.get<any>(`${this.apiUrl}/conversations/${userId}`));
  }

  uploadChatImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    // Dùng endpoint riêng cho chat, không cần truyền folder
    return lastValueFrom(this.http.post<any>(`${this.apiUrl}/upload-image`, formData));
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
