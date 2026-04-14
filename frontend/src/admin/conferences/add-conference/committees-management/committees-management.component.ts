import { Component, Input, OnInit, output } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { AddCommitteesComponent } from './add-committees/add-committees.component';
import { EditCommitteesComponent } from './edit-committees/edit-committees.component';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

@Component({
  selector: 'app-committees-management',
  templateUrl: './committees-management.component.html',
  styleUrls: ['./committees-management.component.css'],
  imports: [
    NzButtonModule,
    NzIconModule,
    NzTableModule,
    NzDividerModule,
    NzInputModule,
    NzPopconfirmModule,
  ],
})
export class CommitteesManagementComponent implements OnInit {
  @Input() committees: any = [];
  changeOrganizingCommittee = output();
  expandSet = new Set<number>();
  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }
  constructor(private modal: NzModalService) {}

  ngOnInit() {}

  handleAddOC() {
    const modalRef: any = this.modal.create({
      nzTitle: 'Thêm ban tổ chức mới',
      nzContent: AddCommitteesComponent,
      nzWidth: '500px',
      nzCentered: true,
      nzFooter: [
        { label: 'Hủy', onClick: () => modalRef.destroy() },
        {
          label: 'Xác nhận',
          type: 'primary',
          autoLoading: true, // bật spinner nếu onClick trả Promise
          onClick: (cmp: AddCommitteesComponent) => {
            return cmp.onAddCommittees().then((result: any) => {
              cmp.modalRef.close(); // Đóng modal và trả về kết quả
              this.committees = [...this.committees, result];
              this.changeOrganizingCommittee.emit(this.committees); // Phát sự kiện với dữ liệu ban tổ chức mới
            });
          },
        },
      ],
      nzClassName: 'modal-admin',
    });
  }

  handleEdit(dataEdit: any) {
    const modalRef: any = this.modal.create({
      nzTitle: 'Cập nhật ban tổ chức',
      nzContent: EditCommitteesComponent,
      nzWidth: '500px',
      nzCentered: true,
      nzData: {
        committeesEdit: dataEdit,
      },
      nzFooter: [
        { label: 'Hủy', onClick: () => modalRef.destroy() },
        {
          label: 'Xác nhận',
          type: 'primary',
          autoLoading: true, // bật spinner nếu onClick trả Promise
          onClick: (cmp: EditCommitteesComponent) => {
            return cmp.onEditCommittees().then((result: any) => {
              cmp.modalRef.close(); // Đóng modal và trả về kết quả
              this.committees = this.committees.map((item: any) => {
                if (item._id == result._id) {
                  return result;
                }
                return item;
              });
              this.changeOrganizingCommittee.emit(this.committees); // Phát sự kiện với dữ liệu ban tổ chức mới
            });
          },
        },
      ],
      nzClassName: 'modal-admin',
    });
  }

  handleDeleteCommittee(_id: string) {
    this.committees = this.committees.filter((item: any) => item._id != _id);
    this.changeOrganizingCommittee.emit(this.committees); // Phát sự kiện với dữ liệu ban tổ chức mới
  }
}
