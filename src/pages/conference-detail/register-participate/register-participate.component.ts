import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-register-participate',
  templateUrl: './register-participate.component.html',
  styleUrls: ['./register-participate.component.css'],
  imports: [CommonModule, FormsModule, NzInputModule, NzSelectModule, NzButtonModule, NzIconModule],
})
export class RegisterParticipateComponent implements OnInit {
  // Bắn sự kiện ra ngoài khi đăng ký thành công (để Modal cha đóng lại)
  @Output() onSuccess = new EventEmitter<any>();

  formData = {
    name: '',
    email: '',
    className: '',
    facultyId: null,
    participationType: 'Người tham dự', // Mặc định
  };

  isLoading = false;

  // Dữ liệu mẫu (bạn có thể thay bằng API lấy danh sách Khoa sau)
  faculties: any = [];

  participationTypes = [
    { value: 'Báo cáo viên', label: 'Báo cáo viên' },
    { value: 'Người tham dự', label: 'Người tham dự' },
  ];

  constructor(
    private message: NzMessageService,
    private apiService: ApiService,
  ) {}

  ngOnInit() {
    this.getFaculties();
  }

  getFaculties() {
    this.apiService.getFaculties_byFields({}, {}).then((res: any) => {
      this.faculties = res.data;
    });
  }

  handleSubmit() {
    // Validate cơ bản
    if (!this.formData.name || !this.formData.email || !this.formData.participationType) {
      this.message.warning('Vui lòng điền đầy đủ các trường bắt buộc (*)');
      return;
    }

    // Validate email đơn giản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.message.error('Email không hợp lệ!');
      return;
    }

    this.isLoading = true;

    // Giả lập gọi API đăng ký (Chỗ này gọi apiService của bạn)
    setTimeout(() => {
      this.isLoading = false;
      this.message.success('Đăng ký tham dự thành công!');

      // Bắn sự kiện ra component cha cùng với dữ liệu form
      this.onSuccess.emit(this.formData);
    }, 800);
  }
}
