import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { ApiService } from '../../../../../services/api.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-edit-sponsor',
  templateUrl: './edit-sponsor.component.html',
  styleUrls: ['./edit-sponsor.component.css'],
  imports: [
    ReactiveFormsModule,
    NzIconModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzUploadModule,
  ],
})
export class EditSponsorComponent implements OnInit {
  form: any;

  fileList: NzUploadFile[] = [];
  readonly nzModalData = inject(NZ_MODAL_DATA);

  constructor(
    public fb: FormBuilder,
    public apiService: ApiService,
  ) {}

  ngOnInit() {
    const { sponsorEdit } = this.nzModalData;

    this.form = this.fb.group({
      name: [sponsorEdit?.name || '', Validators.required],
      logo: [sponsorEdit?.logo || ''],
      link: [sponsorEdit?.link || ''],
    });

    if (sponsorEdit?.logo) {
      this.fileList = [
        {
          uid: '-1',
          name: 'logo',
          status: 'done',
          url: sponsorEdit.logo,
        },
      ];
    }
  }

  onEditSponsor() {
    return new Promise((resolve: any, reject: any) => {
      const { sponsorEdit } = this.nzModalData;
      resolve({
        _id: sponsorEdit._id,
        ...this.form.value,
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
