import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from '../services/api.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  authSubscription!: Subscription;

  protected readonly title = signal('TDMU Conference Management System');

  constructor(
    public apiService: ApiService,
    private socialService: SocialAuthService,
    public authService: AuthService,
    private msg: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.socialService.authState.subscribe((user) => {
      if (user) {
        this.authService
          .onGoogleLogin(user.idToken as string)
          .then((res: any) => {
            if (res.vcode == 0) {
              this.msg.success('Đăng nhập thành công');
            }
          })
          .catch((error) => {
            console.error('Login failed:', error.error);
            this.msg.error('Đăng nhập thất bại! Vui lòng kiểm tra lại tài khoản.');
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  // ==========================================
  // PHẦN LOGIC CỦA TDMU AI ASSISTANT
  // ==========================================
  isChatOpen = false;
  messages: any[] = [
    { role: 'ai', text: 'Chào bạn! Tôi là trợ lý AI của Đại học Thủ Dầu Một. Tôi có thể giúp gì cho bạn?', time: 'Vừa xong' }
  ];

  // Hàm ẩn/hiện chat
  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  // Hàm gửi tin nhắn tới Backend
  async sendToAI(val: string) {
    if (!val.trim()) return;
    
    // 1. Thêm tin nhắn của bạn vào màn hình
    this.messages.push({ role: 'user', text: val, time: 'Vừa xong' });

    // 2. Thêm hiệu ứng AI đang suy nghĩ để không bị cảm giác treo
    this.messages.push({ role: 'ai', text: 'TDMU AI đang soạn câu trả lời...', time: 'Đang xử lý' });

    try {
      const response = await fetch('http://localhost:3000/api/v1/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: val })
      });
      
      const data = await response.json();
      
      // 3. Xóa dòng "đang soạn câu trả lời..." đi
      this.messages.pop();
      
      // 4. Hiển thị câu trả lời thật từ Server
      if (data && data.reply) {
          this.messages.push({ role: 'ai', text: data.reply, time: 'Vừa xong' });
      } else {
          this.messages.push({ role: 'ai', text: 'Xin lỗi, AI không thể đưa ra phản hồi lúc này.', time: '' });
      }
    } catch (error) {
      // Nếu lỗi, cũng phải xóa dòng "đang soạn..." đi
      this.messages.pop();
      console.error("Lỗi kết nối:", error);
      this.messages.push({ role: 'ai', text: 'Không kết nối được server! Vui lòng kiểm tra lại Backend.', time: '' });
    }
  }
}