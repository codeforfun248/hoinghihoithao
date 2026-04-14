import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-edit-faculty',
  templateUrl: './edit-faculty.component.html',
  styleUrls: ['./edit-faculty.component.css'],
  imports: [ReactiveFormsModule, NzInputModule],
})
export class EditFacultyComponent implements OnInit {
  form: any;
  loading: boolean = false;
  readonly nzModalData = inject(NZ_MODAL_DATA);

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    public modalRef: NzModalRef<EditFacultyComponent>,
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    const { faculty } = this.nzModalData;

    const formGroupConfig: any = {};
    // Các trường đơn ngôn ngữ
    formGroupConfig['name'] = [faculty.name];
    this.form = this.fb.group(formGroupConfig);
  }

  onEditFaculty() {
    if (this.form.invalid) return Promise.resolve();
    this.loading = true;
    const { faculty } = this.nzModalData;

    return this.apiService
      .updateFaculty(faculty.id, {
        ...this.form.value,
      })
      .then((res: any) => {
        this.modalRef.close({
          id: faculty.id,
          ...this.form.value,
        });
      })
      .finally(() => (this.loading = false));
  }
}
