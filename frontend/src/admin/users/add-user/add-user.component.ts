import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
  imports: [ReactiveFormsModule, NzInputModule, NzSelectModule, NzUploadModule, NzIconModule],
})
export class AddUserComponent implements OnInit {
  addUserForm: any;
  uploading = false;

  constructor(
    public fb: FormBuilder,
    public modalRef: NzModalRef<AddUserComponent>,
    public apiService: ApiService,
  ) {}

  ngOnInit() {
    this.addUserForm = this.fb.group({
      email: ['', { required: true }],
      name: ['', { required: true }],
      password: ['', { required: true }],
      role: ['user', { required: true }],
      academic_degree: [''],
      avatar: [''],
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
            this.addUserForm.patchValue({ avatar: res.data });
          }
        }
      })
      .catch(() => {
        pending['status'] = 'error';
      });

    // 4) Trả FALSE để chặn upload mặc định của nz-upload
    return false;
  };

  onAddUser() {
    return new Promise((resolve) => {
      this.apiService.addUser(this.addUserForm.value).then((res: any) => {
        resolve(res.data);
      });
    });
  }
}
