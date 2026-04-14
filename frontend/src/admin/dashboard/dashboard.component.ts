import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { ApiService } from '../../services/api.service';
import { NzImageModule } from 'ng-zorro-antd/image';
import { DatePipe } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [
    NzCardModule,
    NzIconModule,
    NzTabsModule,
    FormsModule,
    NzTableModule,
    NzImageModule,
    DatePipe,
    NzSelectModule,
    NzTagModule,
  ],
})
export class DashboardComponent implements OnInit {
  totalConferences: number = 300;
  totalUsers: number = 1924;
  totalFaculties: number = 30;
  sort: any = {};
  keySearch: string = '';
  typeMap: any = {
    event: 'Sự kiện',
    conference: 'Hội nghị/Hội thảo',
  };

  tabs: any = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Chưa duyệt', value: 'pending' },
    { label: 'Đã duyệt', value: 'confirmed' },
    { label: 'Đã hủy', value: 'canceled' },
  ];
  currentTab: number = 0;
  conferences: any = [];

  statusOptions: any = [
    { label: 'Chưa duyệt', value: 'pending' },
    { label: 'Duyệt', value: 'confirmed' },
    { label: 'Hủy', value: 'canceled' },
  ];

  /** ------------------------Pagination------------------------ */
  /** Trang hiện tại */
  pageIndex: number = 1;
  /** Tổng số trang */
  total: number = 1;
  /** Số lượng bản ghi trên 1 trang */
  pageSize: number = 20;

  loading: boolean = false;

  constructor(
    public apiService: ApiService,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    this.getConferences();
    this.getDashboard();

    // const test = [
    //   {
    //     name: 'Ứng dụng công nghệ số trong phát triển khoa học và đổi mới sáng tạo',
    //     type: 'conference',
    //     status: 'pending',
    //     faculty: '69be379017ab5ae1b72adec1',
    //     start_date: '2026-03-18T08:00:00.000Z',
    //     end_date: '2026-03-18T17:30:00.000Z',
    //     submission_deadline: '2026-03-10T23:59:59.000Z',
    //     registration_deadline: '2026-03-15T23:59:59.000Z',
    //     max_participants: 250,
    //     location: 'Hội trường 2 – Trường Đại học Thủ Dầu Một',
    //     map: "<iframe src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.770480648577!2d106.67178467606357!3d10.98068928918081!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d1085e2b1c37%3A0x73bfa5616464d0ee!2sThu%20Dau%20Mot%20University!5e0!3m2!1sen!2s!4v1774057752735!5m2!1sen!2s' width='600' height='450' style='border:0;' allowfullscreen='' loading='lazy' referrerpolicy='no-referrer-when-downgrade'></iframe>",
    //     desc: 'Hội thảo hướng đến việc thiết lập diễn đàn học thuật cấp quốc gia về chuyển đổi số...',
    //     desc_detail:
    //       '<p>Hội thảo tập trung thảo luận các xu hướng mới nhất trong việc ứng dụng công nghệ thông tin, trí tuệ nhân tạo (AI), và Internet vạn vật (IoT) vào nghiên cứu khoa học. Các chuyên gia sẽ chia sẻ những kinh nghiệm thực tiễn và giải pháp đột phá giúp tối ưu hóa quy trình đổi mới sáng tạo trong các trường đại học và viện nghiên cứu.</p>',
    //     img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    //     sessions: [
    //       {
    //         name: 'Đón tiếp đại biểu',
    //         start_time: '2026-03-18T08:00:00.000Z',
    //         end_time: '2026-03-18T08:30:00.000Z',
    //         desc: 'Sảnh Hội trường 2',
    //       },
    //       {
    //         name: 'Phát biểu khai mạc',
    //         start_time: '2026-03-18T08:30:00.000Z',
    //         end_time: '2026-03-18T09:00:00.000Z',
    //         desc: 'Hội trường 2',
    //       },
    //       {
    //         name: 'Báo cáo chính: Tương lai của AI trong nghiên cứu',
    //         start_time: '2026-03-18T09:00:00.000Z',
    //         end_time: '2026-03-18T10:30:00.000Z',
    //         desc: 'Hội trường 2',
    //       },
    //       {
    //         name: 'Giải lao (Tea break)',
    //         start_time: '2026-03-18T10:30:00.000Z',
    //         end_time: '2026-03-18T10:45:00.000Z',
    //         desc: 'Khu vực hành lang',
    //       },
    //       {
    //         name: 'Phiên thảo luận chuyên đề 1: Dữ liệu lớn (Big Data)',
    //         start_time: '2026-03-18T10:45:00.000Z',
    //         end_time: '2026-03-18T12:00:00.000Z',
    //         desc: 'Phòng chuyên đề A',
    //       },
    //       {
    //         name: 'Nghỉ trưa',
    //         start_time: '2026-03-18T12:00:00.000Z',
    //         end_time: '2026-03-18T13:30:00.000Z',
    //         desc: 'Nhà ăn chuyên gia',
    //       },
    //       {
    //         name: 'Phiên thảo luận chuyên đề 2: Chuyển đổi số trong quản trị đại học',
    //         start_time: '2026-03-18T13:30:00.000Z',
    //         end_time: '2026-03-18T15:00:00.000Z',
    //         desc: 'Phòng chuyên đề B',
    //       },
    //       {
    //         name: 'Phiên toàn thể: Tổng kết và Bế mạc',
    //         start_time: '2026-03-18T15:30:00.000Z',
    //         end_time: '2026-03-18T17:30:00.000Z',
    //         desc: 'Hội trường 2',
    //       },
    //     ],
    //     speakers: [
    //       {
    //         user: '69bf704434a8aaa6857a0686',
    //         position: 'Diễn giả chính',
    //         _id: '69bf8b64183314a76a4d0c77',
    //       },
    //       {
    //         user: '69bf705434a8aaa6857a068a',
    //         position: 'Diễn giả phiên chuyên đề 1',
    //         _id: '69bf8b64183314a76a4d0c78',
    //       },
    //       {
    //         user: '69bf706434a8aaa6857a068b',
    //         position: 'Diễn giả phiên chuyên đề 2',
    //         _id: '69bf8b64183314a76a4d0c79',
    //       },
    //     ],
    //     committees: [
    //       {
    //         name: 'Ban chỉ đạo',
    //         members: [
    //           { user: '69bf4314900516e93e9c63a1', position: 'Trưởng ban' },
    //           { user: '69bf4314900516e93e9c63a2', position: 'Phó ban' },
    //         ],
    //       },
    //       {
    //         name: 'Ban tổ chức',
    //         members: [
    //           { user: '69bf4314900516e93e9c63a3', position: 'Trưởng ban tổ chức' },
    //           { user: '69bf4314900516e93e9c63a4', position: 'Ủy viên thường trực' },
    //           { user: '69bf4314900516e93e9c63a5', position: 'Ủy viên' },
    //         ],
    //       },
    //       {
    //         name: 'Ban truyền thông',
    //         members: [
    //           { user: '69bf4314900516e93e9c63a6', position: 'Trưởng ban truyền thông' },
    //           { user: '69bf4314900516e93e9c63a7', position: 'Phụ trách kỹ thuật' },
    //         ],
    //       },
    //     ],
    //     documents: [
    //       {
    //         name: 'Hướng dẫn nộp bài báo',
    //         url: 'http://localhost:3000/uploads/document/huong_dan_nop_bai.pdf',
    //       },
    //       {
    //         name: 'Template định dạng bài báo (Word)',
    //         url: 'http://localhost:3000/uploads/document/template_word.docx',
    //       },
    //       {
    //         name: 'Chương trình hội thảo dự kiến',
    //         url: 'http://localhost:3000/uploads/document/chuong_trinh.pdf',
    //       },
    //     ],
    //     createdAt: '2026-03-01T06:25:40.061Z',
    //     updatedAt: '2026-03-05T08:15:20.123Z',
    //   },
    // ];

    // test.forEach((item: any) => {
    //   this.apiService.addConference(item);
    // });
  }

  getDashboard() {
    this.apiService.getDashboardStats().then((res: any) => {
      if (res.vcode == 0) {
        this.totalConferences = res.data.total_conferences;
        this.totalUsers = res.data.total_uers;
        this.totalFaculties = res.data.total_faculties;
      }
    });
  }

  getConferences() {
    this.loading = true;
    let query: any = {};
    if (this.currentTab != 0) {
      query.status = this.tabs[this.currentTab].value;
    }
    this.apiService
      .getConferences_byFields(query, {}, this.pageIndex, this.pageSize)
      .then((res: any) => {
        this.conferences = res.data;
        this.total = res.total;
        this.loading = false;
      })
      .catch((err) => {
        console.error(err);
        this.loading = false;
      });
  }

  handleSortLocal = (a: any, b: any): number => {
    const an = (a?.name ?? '').toString();
    const bn = (b?.name ?? '').toString();
    return an.localeCompare(bn, undefined, { sensitivity: 'base' });
  };

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find((item) => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;

    if (sortField == 'name') {
      // this.sort = {
      //   [`name.${this.apiService.projectWorking.language.default}`]:
      //     sortOrder == 'ascend' ? 1 : -1,
      // };
    }

    if (!sortField) {
      this.sort = {};
    }

    if (!this.keySearch) {
      this.getConferences();
    }
  }

  handleChangeStatus(newStatus: string, data: any) {
    this.loading = true;
    this.apiService
      .updateConference(data._id, {
        status: newStatus,
      })
      .then((res: any) => {
        if (res.vcode == 0) {
          data.status = newStatus;
          if (
            data.status != this.tabs[this.currentTab].value &&
            this.tabs[this.currentTab].value != 'all'
          ) {
            this.conferences = this.conferences.filter((item: any) => item._id != data._id);
          }
        }
      })
      .finally(() => (this.loading = false));
  }
}
