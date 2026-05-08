import { Component, OnInit } from '@angular/core';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { AuthService } from '../../services/auth.service';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router, RouterLink } from '@angular/router';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

@Component({
  selector: 'app-authenticated-dropdown',
  templateUrl: './authenticated-dropdown.component.html',
  styleUrls: ['./authenticated-dropdown.component.css'],
  imports: [NzDropDownModule, NzIconModule, RouterLink, NzAvatarModule],
})
export class AuthenticatedDropdownComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private msg: NzMessageService,
    private router: Router,
  ) {}

  ngOnInit() {}

  handleLogout() {
    this.authService.onLogout().then((res: any) => {
      if (res.vcode == 0) {
        this.msg.success('Đăng xuất thành công');
        this.router.navigate(['']);
      }
    });
  }
}
