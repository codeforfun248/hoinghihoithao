import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { ApiService } from '../../services/api.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    NzIconModule,
    NzSelectModule,
    NzPaginationModule,
    DatePipe,
    NzSpinModule,
    RouterLink,
  ],
})
export class HomeComponent implements OnInit {
  // Biến tìm kiếm và bộ lọc
  searchText: string = '';
  selectedFaculty = 'all';
  selectedTime = 'Tất cả thời gian';
  selectedStatus = 'Tất cả trạng thái';

  conferences: any = [];
  faculties: any = [];

  pageIndex: number = 1;
  total: number = 1;
  pageSize: number = 9;
  isLoading: boolean = false;

  constructor(public apiService: ApiService) {}

  ngOnInit() {
    this.getFaculties();
    this.getConferences();
  }

  getFaculties() {
    this.apiService.getFaculties_byFields({}, {}).then((res: any) => {
      this.faculties = res.data;
    });
  }

  // 👇 CHẠY KHI NHẤN NÚT TÌM KIẾM 👇
  onSearch() {
    this.pageIndex = 1; // Reset về trang đầu
    this.getConferences();
  }

  // 👇 CHẠY KHI THAY ĐỔI DROPDOWN BỘ LỌC 👇
  onFilterChange() {
    this.pageIndex = 1; // Reset về trang đầu
    this.getConferences();
  }

  getConferences() {
    this.isLoading = true;

    // Mặc định chỉ lấy hội nghị đã được duyệt hiển thị ra trang chủ
    const query: any = { status: 'confirmed' };

    // 1. Lọc theo từ khóa (Tên hội nghị) - Tìm kiếm gần đúng không phân biệt hoa thường
    if (this.searchText.trim()) {
      query.name = { $regex: this.searchText.trim(), $options: 'i' };
    }

    // 2. Lọc theo Khoa/Viện
    if (this.selectedFaculty && this.selectedFaculty !== 'all') {
      query.faculty = this.selectedFaculty;
    }

    // Xử lý thời gian chung
    let startDateQuery: any = {};
    const currDate = new Date();

    // 3. Lọc theo khoảng thời gian (Tuần này / Tháng này)
    if (this.selectedTime === 'Tuần này') {
      const startOfWeek = new Date(currDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Tính ngày thứ 2 đầu tuần
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Cộng thêm 6 ngày ra Chủ nhật
      endOfWeek.setHours(23, 59, 59, 999);

      startDateQuery.$gte = startOfWeek;
      startDateQuery.$lte = endOfWeek;
    } else if (this.selectedTime === 'Tháng này') {
      const startOfMonth = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
      const endOfMonth = new Date(
        currDate.getFullYear(),
        currDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      startDateQuery.$gte = startOfMonth;
      startDateQuery.$lte = endOfMonth;
    }

    // 4. Lọc theo Trạng thái thời gian thực
    if (this.selectedStatus === 'Sắp diễn ra') {
      // Tính thời điểm 3 ngày sau kể từ hiện tại
      const threeDaysLater = new Date(currDate.getTime() + 3 * 24 * 60 * 60 * 1000);

      // Điều kiện: Thời gian bắt đầu phải lớn hơn hiện tại VÀ nhỏ hơn hoặc bằng 3 ngày tới
      startDateQuery.$gt = currDate;
      startDateQuery.$lte = threeDaysLater;
    } else if (this.selectedStatus === 'Đang diễn ra') {
      // Đã bắt đầu và chưa kết thúc
      startDateQuery.$lte = currDate;
      query.end_date = { $gte: currDate };
    }

    // Gộp điều kiện thời gian vào query gốc nếu có
    if (Object.keys(startDateQuery).length > 0) {
      query.start_date = startDateQuery;
    }

    const sort = { _id: -1 }; // Mới nhất lên đầu

    this.apiService
      .getConferences_byFields(query, sort, this.pageIndex, this.pageSize)
      .then((res: any) => {
        this.conferences = res.data;
        this.total = res.total;
      })
      .finally(() => (this.isLoading = false));
  }

  onPageIndexChange(newIndex: number) {
    this.pageIndex = newIndex;
    this.getConferences();
    window.scrollTo({ top: 500, behavior: 'smooth' });
  }

  isUpcoming(startDateStr: string): boolean {
    if (!startDateStr) return false;
    const startDate = new Date(startDateStr).getTime();
    const now = new Date().getTime();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    return startDate > now && startDate - now <= threeDaysInMs;
  }
}
