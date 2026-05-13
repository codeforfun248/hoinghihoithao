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
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzAvatarModule,
    NzEmptyModule,
    NzSpinModule,
    NzIconModule,
    NzToolTipModule,
  ],
  templateUrl: './admin-chat.component.html',
  styleUrls: ['./admin-chat.component.css'],
})
export class AdminChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatBody') chatBody!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  conversations: any[] = [];
  selectedConv: any = null;
  messages: any[] = [];
  inputValue = '';
  isLoadingConv = false;
  isLoadingMsg = false;
  editingMessageId: string | null = null;
  editingContent = '';
  uploadingImage = false;
  pendingImageUrl: string | null = null;
  previewImageUrl: string | null = null;
  private shouldScroll = false;
  private subs = new Subscription();

  constructor(
    public authService: AuthService,
    private chatService: ChatService,
  ) {}

  get myId(): string {
    return this.authService.user?._id || '';
  }

  ngOnInit() {
    this.chatService.connect();
    this.loadConversations();
    this.subscribeToEvents();
  }

  private subscribeToEvents() {
    this.subs.add(
      this.chatService.newMessage$.subscribe((msg) => {
        const convId = msg.conversationUserId;

        // Cập nhật hoặc thêm mới vào danh sách conversation
        const idx = this.conversations.findIndex((c) => c.userId === convId);
        if (idx !== -1) {
          this.conversations[idx].lastMessage = msg;
          const conv = this.conversations.splice(idx, 1)[0];
          this.conversations.unshift(conv);
        } else {
          // User mới nhắn lần đầu → reload
          this.loadConversations();
        }

        // Nếu đang xem conversation này thì thêm tin nhắn
        if (this.selectedConv?.userId === convId) {
          const exists = this.messages.some((m) => m._id === msg._id);
          if (!exists) {
            // Xóa temp message nếu có
            this.messages = this.messages.filter((m) => !m._tempId);
            this.messages.push(msg);
            this.shouldScroll = true;
          }
        }
      }),
    );

    this.subs.add(
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

    this.subs.add(
      this.chatService.messageEdited$.subscribe((updated) => {
        const idx = this.messages.findIndex((m) => m._id === updated._id);
        if (idx !== -1) this.messages[idx] = updated;
      }),
    );
  }

  async loadConversations() {
    this.isLoadingConv = true;
    try {
      const res = await this.chatService.getConversationList();
      if (res.vcode === 0) this.conversations = res.data;
    } catch (e) {
      console.error('loadConversations error', e);
    }
    this.isLoadingConv = false;
  }

  async selectConversation(conv: any) {
    this.selectedConv = conv;
    this.messages = [];
    this.isLoadingMsg = true;
    try {
      const res = await this.chatService.getMessagesByUser(conv.userId);
      if (res.vcode === 0) {
        this.messages = res.data;
        this.shouldScroll = true;
      }
    } catch (e) {
      console.error('selectConversation error', e);
    }
    this.isLoadingMsg = false;
  }

  sendMessage() {
    const content = this.inputValue.trim();
    if (!content && !this.pendingImageUrl) return;
    if (!this.selectedConv) return;

    const imageUrl = this.pendingImageUrl;
    const convUserId = this.selectedConv.userId;

    // Optimistic update
    const tempMsg = {
      _tempId: Date.now().toString(),
      sender: {
        _id: this.myId,
        name: this.authService.user?.name,
        avatar: this.authService.user?.avatar,
      },
      conversationUserId: convUserId,
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

    if (this.chatService.isConnected()) {
      this.chatService.sendMessage(content, imageUrl, convUserId);
    } else {
      const sub = this.chatService.connected$.pipe(
        filter((v) => v === true),
        take(1),
      ).subscribe(() => {
        this.chatService.sendMessage(content, imageUrl, convUserId);
        sub.unsubscribe();
      });
      setTimeout(() => sub.unsubscribe(), 5000);
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
      alert('Tải ảnh thất bại');
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
    this.chatService.editMessage(msg._id, this.editingContent, this.selectedConv?.userId);
    this.cancelEdit();
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────
  deleteMessage(msg: any) {
    if (!confirm('Xóa tin nhắn này?')) return;
    this.chatService.deleteMessage(msg._id, this.selectedConv?.userId);
  }

  isMine(msg: any): boolean {
    return msg.sender?._id === this.myId || !!msg._tempId;
  }

  trackById(_: number, msg: any): string {
    return msg._tempId || msg._id;
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  }

  getLastMsgPreview(conv: any): string {
    const msg = conv.lastMessage;
    if (!msg) return 'Chưa có tin nhắn';
    if (msg.isDeleted) return 'Tin nhắn đã bị xóa';
    if (msg.imageUrl && !msg.content) return '🖼 Hình ảnh';
    return msg.content?.length > 45 ? msg.content.slice(0, 45) + '...' : (msg.content || '');
  }

  ngAfterViewChecked() {
    if (this.shouldScroll && this.chatBody) {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
