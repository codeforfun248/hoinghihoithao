import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { GoogleSigninComponent } from '../google-signin/google-signin.component';
import { AuthService } from '../../services/auth.service';
import { AuthenticatedDropdownComponent } from '../authenticated-dropdown/authenticated-dropdown.component';

// NG-ZORRO Imports
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageService } from 'ng-zorro-antd/message'; // Thêm module thông báo
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

declare global {
  interface Window {
    google: any;
  }
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    GoogleSigninButtonModule,
    GoogleSigninComponent,
    AuthenticatedDropdownComponent,
    NzIconModule,
    NzDropDownModule,
    NzModalModule,
    NzButtonModule,
    NzInputModule,
    NzCheckboxModule,
    RouterLink,
  ],
})
export class HeaderComponent implements OnInit {
  openModalAuth: boolean = false;
  // Sửa lại kiểu dữ liệu của biến mode (nếu bạn đang khai báo chặt)
  mode: 'login' | 'register' | 'forgot' = 'login';
  passwordVisible: boolean = false;

  // Các biến hứng dữ liệu từ Form
  name = '';
  email = '';
  password = '';
  rememberMe = false;

  // Trạng thái nút bấm
  isLoading = false;

  constructor(
    public authService: AuthService,
    private msg: NzMessageService, // Inject message service
    private apiService: ApiService,
  ) {}

  ngOnInit() {
    // Lắng nghe sự kiện yêu cầu mở modal từ các component khác
    this.authService.showLogin.subscribe(() => {
      this.openModalAuth = true;
      this.mode = 'login';
    });
  }

  googleSignin(googleWrapper: any) {
    googleWrapper.click();
  }

  toggleMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.passwordVisible = false;
    // Reset lại form khi chuyển tab
    this.name = '';
    this.email = '';
    this.password = '';
  }

  async handleLogin() {
    if (!this.email || !this.password) {
      this.msg.warning('Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }

    this.isLoading = true;
    try {
      // Gọi service của bạn ở đây (sửa lại theo đúng cú pháp hàm của bạn)
      const res: any = await this.authService.onLogin(this.email, this.password);
      if (res.vcode == 0) {
        this.msg.success('Đăng nhập thành công!');
        this.openModalAuth = false; // Đóng modal
      }
    } catch (error: any) {
      this.msg.error(error?.msg || 'Tài khoản hoặc mật khẩu không đúng!');
    } finally {
      this.isLoading = false;
    }
  }

  async handleRegister() {
    if (!this.name || !this.email || !this.password) {
      this.msg.warning('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (this.password.length < 6) {
      this.msg.warning('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    this.isLoading = true;
    try {
      // Gọi service của bạn ở đây
      const res: any = await this.authService.onRegister(this.name, this.email, this.password);
      if (res.vcode == 0) {
        this.msg.success('Đăng ký thành công! Vui lòng đăng nhập.');
        this.toggleMode(); // Thành công thì tự động chuyển qua màn login
      }
    } catch (error: any) {
      this.msg.error(error?.msg || 'Đăng ký thất bại, email có thể đã tồn tại!');
    } finally {
      this.isLoading = false;
    }
  }

  // Thêm hàm xử lý quên mật khẩu
  handleForgotPassword() {
    if (!this.email) {
      this.msg.warning('Vui lòng nhập email để khôi phục mật khẩu!');
      return;
    }
    this.isLoading = true;
    // Giả sử bạn có hàm forgotPassword trong apiService
    this.apiService
      .forgotPassword(this.email)
      .then((res: any) => {
        this.msg.success('Vui lòng kiểm tra email để đặt lại mật khẩu!');
        this.mode = 'login'; // Chuyển về lại form đăng nhập
        this.email = ''; // Xóa trắng input
      })
      .catch((err: any) => {
        this.msg.error(err?.msg || 'Email không tồn tại trong hệ thống!');
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
}
