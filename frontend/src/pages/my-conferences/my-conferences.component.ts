import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-conferences',
  templateUrl: './my-conferences.component.html',
  styleUrls: ['./my-conferences.component.css'],
  imports: [
    CommonModule,
    RouterLink,
    NzTabsModule,
    NzSpinModule,
    NzIconModule,
    NzTagModule,
    DatePipe,
  ],
})
export class MyConferencesComponent implements OnInit {
  // Dữ liệu
  joinedConferences: any[] = [];
  createdConferences: any[] = [];

  // Trạng thái loading
  isLoadingJoined = false;
  isLoadingCreated = false;

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    private msg: NzMessageService,
  ) {}

  ngOnInit() {
    if (this.authService.user) {
      this.fetchJoinedConferences();
      this.fetchCreatedConferences();
    } else {
      this.msg.warning('Vui lòng đăng nhập để xem thông tin!');
    }
  }

  // 1. LẤY HỘI NGHỊ ĐÃ THAM GIA (Dựa vào bảng Registration)
  fetchJoinedConferences() {
    this.isLoadingJoined = true;
    const query = { user: this.authService.user._id };

    // Gọi API registrations, lấy những record của user này
    this.apiService
      .getRegistrations_byFields(query, { createdAt: -1 }, 1, 50)
      .then((res: any) => {
        // Dữ liệu trả về là array các Registration, bên trong có chứa object conference (do đã populate ở backend)
        this.joinedConferences = res.data;
      })
      .catch(() => this.msg.error('Lỗi tải danh sách tham gia'))
      .finally(() => (this.isLoadingJoined = false));
  }

  // 2. LẤY HỘI NGHỊ ĐÃ TẠO (Dựa vào bảng Conference)
  fetchCreatedConferences() {
    this.isLoadingCreated = true;
    const query = { author: this.authService.user._id };

    // Gọi API conferences, lọc theo author là user hiện tại
    this.apiService
      .getConferences_byFields(query, { _id: -1 }, 1, 50)
      .then((res: any) => {
        this.createdConferences = res.data;
      })
      .catch(() => this.msg.error('Lỗi tải danh sách đã tạo'))
      .finally(() => (this.isLoadingCreated = false));
  }
}
