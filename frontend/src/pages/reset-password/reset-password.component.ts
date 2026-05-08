import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiService } from '../../services/api.service'; // Chỉnh đường dẫn cho đúng

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NzInputModule, NzButtonModule],
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private apiService: ApiService,
    private msg: NzMessageService,
  ) {}

  ngOnInit() {
    // Lấy token từ URL (VD: ?token=abcxyz...)
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
      if (!this.token) {
        this.msg.error('Đường dẫn không hợp lệ hoặc đã hết hạn!');
        this.router.navigate(['/']); // Đẩy về trang chủ nếu không có token
      }
    });
  }

  handleReset() {
    if (!this.newPassword || !this.confirmPassword) {
      this.msg.warning('Vui lòng điền đầy đủ mật khẩu!');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.msg.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (this.newPassword.length < 6) {
      this.msg.warning('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    this.isLoading = true;

    // Gọi API để đổi mật khẩu
    this.apiService
      .resetPassword({ token: this.token, newPassword: this.newPassword })
      .then(() => {
        this.msg.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
        this.router.navigate(['/']); // Chuyển về trang chủ
      })
      .catch((err: any) => {
        this.msg.error(err?.error?.message || 'Token đã hết hạn hoặc không hợp lệ!');
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
}
