import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
@Component({
  selector: 'app-edit-session',
  templateUrl: './edit-session.component.html',
  styleUrls: ['./edit-session.component.css'],
  imports: [ReactiveFormsModule, NzDatePickerModule, FormsModule, NzInputModule],
})
export class EditSessionComponent implements OnInit {
  editSessionForm: any;
  readonly nzModalData = inject(NZ_MODAL_DATA);

  constructor(
    public fb: FormBuilder,
    public modalRef: NzModalRef<EditSessionComponent>,
  ) {}

  ngOnInit() {
    const { session } = this.nzModalData;
    this.editSessionForm = this.fb.group({
      name: [session.name, { required: true }],
      start_time: [session.start_time, { required: true }],
      end_time: [session.end_time, { required: true }],
      desc: [session.desc],
    });
  }

  onEditSession() {
    return new Promise((resolve) => {
      resolve({
        ...this.editSessionForm.value,
        _id: this.nzModalData.session._id,
      });
    });
  }
}
