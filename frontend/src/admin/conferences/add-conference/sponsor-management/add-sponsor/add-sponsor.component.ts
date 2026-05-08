import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ApiService } from '../../../../../services/api.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-add-sponsor',
  templateUrl: './add-sponsor.component.html',
  styleUrls: ['./add-sponsor.component.css'],
  imports: [
    ReactiveFormsModule,
    NzIconModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzUploadModule,
  ],
})
export class AddSponsorComponent implements OnInit {
  form: any;

  fileList: NzUploadFile[] = [];

  constructor(
    public fb: FormBuilder,
    public apiService: ApiService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      logo: [''],
      link: [''],
    });
  }

  onAddSponsor() {
    return new Promise((resolve: any, reject: any) => {
      resolve({
        ...this.form.value,
        _id: Math.floor(Math.random() * 10000),
      });
    });
  }

  beforeUpload: (
    file: NzUploadFile,
    _fileList: NzUploadFile[],
  ) => boolean | import('rxjs').Observable<boolean> = (file) => {
    const rawFile: any = file;
    if (!rawFile) return false;

    this.fileList = [
      {
        uid: file.uid,
        name: file.name,
        status: 'uploading',
      },
    ];

    this.apiService
      .uploadImage(rawFile, 'conference')
      .then((res: any) => {
        if (res.vcode == 0 && res?.data) {
          this.form.patchValue({ logo: res.data });

          this.fileList = this.fileList.map((item) =>
            item.uid === file.uid ? { ...item, status: 'done', url: res.data } : item,
          );
        } else {
          this.fileList = this.fileList.map((item) =>
            item.uid === file.uid ? { ...item, status: 'error' } : item,
          );
        }
      })
      .catch(() => {
        this.fileList = this.fileList.map((item) =>
          item.uid === file.uid ? { ...item, status: 'error' } : item,
        );
      });

    return false;
  };
}
