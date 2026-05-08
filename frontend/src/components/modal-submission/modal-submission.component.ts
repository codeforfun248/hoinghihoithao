import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef, NzModalService, NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-modal-submission',
  templateUrl: './modal-submission.component.html',
  styleUrls: ['./modal-submission.component.css'],
  imports: [CommonModule, FormsModule, NzIconModule, NzModalModule, NzSpinModule, DatePipe],
})
export class ModalSubmissionComponent implements OnInit {
  conferenceId: string = '';
  // Thêm các biến này vào class ModalSubmissionComponent
  submissionDeadline: any;
  isPastDeadline: boolean = false;
  // Dữ liệu danh sách
  submissions: any[] = [];
  isLoadingList = false;

  // Trạng thái Modal Form (Thêm/Sửa)
  isFormVisible = false;
  isSaving = false;
  isUploading = false;

  // Dữ liệu Form
  submitForm = this.getEmptyForm();

  constructor(
    @Inject(NZ_MODAL_DATA) public nzData: any, // Nhận dữ liệu từ component cha
    private modalRef: NzModalRef, // Để tự đóng modal chính
    private apiService: ApiService,
    private authService: AuthService,
    private msg: NzMessageService,
    private modalService: NzModalService,
  ) {
    if (this.nzData) {
      this.conferenceId = this.nzData.conferenceId;
      this.submissionDeadline = this.nzData.submissionDeadline; // Lấy hạn chót
    }
  }

  ngOnInit() {
    this.checkDeadline(); // Kiểm tra hạn chót ngay khi mở modal
    this.fetchSubmissions();
  }

  // Hàm kiểm tra hạn chót
  checkDeadline() {
    if (this.submissionDeadline) {
      const now = new Date().getTime();
      const deadline = new Date(this.submissionDeadline).getTime();
      this.isPastDeadline = now > deadline; // true nếu đã quá hạn
    }
  }

  // Lấy danh sách tài liệu
  fetchSubmissions() {
    this.isLoadingList = true;
    const query = {
      conference: this.conferenceId,
      author: this.authService.user?._id,
    };

    // Gọi API getSubmissions_byFields
    this.apiService
      .getSubmissions_byFields(query, { createdAt: -1 }, 1, 50)
      .then((res: any) => {
        this.submissions = res.data;
      })
      .catch(() => this.msg.error('Lỗi khi tải danh sách'))
      .finally(() => (this.isLoadingList = false));
  }

  // Mở Form Thêm mới
  openCreateForm() {
    if (this.isPastDeadline) {
      this.msg.warning('Đã hết hạn nộp bài báo cáo!');
      return;
    }
    this.submitForm = this.getEmptyForm();
    this.isFormVisible = true;
  }

  // Mở Form Cập nhật
  openEditForm(item: any) {
    if (this.isPastDeadline) {
      this.msg.warning('Đã hết hạn chỉnh sửa bài báo cáo!');
      return;
    }
    this.submitForm = {
      _id: item._id,
      title: item.title,
      abstract: item.abstract || '',
      file_url: item.file_url,
    };
    this.isFormVisible = true;
  }

  // Xóa tài liệu
  deleteSubmission(id: string) {
    this.modalService.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: 'Bạn có chắc chắn muốn xóa tài liệu này không?',
      nzOkText: 'Xóa',
      nzOkDanger: true,
      nzOnOk: () => {
        // Gọi API Delete
        this.apiService.deleteSubmission(id).then(() => {
          this.msg.success('Đã xóa tài liệu');
          this.fetchSubmissions();
        });
      },
    });
  }

  // Hàm chọn và Upload File
  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      this.msg.warning('File không được vượt quá 15MB');
      return;
    }

    this.isUploading = true;
    try {
      const res = await this.apiService.uploadImage(file, 'document');

      // Gán URL trả về từ server vào form
      this.submitForm.file_url = res.url || res.data;
      this.msg.success('Tải file lên thành công!');
    } catch (error) {
      this.msg.error('Lỗi khi tải file lên!');
    } finally {
      this.isUploading = false;
    }
  }

  // Submit Form (Tạo mới hoặc Cập nhật)
  saveSubmission() {
    if (!this.submitForm.title || !this.submitForm.file_url) {
      this.msg.warning('Vui lòng điền tiêu đề và đính kèm file!');
      return;
    }

    this.isSaving = true;
    const payload = {
      conference: this.conferenceId,
      author: this.authService.user?._id,
      title: this.submitForm.title,
      abstract: this.submitForm.abstract,
      file_url: this.submitForm.file_url,
    };

    if (this.submitForm._id) {
      // UPDATE
      this.apiService
        .updateSubmission(this.submitForm._id, payload)
        .then(() => {
          this.msg.success('Cập nhật thành công!');
          this.isFormVisible = false;
          this.fetchSubmissions();
        })
        .finally(() => (this.isSaving = false));
    } else {
      // CREATE
      this.apiService
        .createSubmission(payload)
        .then(() => {
          this.msg.success('Nộp tài liệu thành công!');
          this.isFormVisible = false;
          this.fetchSubmissions();
        })
        .finally(() => (this.isSaving = false));
    }
  }

  getEmptyForm() {
    return { _id: null, title: '', abstract: '', file_url: '' };
  }

  closeModal() {
    this.modalRef.destroy();
  }
}
