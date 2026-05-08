import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { AddMemberComponent } from '../add-committees/add-member/add-member.component';

@Component({
  selector: 'app-edit-committees',
  templateUrl: './edit-committees.component.html',
  styleUrls: ['./edit-committees.component.css'],
  imports: [
    NzTableModule,
    ReactiveFormsModule,
    NzIconModule,
    NzInputModule,
    NzButtonModule,
    NzPopconfirmModule,
  ],
})
export class EditCommitteesComponent implements OnInit {
  form: any;
  members: any = [];

  expandSet = new Set<number>();
  readonly nzModalData = inject(NZ_MODAL_DATA);

  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

  constructor(
    public fb: FormBuilder,
    public modalRef: NzModalRef<EditCommitteesComponent>,
    private modal: NzModalService,
  ) {}

  ngOnInit() {
    const { committeesEdit } = this.nzModalData;
    this.form = this.fb.group({
      name: [committeesEdit.name, { required: true }],
    });
    this.members = committeesEdit.members;
  }

  onEditCommittees() {
    return new Promise((resolve) => {
      resolve({
        ...this.form.value,
        members: this.members,
        _id: this.nzModalData.committeesEdit._id,
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
