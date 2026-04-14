import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-add-faculty',
  templateUrl: './add-faculty.component.html',
  styleUrls: ['./add-faculty.component.css'],
  imports: [ReactiveFormsModule, NzInputModule],
})
export class AddFacultyComponent implements OnInit {
  form: any;
  loading: boolean = false;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    public modalRef: NzModalRef<AddFacultyComponent>,
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    const formGroupConfig: any = {};
    // Các trường đơn ngôn ngữ
    formGroupConfig['name'] = [''];
    this.form = this.fb.group(formGroupConfig);
  }

  onAddFaculty() {
    if (this.form.invalid) return Promise.resolve();
    this.loading = true;
    return this.apiService
      .addFaculty({
        ...this.form.value,
      })
      .then((res: any) => {
        this.modalRef.close(res.data);
      })
      .finally(() => (this.loading = false));
  }
}
