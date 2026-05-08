import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from '../services/api.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
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
              this.msg.success('Đăng nhập thành công');
            }
          })
          .catch((error) => {
            console.error('Login failed:', error.error);
            this.msg.error('Đăng nhập thất bại! Vui lòng kiểm tra lại tài khoản.');
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }
}
