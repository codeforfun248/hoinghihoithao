import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css'],
  imports: [ReactiveFormsModule, NzInputModule, NzSelectModule, NzUploadModule, NzIconModule],
})
export class EditUserComponent implements OnInit {
  editUserForm: any;
  uploading = false;
  readonly nzModalData = inject(NZ_MODAL_DATA);

  constructor(
    public fb: FormBuilder,
    public modalRef: NzModalRef<EditUserComponent>,
    public apiService: ApiService,
  ) {}

  ngOnInit() {
    const { user } = this.nzModalData;

    this.editUserForm = this.fb.group({
      email: [user.email, { required: true }],
      name: [user.name, { required: true }],
      role: [user.role, { required: true }],
      academic_degree: [user.academic_degree],
      avatar: [user.avatar],
    });
  }

  beforeUpload: (
    file: NzUploadFile,
    _fileList: NzUploadFile[],
  ) => boolean | import('rxjs').Observable<boolean> = (file) => {
    // 1) Lấy File thô từ NzUploadFile
    const rawFile: any = file;
    if (!rawFile) {
      // Không có file gốc (trường hợp file từ URL sẵn có), chặn upload mặc định
      return false;
    }

    // 2) Thêm “pending item” vào fileList để hiển thị đang upload
    const pending: any = {
      uid: file.uid,
      name: rawFile.name,
      status: 'uploading' as const,
      percent: 0,
    };

    // 3) Gọi upload của bạn
    this.apiService
      .uploadImage(rawFile, 'avatar')
      .then((res: any) => {
        // đồng bộ vào gallery dữ liệu của bạn
        if (res.vcode == 0) {
          if (res?.data) {
            this.editUserForm.patchValue({ avatar: res.data });
          }
        }
      })
      .catch(() => {
        pending['status'] = 'error';
      });

    // 4) Trả FALSE để chặn upload mặc định của nz-upload
    return false;
  };

  onEditUser() {
    const { user } = this.nzModalData;

    return new Promise((resolve) => {
      this.apiService.updateUser(user._id, this.editUserForm.value).then((res: any) => {
        resolve(res.data);
      });
    });
  }
}
