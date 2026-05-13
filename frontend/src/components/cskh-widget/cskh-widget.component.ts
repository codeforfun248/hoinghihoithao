import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cskh-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cskh-widget.component.html',
  styleUrls: ['./cskh-widget.component.css'],
})
export class CskhWidgetComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatBody') chatBody!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  isOpen = false;
  messages: any[] = [];
  inputValue = '';
  editingMessageId: string | null = null;
  editingContent = '';
  uploadingImage = false;
  previewImageUrl: string | null = null;
  pendingImageUrl: string | null = null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' = 'connecting';

  private shouldScroll = false;
  private subs = new Subscription();
  private chatSubs = new Subscription();
  private chatInitialized = false;

  constructor(
    public authService: AuthService,
    private chatService: ChatService,
  ) {}

  get isLoggedIn() {
    return !!this.authService.user;
  }

  get myId(): string {
    return this.authService.user?._id || '';
  }

  ngOnInit() {
    // Lắng nghe logout → reset toàn bộ
    this.subs.add(
      this.authService.logout$.subscribe(() => {
        this.resetChat();
      }),
    );

    // Lắng nghe login → khởi tạo chat
    this.subs.add(
      this.authService.login$.subscribe(() => {
        this.initChat();
      }),
    );

    // Nếu đã login sẵn khi component khởi tạo
    if (this.isLoggedIn) {
      this.initChat();
    }
  }

  private initChat() {
    // Cleanup subscription cũ
    this.chatSubs.unsubscribe();
    this.chatSubs = new Subscription();
    this.chatInitialized = false;
    this.messages = [];
    this.connectionStatus = 'connecting';

    // Kết nối socket
    this.chatService.connect();

    // Subscribe events
    this.subscribeToChatEvents();
    this.chatInitialized = true;

    // Theo dõi trạng thái kết nối
    this.chatSubs.add(
      this.chatService.connected$.subscribe((connected) => {
        this.connectionStatus = connected ? 'connected' : 'disconnected';
        // Khi kết nối thành công thì load lịch sử
        if (connected) {
          this.loadHistory();
        }
      }),
    );
  }

  private resetChat() {
    this.isOpen = false;
    this.messages = [];
    this.inputValue = '';
    this.pendingImageUrl = null;
    this.previewImageUrl = null;
    this.editingMessageId = null;
    this.chatInitialized = false;
    this.connectionStatus = 'connecting';

    this.chatSubs.unsubscribe();
    this.chatSubs = new Subscription();
    this.chatService.disconnect();
  }

  private subscribeToChatEvents() {
    this.chatSubs.add(
      this.chatService.newMessage$.subscribe((msg) => {
        const myId = this.myId;
        if (!myId) return;

        // Nhận tin nếu conversation thuộc về mình
        if (msg.conversationUserId === myId || msg.sender?._id === myId) {
          const exists = this.messages.some((m) => m._id === msg._id);
          if (!exists) {
            // Xóa temp message rồi push tin thật
            this.messages = this.messages.filter((m) => !m._tempId);
            this.messages.push(msg);
            this.shouldScroll = true;
          }
        }
      }),
    );

    this.chatSubs.add(
      this.chatService.messageDeleted$.subscribe(({ messageId }) => {
        const idx = this.messages.findIndex((m) => m._id === messageId);
        if (idx !== -1) {
          this.messages[idx] = {
            ...this.messages[idx],
            isDeleted: true,
            content: '',
            imageUrl: null,
          };
        }
      }),
    );

    this.chatSubs.add(
      this.chatService.messageEdited$.subscribe((updated) => {
        const idx = this.messages.findIndex((m) => m._id === updated._id);
        if (idx !== -1) this.messages[idx] = updated;
      }),
    );
  }

  async loadHistory() {
    try {
      const res = await this.chatService.getMyMessages();
      if (res.vcode === 0) {
        this.messages = res.data;
        this.shouldScroll = true;
      }
    } catch (e) {
      console.error('[CSKH] loadHistory error:', e);
    }
  }

  toggleChat() {
    if (!this.isLoggedIn) {
      this.authService.triggerLogin();
      return;
    }
    if (!this.chatInitialized) {
      this.initChat();
    }
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.shouldScroll = true;
  }

  sendMessage() {
    const content = this.inputValue.trim();
    if (!content && !this.pendingImageUrl) return;

    const imageUrl = this.pendingImageUrl;

    // Optimistic update — hiện tin ngay lập tức
    const tempMsg = {
      _tempId: Date.now().toString(),
      sender: {
        _id: this.myId,
        name: this.authService.user?.name,
        avatar: this.authService.user?.avatar,
      },
      conversationUserId: this.myId,
      content,
      imageUrl,
      createdAt: new Date().toISOString(),
      isDeleted: false,
      isEdited: false,
    };

    this.messages.push(tempMsg);
    this.shouldScroll = true;
    this.inputValue = '';
    this.pendingImageUrl = null;
    this.previewImageUrl = null;

    // Nếu socket đã connected thì gửi ngay
    if (this.chatService.isConnected()) {
      this.chatService.sendMessage(content, imageUrl);
    } else {
      // Chờ connected rồi gửi (tối đa 5 giây)
      console.log('[CSKH] Socket not connected, waiting...');
      const sub = this.chatService.connected$.pipe(
        filter((v) => v === true),
        take(1),
      ).subscribe(() => {
        console.log('[CSKH] Socket connected, sending now');
        this.chatService.sendMessage(content, imageUrl);
        sub.unsubscribe();
      });

      // Timeout 5s nếu không kết nối được
      setTimeout(() => {
        sub.unsubscribe();
      }, 5000);
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // ─── Image upload ────────────────────────────────────────────────────────────
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Hình ảnh không được vượt quá 10MB');
      return;
    }
    this.uploadingImage = true;
    try {
      const res = await this.chatService.uploadChatImage(file);
      if (res.vcode === 0) {
        this.pendingImageUrl = res.data;
        this.previewImageUrl = res.data;
      }
    } catch {
      alert('Tải ảnh thất bại, vui lòng thử lại');
    } finally {
      this.uploadingImage = false;
      this.fileInput.nativeElement.value = '';
    }
  }

  removePendingImage() {
    this.pendingImageUrl = null;
    this.previewImageUrl = null;
  }

  // ─── Edit ────────────────────────────────────────────────────────────────────
  startEdit(msg: any) {
    this.editingMessageId = msg._id;
    this.editingContent = msg.content;
  }

  cancelEdit() {
    this.editingMessageId = null;
    this.editingContent = '';
  }

  confirmEdit(msg: any) {
    if (!this.editingContent.trim()) return;
    this.chatService.editMessage(msg._id, this.editingContent, this.myId);
    this.cancelEdit();
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────
  deleteMessage(msg: any) {
    if (!confirm('Xóa tin nhắn này?')) return;
    this.chatService.deleteMessage(msg._id, this.myId);
  }

  isMine(msg: any): boolean {
    return msg.sender?._id === this.myId || !!msg._tempId;
  }

  trackById(_: number, msg: any): string {
    return msg._tempId || msg._id;
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll && this.chatBody) {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.chatSubs.unsubscribe();
  }
}
