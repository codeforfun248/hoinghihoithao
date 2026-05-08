import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // Lấy ID từ URL
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ApiService } from '../../services/api.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { AuthService } from '../../services/auth.service';
import { ModalSubmissionComponent } from '../../components/modal-submission/modal-submission.component';
import { environment } from '../../environments/environment';
import KeenSlider from 'keen-slider';

@Component({
  selector: 'app-conference-detail',
  templateUrl: './conference-detail.component.html',
  styleUrls: [
    './conference-detail.component.css',
    '../../../node_modules/keen-slider/keen-slider.min.css',
  ],
  imports: [CommonModule, NzIconModule, NzButtonModule, DatePipe, NzModalModule],
})
export class ConferenceDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  // Thêm biến này vào đầu class
  userStatus: string | null = null; // 'registered', 'canceled', 'checked_in', hoặc null
  conference: any = null;
  schedules: any[] = [];
  activeTab = 'Chương trình';
  sponsors = [
    {
      name: 'Google',
      logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
      link: 'https://www.google.com',
    },
    {
      name: 'Microsoft',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/200px-Microsoft_logo_%282012%29.svg.png',
      link: 'https://www.microsoft.com',
    },
    {
      name: 'Apple',
      logo: 'https://www.apple.com/ac/structured-data/images/open_graph_logo.png',
      link: 'https://www.apple.com',
    },
    {
      name: 'Amazon',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/220px-Amazon_logo.svg.png',
      link: null,
    },
    {
      name: 'Facebook',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Facebook_logo_%282010-2015%29.svg/220px-Facebook_logo_%282010-2015%29.svg.png',
      link: 'https://www.facebook.com',
    },
    {
      name: 'Intel',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Intel_logo_%282020%2C_version_2%29.svg/200px-Intel_logo_%282020%2C_version_2%29.svg.png',
      link: 'https://www.intel.com',
    },
  ];
  @ViewChild('sliderRef') sliderRef!: ElementRef<HTMLElement>;

  slider: any = null;

  currentSlide: number = 0;

  // Biến đếm ngược
  countdown: { days: string; hours: string; minutes: string; seconds: string } | null = null;
  countdownText: string = 'Đang tải...';
  private timerInterval: any;

  // Keen Slider
  @ViewChild('sponsorsSlider') sponsorsSlider!: ElementRef<HTMLDivElement>;
  keenSliderInstance: any = null;

  URL_FE = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    public apiService: ApiService,
    private location: Location,
    private msg: NzMessageService,
    private modal: NzModalService,
    private authService: AuthService,
    private titleService: Title,
  ) {}

  ngOnInit() {
    this.getConferenceDetail();
  }

  ngAfterViewInit() {
    if (this.sponsorsSlider && this.sponsors.length > 0) {
      this.initKeenSlider();
    }
  }

  initKeenSlider() {
    if (this.sponsorsSlider?.nativeElement) {
      this.keenSliderInstance = new KeenSlider(this.sponsorsSlider.nativeElement, {
        slides: {
          perView: 6,
          spacing: 16,
        },
        breakpoints: {
          '(max-width: 480px)': {
            slides: {
              perView: 2,
              spacing: 8,
            },
          },
          '(max-width: 768px)': {
            slides: {
              perView: 3,
              spacing: 12,
            },
          },
          '(max-width: 1024px)': {
            slides: {
              perView: 4,
              spacing: 12,
            },
          },
        },
        loop: false,
        mode: 'snap',
        rubberband: true,
        drag: true,
      });
    }
  }

  // 👇 Hủy bộ đếm khi rời khỏi trang để tránh rò rỉ bộ nhớ
  ngOnDestroy() {
    this.clearCountdown();
    if (this.keenSliderInstance) {
      this.keenSliderInstance.destroy();
    }
    this.titleService.setTitle('Hệ thống Quản lý Sự kiện'); // Tên mặc định tạm thời

    if (this.slider) this.slider.destroy();
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
        this.titleService.setTitle(this.conference.name);
        this.groupSessionsByDate(this.conference.sessions);

        this.startCountdown();

        // 2. Lấy thông tin hội nghị xong -> Check xem User đã đăng ký chưa
        this.checkUserRegistrationStatus(id);

        setTimeout(() => {
          this.slider = new KeenSlider(this.sliderRef.nativeElement, {
            initial: this.currentSlide,
            loop: true,
            slides: {
              perView: 3,
              spacing: 13,
            },
            slideChanged: (s) => {
              this.currentSlide = s.track.details.rel;
            },
          });
        });
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

        return this.apiService
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

  handleRouteGoogleMap(item: any) {
    if (!item?.map) return;
    window.open(item.map, '_blank');
  }

  openSponsorLink(link: string | null) {
    if (link) {
      window.open(link, '_blank');
    }
  }
}
