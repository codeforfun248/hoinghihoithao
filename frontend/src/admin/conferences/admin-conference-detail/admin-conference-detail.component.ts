import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ApiService } from '../../../services/api.service';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
// Thêm import này ở trên cùng
import * as XLSX from 'xlsx';
import { NzSelectModule } from 'ng-zorro-antd/select';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { SessionManagementComponent } from '../add-conference/session-management/session-management.component';
import { SpeakerManagementComponent } from '../add-conference/speaker-management/speaker-management.component';
import { DocumentManagementComponent } from '../add-conference/document-management/document-management.component';
import { CommitteesManagementComponent } from '../add-conference/committees-management/committees-management.component';
import { SponsorManagementComponent } from '../add-conference/sponsor-management/sponsor-management.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import {
  ClassicEditor,
  // Core & text
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Autoformat,
  BlockQuote,
  Link,
  List,
  TodoList,
  RemoveFormat,
  FindAndReplace,
  SelectAll,
  // Tables
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  // Images (OSS)
  Image,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  AutoImage /* tiện tự tạo <img> khi paste URL */,
  // Upload adapters (chọn 1 trong 2)
  Base64UploadAdapter, // nhanh để demo, không cần server
  // SimpleUploadAdapter, // nếu có endpoint
  // Media
  MediaEmbed,
  // Code & misc
  Code,
  CodeBlock,
  Highlight,
  HorizontalLine,
  Indent,
  Alignment,
  PasteFromOffice,
  WordCount,
  // Font & special chars
  Font,
  SpecialCharacters,
  SpecialCharactersEssentials,
  Subscript,
  Superscript,
} from 'ckeditor5';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
@Component({
  selector: 'app-admin-conference-detail',
  templateUrl: './admin-conference-detail.component.html',
  styleUrls: ['./admin-conference-detail.component.css'],
  imports: [
    CommonModule,
    NzTabsModule,
    NzPageHeaderModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzDropDownModule,
    NzModalModule,
    NzSelectModule,
    FormsModule,
    NzInputModule,
    ReactiveFormsModule,
    NzUploadModule,
    SessionManagementComponent,
    SpeakerManagementComponent,
    DocumentManagementComponent,
    CommitteesManagementComponent,
    SponsorManagementComponent,
    CKEditorModule,
    NzDatePickerModule,
  ],
})
export class AdminConferenceDetailComponent implements OnInit {
  conferenceId: string = '';
  conference: any = null;

  // Dữ liệu cho 2 tab
  registrations: any[] = [];
  submissions: any[] = [];

  // Thêm các biến này vào class
  isReviewModalVisible = false;
  isSavingReview = false;

  // Form chứa dữ liệu khi Admin đang đánh giá
  reviewForm = {
    _id: '',
    title: '',
    status: 'pending',
    reviewer_comments: '',
  };

  // Dữ liệu cho Form
  form!: FormGroup;
  faculties: any[] = [];
  uploading = false;
  isUpdating = false;

  // Dữ liệu cho các mảng
  sessions: any[] = [];
  speakers: any[] = [];
  committees: any[] = [];
  documents: any[] = [];
  sponsors: any[] = [];

  public Editor = ClassicEditor;
  public config: any = {
    // BẮT BUỘC từ v44+ khi tự host:
    licenseKey: 'GPL', // dùng OSS (GPL). Nếu dùng thương mại -> key thương mại.
    // Nếu muốn dùng CDN Free Plan thì vẫn cần key (trên Cloud). :contentReference[oaicite:5]{index=5}

    plugins: [
      Essentials,
      Paragraph,
      Heading,
      Bold,
      Italic,
      Underline,
      Strikethrough,
      Autoformat,
      BlockQuote,
      Link,
      List,
      TodoList,
      RemoveFormat,
      FindAndReplace,
      SelectAll,
      Table,
      TableToolbar,
      TableProperties,
      TableCellProperties,
      Image,
      ImageToolbar,
      ImageCaption,
      ImageStyle,
      ImageResize,
      AutoImage,
      Base64UploadAdapter, // hoặc SimpleUploadAdapter (rồi cấu hình simpleUpload)
      MediaEmbed,
      Code,
      CodeBlock,
      Highlight,
      HorizontalLine,
      Indent,
      Alignment,
      PasteFromOffice,
      WordCount,
      Font,
      SpecialCharacters,
      SpecialCharactersEssentials,
      Subscript,
      Superscript,
    ],

    toolbar: {
      items: [
        'undo',
        'redo',
        '|',
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'removeFormat',
        '|',
        'fontSize',
        'fontFamily',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'link',
        'blockquote',
        'code',
        'codeBlock',
        '|',
        'bulletedList',
        'numberedList',
        'todoList',
        '|',
        'insertTable',
        'mediaEmbed',
        'horizontalLine',
        '|',
        'alignment',
        'outdent',
        'indent',
        '|',
        'highlight',
        'findAndReplace',
        'selectAll',
        '|',
        'subscript',
        'superscript',
        'specialCharacters',
      ],
      shouldNotGroupWhenFull: true, // <--- thêm dòng này
    },
    fontSize: {
      options: [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32],
    },

    image: {
      toolbar: [
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side',
        '|',
        'toggleImageCaption',
        'imageTextAlternative',
        '|',
        'resizeImage',
      ],
      styles: ['inline', 'block', 'side'],
      resizeUnit: '%',
    },

    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        'tableProperties',
        'tableCellProperties',
      ],
    },

    // Nếu dùng SimpleUploadAdapter (thay cho Base64):
    // simpleUpload: {
    //   uploadUrl: '/api/upload',
    //   withCredentials: true
    // },

    // Loại bỏ hoàn toàn premium để không hiện watermark/đòi key thương mại:
    removePlugins: [
      'ExportPdf',
      'ExportWord',
      'CKBox',
      'CKFinder',
      'EasyImage',
      'RealTimeCollaborativeComments',
      'Comments',
      'TrackChanges',
      'RevisionHistory',
      'PresenceList',
      'WProofreader',
      'AIAssistant',
      'SlashCommand',
      'Pagination',
      'ImportWord',
    ],
  };

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private location: Location,
    private msg: NzMessageService,
    private modal: NzModalService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.conferenceId = this.route.snapshot.paramMap.get('id') || '';
    if (this.conferenceId) {
      this.fetchConferenceInfo();
      this.fetchRegistrations();
      this.fetchSubmissions();
      this.getFalcuties();
    }

    this.initForm();
  }

  getFalcuties() {
    this.apiService.getFaculties_byFields({}, {}).then((res: any) => {
      this.faculties = res.data;
    });
  }

  // Khởi tạo Form rỗng ban đầu
  initForm() {
    this.form = this.fb.group({
      img: [''],
      name: ['', Validators.required],
      type: ['event', Validators.required],
      faculty: [null, Validators.required],
      start_date: [null, Validators.required],
      end_date: [null, Validators.required],
      registration_deadline: [null, Validators.required],
      submission_deadline: [null],
      max_participants: [0, Validators.required],
      location: [''],
      map: [''],
      desc: [''],
      desc_detail: [''],
    });
  }

  // Lấy chi tiết hội nghị và ĐỔ DỮ LIỆU (PATCH) VÀO FORM
  fetchConferenceInfo() {
    this.apiService
      .getConferences_byFields({ _id: this.conferenceId }, {}, 1, 1)
      .then((res: any) => {
        this.conference = res.data[0];

        // Đổ dữ liệu vào Form
        this.form.patchValue({
          img: this.conference.image || this.conference.img || '',
          name: this.conference.name,
          type: this.conference.type,
          // Nếu backend đã populate faculty thì lấy _id, nếu chưa thì lấy trực tiếp
          faculty: this.conference.faculty?._id || this.conference.faculty,

          // CỰC KỲ QUAN TRỌNG: Ép string thành Date object cho DatePicker
          start_date: this.conference.start_date ? new Date(this.conference.start_date) : null,
          end_date: this.conference.end_date ? new Date(this.conference.end_date) : null,
          registration_deadline: this.conference.registration_deadline
            ? new Date(this.conference.registration_deadline)
            : null,
          submission_deadline: this.conference.submission_deadline
            ? new Date(this.conference.submission_deadline)
            : null,

          max_participants: this.conference.max_participants,
          location: this.conference.location,
          map: this.conference.map,
          desc: this.conference.desc,
          desc_detail: this.conference.desc_detail,
        });

        // Gán dữ liệu cho các mảng
        this.sessions = this.conference.sessions || [];
        this.speakers = this.conference.speakers || [];
        this.committees = this.conference.committees || [];
        this.documents = this.conference.documents || [];
        this.sponsors = this.conference.sponsors || [];
      });
  }

  // 2. Lấy danh sách đăng ký tham gia (Cần viết thêm API getRegistrations trong ApiService)
  fetchRegistrations() {
    // Tạm thời để trống hoặc gọi API
    this.apiService.getRegistrations_byFields({}, {}).then((res: any) => {
      this.registrations = res.data;
    });
  }

  // 3. Lấy danh sách bài báo cáo
  fetchSubmissions() {
    this.apiService
      .getSubmissions_byFields({ conference: this.conferenceId }, { createdAt: -1 }, 1, 100)
      .then((res: any) => {
        this.submissions = res.data;
      });
  }

  goBack() {
    this.location.back();
  }

  updateRegStatus(registrationId: string, newStatus: string) {
    this.apiService
      .updateRegistration(registrationId, { status: newStatus })
      .then(() => {
        this.msg.success('Cập nhật trạng thái thành công!');
        // Load lại danh sách để UI tự đổi màu Tag
        this.fetchRegistrations();
      })
      .catch((err) => {
        this.msg.error('Lỗi khi cập nhật trạng thái');
      });
  }

  deleteReg(_id: string) {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa đăng ký',
      nzContent:
        'Bạn có chắc chắn muốn xóa dữ liệu đăng ký này không? Hành động này không thể hoàn tác.',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        // Return promise để nút "Xóa" tự động hiển thị hiệu ứng xoay (loading)
        return this.apiService
          .deleteRegistration(_id)
          .then(() => {
            this.msg.success('Đã xóa dữ liệu đăng ký thành công!');
            this.fetchRegistrations(); // Load lại bảng
          })
          .catch((err) => {
            this.msg.error('Có lỗi xảy ra khi xóa!');
            console.error(err);
          });
      },
    });
  }

  exportExcel() {
    if (!this.registrations || this.registrations.length === 0) {
      this.msg.warning('Không có dữ liệu để xuất Excel!');
      return;
    }

    // 1. Format lại dữ liệu cho đẹp, dễ đọc trong Excel
    const excelData = this.registrations.map((item, index) => {
      return {
        STT: index + 1,
        'Họ và tên': item.user?.name || 'N/A',
        Email: item.user?.email || 'N/A',
        'Lớp/Khoa': item.user?.class_name || 'N/A',
        // Nếu muốn xuất ngày đăng ký thì thêm dòng dưới (nhớ inject DatePipe vào constructor)
        // 'Ngày đăng ký': this.datePipe.transform(item.createdAt, 'dd/MM/yyyy HH:mm') || '',
        'Trạng thái':
          item.status === 'registered'
            ? 'Đã đăng ký'
            : item.status === 'checked_in'
              ? 'Đã điểm danh'
              : 'Đã hủy',
      };
    });

    // 2. Tạo một worksheet từ dữ liệu đã format
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

    // (Tùy chọn) Chỉnh độ rộng các cột cho đẹp
    const wscols = [
      { wch: 5 }, // STT
      { wch: 25 }, // Họ và tên
      { wch: 30 }, // Email
      { wch: 15 }, // Lớp
      { wch: 20 }, // Trạng thái
    ];
    worksheet['!cols'] = wscols;

    // 3. Tạo một workbook (chứa worksheet)
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Danh sách đăng ký': worksheet },
      SheetNames: ['Danh sách đăng ký'],
    };

    // 4. Lấy tên hội nghị làm tên file (xóa ký tự đặc biệt nếu cần)
    const fileName = `Danh_sach_${this.conference?.name ? this.conference.name.substring(0, 30) : 'Hoi_nghi'}.xlsx`;

    // 5. Kích hoạt tải file xuống
    XLSX.writeFile(workbook, fileName);
  }

  // ================= LOGIC HIỂN THỊ TRẠNG THÁI =================
  getStatusLabel(status: string): string {
    const labels: any = {
      pending: 'Chờ duyệt',
      under_review: 'Đang phản biện',
      revision_required: 'Cần chỉnh sửa',
      accepted: 'Đã chấp nhận',
      rejected: 'Từ chối',
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: any = {
      pending: 'orange',
      under_review: 'blue',
      revision_required: 'purple',
      accepted: 'green',
      rejected: 'red',
    };
    return colors[status] || 'default';
  }

  // ================= LOGIC MODAL ĐÁNH GIÁ =================
  openReviewModal(item: any) {
    this.reviewForm = {
      _id: item._id,
      title: item.title,
      status: item.status,
      reviewer_comments: item.reviewer_comments || '',
    };
    this.isReviewModalVisible = true;
  }

  closeReviewModal() {
    this.isReviewModalVisible = false;
  }

  submitReview() {
    this.isSavingReview = true;

    const payload = {
      status: this.reviewForm.status,
      reviewer_comments: this.reviewForm.reviewer_comments,
    };

    // Giả sử apiService của bạn đã có hàm updateSubmission
    this.apiService
      .updateSubmission(this.reviewForm._id, payload)
      .then(() => {
        this.msg.success('Đã lưu kết quả đánh giá!');
        this.isReviewModalVisible = false;
        this.fetchSubmissions(); // Load lại bảng bài báo cáo
      })
      .catch(() => {
        this.msg.error('Lỗi khi lưu kết quả!');
      })
      .finally(() => {
        this.isSavingReview = false;
      });
  }

  // Hàm upload ảnh bìa
  beforeUpload = (file: any): boolean => {
    this.uploading = true;
    this.apiService
      .uploadImage(file, 'conference')
      .then((res: any) => {
        this.form.patchValue({ img: res.url || res.data });
        this.uploading = false;
        this.msg.success('Tải ảnh lên thành công!');
      })
      .catch(() => {
        this.uploading = false;
        this.msg.error('Lỗi tải ảnh');
      });
    return false; // Chặn hành vi upload mặc định của ng-zorro
  };

  // Các hàm hứng event từ component con
  onChangeSession(data: any) {
    this.sessions = data;
  }
  onChangeSpeakers(data: any) {
    this.speakers = data;
  }
  onChangeOrganizingCommittee(data: any) {
    this.committees = data;
  }
  onChangeDocuments(data: any) {
    this.documents = data;
  }
  onChangeSponsor(data: any) {
    this.sponsors = data;
  }

  // HÀM LƯU / CẬP NHẬT HỘI NGHỊ
  updateConference() {
    // 1. Validate form
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.msg.warning('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    this.isUpdating = true;

    // 2. Gom dữ liệu form và các mảng lại thành Payload
    const payload = {
      ...this.form.value,
      image: this.form.value.img, // Mapping lại tên trường nếu backend dùng chữ 'image'
      sessions: this.sessions,
      speakers: this.speakers,
      committees: this.committees,
      documents: this.documents,
      sponsors: this.sponsors,
    };

    // 3. Gọi API PUT
    this.apiService
      .updateConference(this.conferenceId, payload)
      .then(() => {
        this.msg.success('Cập nhật thông tin hội nghị thành công!');
        this.fetchConferenceInfo(); // Load lại data cho chắc ăn
      })
      .catch(() => {
        this.msg.error('Có lỗi xảy ra khi cập nhật!');
      })
      .finally(() => {
        this.isUpdating = false;
      });
  }
}
