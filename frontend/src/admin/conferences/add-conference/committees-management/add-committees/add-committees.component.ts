import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { AddMemberComponent } from './add-member/add-member.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

@Component({
  selector: 'app-add-committees',
  templateUrl: './add-committees.component.html',
  styleUrls: ['./add-committees.component.css'],
  imports: [
    NzTableModule,
    ReactiveFormsModule,
    NzIconModule,
    NzInputModule,
    NzButtonModule,
    NzPopconfirmModule,
  ],
})
export class AddCommitteesComponent implements OnInit {
  form: any;
  members: any = [];

  expandSet = new Set<number>();
  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

  constructor(
    public fb: FormBuilder,
    public modalRef: NzModalRef<AddCommitteesComponent>,
    private modal: NzModalService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', { required: true }],
    });
  }

  onAddCommittees() {
    return new Promise((resolve) => {
      resolve({
        ...this.form.value,
        members: this.members,
        _id: Math.floor(Math.random() * 10000), // tạm tạo ID ngẫu nhiên
      });
    });
  }

  addMember() {
    const modalRef: any = this.modal.create({
      nzTitle: 'Thêm thành viên',
      nzContent: AddMemberComponent,
      nzWidth: '390px',
      nzCentered: true,
      nzFooter: [
        { label: 'Hủy', onClick: () => modalRef.destroy() },
        {
          label: 'Xác nhận',
          type: 'primary',
          autoLoading: true, // bật spinner nếu onClick trả Promise
          onClick: (cmp: AddMemberComponent) => {
            return cmp.onAddMember().then((result: any) => {
              modalRef.close(); // Đóng modal và trả về kết quả
              this.members = [...this.members, result];
            });
          },
        },
      ],
      nzClassName: 'modal-admin',
    });
  }

  handleDeleteMember(member: any) {
    this.members = this.members.filter((item: any) => item !== member);
  }
}
