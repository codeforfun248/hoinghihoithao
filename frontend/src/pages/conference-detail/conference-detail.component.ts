import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // Lấy ID từ URL
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ApiService } from '../../services/api.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { AuthService } from '../../services/auth.service';
import { ModalSubmissionComponent } from '../../components/modal-submission/modal-submission.component';

@Component({
  selector: 'app-conference-detail',
  templateUrl: './conference-detail.component.html',
  styleUrls: ['./conference-detail.component.css'],
  imports: [CommonModule, NzIconModule, NzButtonModule, DatePipe, NzModalModule],
})
export class ConferenceDetailComponent implements OnInit {
  // Thêm biến này vào đầu class
  userStatus: string | null = null; // 'registered', 'canceled', 'checked_in', hoặc null
  conference: any = null;
  schedules: any[] = [];
  activeTab = 'Chương trình';

  // Biến đếm ngược
  countdown: { days: string; hours: string; minutes: string; seconds: string } | null = null;
  countdownText: string = 'Đang tải...';
  private timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    public apiService: ApiService,
    private location: Location,
    private msg: NzMessageService,
    private modal: NzModalService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.getConferenceDetail();
  }

  // 👇 Hủy bộ đếm khi rời khỏi trang để tránh rò rỉ bộ nhớ
  ngOnDestroy() {
    this.clearCountdown();
  }

  // Hàm quay lại trang trước đó
  goBack() {
    this.location.back();
  }

  getConferenceDetail() {
    // Lấy ID từ URL (vd: /conferences/69c00c508aef02e8dcc93fe0)
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const query = { _id: id };

    // Gọi API lấy đúng 1 hội nghị
    this.apiService.getConferences_byFields(query, {}, 1, 1).then((res: any) => {
      // Vì API trả về mảng data, ta lấy phần tử đầu tiên
      if (res.data && res.data.length > 0) {
        this.conference = res.data[0];
        this.groupSessionsByDate(this.conference.sessions);

        this.startCountdown();

        // 2. Lấy thông tin hội nghị xong -> Check xem User đã đăng ký chưa
        this.checkUserRegistrationStatus(id);
      }
    });
  }

  // Hàm gọi API check trạng thái
  checkUserRegistrationStatus(conferenceId: string) {
    // Giả sử bạn có API GET /api/registrations/check/:conferenceId
    this.apiService
      .checkRegistration(conferenceId)
      .then((res: any) => {
        // API trả về status: 'registered', 'canceled', 'checked_in' hoặc null
        this.userStatus = res.data.status;
      })
      .catch(() => {
        this.userStatus = null; // Bị lỗi hoặc chưa đăng nhập
      });
  }

  // 👇 LOGIC TÍNH TOÁN ĐẾM NGƯỢC 👇
  startCountdown() {
    if (!this.conference?.start_date || !this.conference?.end_date) return;

    const startTime = new Date(this.conference.start_date).getTime();
    const endTime = new Date(this.conference.end_date).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();

      if (now < startTime) {
        // Trạng thái: Sắp diễn ra
        const timeLeft = startTime - now;
        this.countdownText = 'Bắt đầu sau';
        this.countdown = {
          days: Math.floor(timeLeft / (1000 * 60 * 60 * 24))
            .toString()
            .padStart(2, '0'),
          hours: Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            .toString()
            .padStart(2, '0'),
          minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
            .toString()
            .padStart(2, '0'),
          seconds: Math.floor((timeLeft % (1000 * 60)) / 1000)
            .toString()
            .padStart(2, '0'),
        };
      } else if (now >= startTime && now <= endTime) {
        // Trạng thái: Đang diễn ra
        this.countdown = null;
        this.countdownText = 'Đang diễn ra';
        this.clearCountdown(); // Dừng đồng hồ lại vì đã bắt đầu
      } else {
        // Trạng thái: Đã kết thúc
        this.countdown = null;
        this.countdownText = 'Đã kết thúc';
        this.clearCountdown();
      }
    };

    updateTimer(); // Gọi ngay lập tức lần đầu
    this.timerInterval = setInterval(updateTimer, 1000); // Sau đó lặp lại mỗi giây
  }

  clearCountdown() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  // Hàm tự động gom nhóm các phiên (sessions) theo từng ngày
  groupSessionsByDate(sessions: any[]) {
    if (!sessions || sessions.length === 0) return;

    const grouped: any = {};
    const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

    sessions.forEach((session) => {
      const startDate = new Date(session.start_time);
      const dateString = `${startDate.getDate().toString().padStart(2, '0')}/${(startDate.getMonth() + 1).toString().padStart(2, '0')}/${startDate.getFullYear()}`;
      const dayName = daysOfWeek[startDate.getDay()];
      const fullDateKey = `${dayName}, ${dateString}`;

      if (!grouped[fullDateKey]) {
        grouped[fullDateKey] = [];
      }

      grouped[fullDateKey].push({
        time: `${this.formatTime(startDate)} - ${this.formatTime(new Date(session.end_time))}`,
        title: session.name,
        // Dữ liệu thật phần desc đang lưu tên phòng (vd: Hội trường 1)
        location: session.desc || 'Đang cập nhật',
      });
    });

    // Chuyển Object thành Array để hiển thị ra HTML
    this.schedules = Object.keys(grouped).map((key) => ({
      date: key,
      sessions: grouped[key],
    }));
  }

  formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  handleCopyClipboard() {
    // Lấy đường dẫn URL hiện tại của trình duyệt
    const currentUrl = window.location.href;

    // Sử dụng Clipboard API để copy
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        // Hiện thông báo thành công đẹp mắt ở góc trên màn hình
        this.msg.success('Đã sao chép đường dẫn sự kiện!');
      })
      .catch((err) => {
        // Phòng hờ trường hợp trình duyệt chặn quyền copy
        this.msg.error('Không thể sao chép. Vui lòng thử lại!');
        console.error('Lỗi copy clipboard: ', err);
      });
  }

  handleRegisterParticipate() {
    if (!this.authService.user) {
      this.msg.warning('Vui lòng đăng nhập để tiếp tục');
      this.authService.triggerLogin();
      return;
    }
    const isRegistered = this.userStatus === 'registered';

    this.modal.confirm({
      // Thay đổi tiêu đề/nội dung tùy theo trạng thái
      nzTitle: isRegistered ? 'Xác nhận hủy đăng ký' : 'Xác nhận đăng ký tham dự',
      nzContent: isRegistered
        ? `Bạn có chắc chắn muốn hủy đăng ký tham dự <b>${this.conference.name}</b> không?`
        : `Bạn có muốn đăng ký tham dự <b>${this.conference.name}</b> không?`,
      nzOkText: isRegistered ? 'Hủy đăng ký' : 'Đăng ký ngay',
      nzOkDanger: isRegistered, // Nút sẽ có màu đỏ nếu là hành động Hủy
      nzCancelText: 'Đóng',
      nzCentered: true,
      nzOnOk: () => {
        // Thay hàm này bằng hàm gọi API thực tế của bạn

        this.apiService
          .registerParticipate(this.conference._id)
          .then((res: any) => {
            this.msg.success(res.msg);

            // Cập nhật lại UI dựa trên data trả về từ Backend
            this.userStatus = res.data.status;

            if (res.data.status === 'registered') {
              this.conference.current_participants++;
            } else if (res.data.status === 'canceled') {
              this.conference.current_participants--;
            }
          })
          .catch((err) => {
            this.msg.error(err.msg || 'Có lỗi xảy ra!');
          });
      },
    });
  }

  handleSub() {
    if (!this.authService.user) {
      this.msg.warning('Vui lòng đăng nhập để tiếp tục');
      this.authService.triggerLogin();
      return;
    }
    const modalRef: any = this.modal.create({
      nzContent: ModalSubmissionComponent,
      nzWidth: '95vw',
      nzCentered: true,
      nzFooter: null,
      nzClosable: false,
      // 👇 CHÚ Ý TRUYỀN DỮ LIỆU VÀO ĐÂY 👇
      nzData: {
        conferenceId: this.conference._id,
        submissionDeadline: this.conference.submission_deadline,
      },
    });
  }
}
