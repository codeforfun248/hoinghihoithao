import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Quan trọng để dùng *ngIf
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true, // Dùng Component độc lập cho dễ gắn
  imports: [CommonModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css'],
})
export class ChatWidgetComponent {
  apiService = inject(ApiService);

  // Trạng thái ẩn/hiện khung chat
  isChatOpen: boolean = false;

  // Trạng thái hiển thị bong bóng chat nhỏ ban đầu
  isBubbleOpen: boolean = true;

  // Danh sách tin nhắn để hiển thị
  messages: any[] = [
    {
      role: 'ai',
      text: 'Chào bạn! Tôi là trợ lý AI của Đại học Thủ Dầu Một. Tôi có thể giúp bạn tìm kiếm tài liệu, thông tin hội nghị hoặc giải đáp thắc mắc về nghiên cứu khoa học. Bạn cần giúp gì không?',
      time: 'Vừa xong',
    },
  ];

  // Biến lưu nội dung input của người dùng
  userInputValue: string = '';

  // Hàm chuyển đổi trạng thái ẩn/hiện chat
  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    // Khi mở khung chat thì ẩn bong bóng chat
    if (this.isChatOpen) {
      this.isBubbleOpen = false;
    } else {
      this.isBubbleOpen = true; // Khi đóng khung chat thì hiện lại bong bóng
    }
  }

  // Hàm cập nhật giá trị input (gắn vào sự kiện input)
  updateInputValue(event: any) {
    this.userInputValue = event.target.value;
  }

  // Hàm gửi tin nhắn
  async sendMessage() {
    const valuePrompt = this.userInputValue.trim();
    if (!this.userInputValue.trim()) return;

    // 1. Thêm tin nhắn của bạn vào danh sách
    this.messages.push({
      role: 'user',
      text: this.userInputValue,
      time: 'Vừa xong',
    });

    const userQuestion = this.userInputValue;
    this.userInputValue = ''; // Reset ô input

    // 2. Thêm trạng thái "Đang suy nghĩ..." của AI
    this.messages.push({ role: 'ai', text: 'Đang suy nghĩ...', time: '' });

    try {
      // 3. Gọi Backend (lấy code fetch bạn đã làm)
      const res = await this.apiService.askAI(valuePrompt);
      if (res.vcode == 0) {
        this.messages.pop();
        this.messages.push({ role: 'ai', text: res.data, time: 'Vừa xong' });
      } else {
        this.messages.pop();
        this.messages.push({ role: 'ai', text: 'Vui lòng thử lại sau!.', time: '' });
      }
    } catch (error) {
      console.error('Lỗi Backend:', error);
      this.messages.pop();
      this.messages.push({ role: 'ai', text: 'Vui lòng thử lại sau!.', time: '' });
    }
  }
}
