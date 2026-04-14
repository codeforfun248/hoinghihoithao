import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ApiService } from '../../../../../services/api.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-edit-document',
  templateUrl: './edit-document.component.html',
  styleUrls: ['./edit-document.component.css'],
  imports: [
    ReactiveFormsModule,
    NzIconModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzUploadModule,
  ],
})
export class EditDocumentComponent implements OnInit {
  form: any;
  // Thêm biến này ở đầu class AddDocumentComponent
  fileList: NzUploadFile[] = [];
  readonly nzModalData = inject(NZ_MODAL_DATA);

  constructor(
    public fb: FormBuilder,
    public modalRef: NzModalRef<EditDocumentComponent>,
    public apiService: ApiService,
  ) {}

  ngOnInit() {
    const { documentEdit } = this.nzModalData;
    this.form = this.fb.group({
      name: [documentEdit.name, { required: true }],
      url: [documentEdit.url, { required: true }],
    });

    // 2. Fill file cũ vào nz-upload
    if (documentEdit.url) {
      const url = documentEdit.url;
      this.fileList = [
        {
          uid: '-1', // ID ảo cho file có sẵn (thường để số âm)
          name: url.split('/')[url.split('/').length - 1] || 'Tai_lieu_dinh_kem', // Tên hiển thị trên giao diện
          status: 'done', // Trạng thái hoàn thành
          url: documentEdit.url, // Link để khi click vào có thể tải/xem file
        },
      ];
    }
  }

  onEditDocument() {
    const { documentEdit } = this.nzModalData;

    return new Promise((resolve) => {
      resolve({
        ...this.form.value,
        _id: documentEdit._id,
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
