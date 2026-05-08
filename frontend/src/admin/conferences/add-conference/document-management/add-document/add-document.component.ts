import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ApiService } from '../../../../../services/api.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
@Component({
  selector: 'app-add-document',
  templateUrl: './add-document.component.html',
  styleUrls: ['./add-document.component.css'],
  imports: [
    ReactiveFormsModule,
    NzIconModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzUploadModule,
  ],
})
export class AddDocumentComponent implements OnInit {
  form: any;

  // Thêm biến này ở đầu class AddDocumentComponent
  fileList: NzUploadFile[] = [];

  constructor(
    public fb: FormBuilder,
    public apiService: ApiService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      url: ['', Validators.required],
    });
  }

  onAddDocument() {
    return new Promise((resolve: any, reject: any) => {
      resolve({
        ...this.form.value,
        _id: Math.floor(Math.random() * 10000), // tạm tạo ID ngẫu nhiên
      });
    });
  }

  beforeUpload: (
    file: NzUploadFile,
    _fileList: NzUploadFile[],
  ) => boolean | import('rxjs').Observable<boolean> = (file) => {
    const rawFile: any = file;
    if (!rawFile) return false;

    // 1) Chủ động thêm file vào mảng hiển thị với trạng thái uploading
    this.fileList = [
      {
        uid: file.uid,
        name: file.name,
        status: 'uploading',
      },
    ];

    // 2) Gọi API upload
    this.apiService
      .uploadImage(rawFile, 'document')
      .then((res: any) => {
        if (res.vcode == 0 && res?.data) {
          this.form.patchValue({ url: res.data });

          // 3) Thành công -> Cập nhật trạng thái file thành 'done'
          this.fileList = this.fileList.map((item) =>
            item.uid === file.uid ? { ...item, status: 'done', url: res.data } : item,
          );
        } else {
          // Lỗi logic từ server
          this.fileList = this.fileList.map((item) =>
            item.uid === file.uid ? { ...item, status: 'error' } : item,
          );
        }
      })
      .catch(() => {
        // 4) Thất bại -> Cập nhật trạng thái thành 'error'
        this.fileList = this.fileList.map((item) =>
          item.uid === file.uid ? { ...item, status: 'error' } : item,
        );
      });

    return false;
  };
}
