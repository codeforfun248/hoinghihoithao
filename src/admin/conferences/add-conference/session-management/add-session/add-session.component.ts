import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalRef } from 'ng-zorro-antd/modal';
@Component({
  selector: 'app-add-session',
  templateUrl: './add-session.component.html',
  styleUrls: ['./add-session.component.css'],
  imports: [ReactiveFormsModule, NzDatePickerModule, FormsModule, NzInputModule],
})
export class AddSessionComponent implements OnInit {
  addSessionForm: any;

  constructor(
    public fb: FormBuilder,
    public modalRef: NzModalRef<AddSessionComponent>,
  ) {}

  ngOnInit() {
    this.addSessionForm = this.fb.group({
      name: ['', { required: true }],
      start_time: ['', { required: true }],
      end_time: ['', { required: true }],
      desc: [''],
    });
  }

  onAddSession() {
    return new Promise((resolve) => {
      resolve({
        ...this.addSessionForm.value,
        _id: Math.floor(Math.random() * 10000), // tạm tạo ID ngẫu nhiên
      });
    });
  }
}
