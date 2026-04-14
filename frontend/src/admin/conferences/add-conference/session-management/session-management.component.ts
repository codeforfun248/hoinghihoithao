import { Component, Input, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AddSessionComponent } from './add-session/add-session.component';
import { DatePipe } from '@angular/common';
import { EditSessionComponent } from './edit-session/edit-session.component';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { output, input } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-session-management',
  templateUrl: './session-management.component.html',
  styleUrls: ['./session-management.component.css'],
  imports: [
    NzButtonModule,
    NzIconModule,
    NzTableModule,
    NzDividerModule,
    DatePipe,
    NzPopconfirmModule,
    CdkDropList,
    CdkDrag,
  ],
})
export class SessionManagementComponent implements OnInit {
  @Input() sessions: any = [];
  changeSession = output();

  constructor(private modal: NzModalService) {}

  ngOnInit() {}

  handleAddSession() {
    const modalRef: any = this.modal.create({
      nzTitle: 'Thêm phiên mới',
      nzContent: AddSessionComponent,
      nzWidth: '390px',
      nzCentered: true,
      nzFooter: [
        { label: 'Hủy', onClick: () => modalRef.destroy() },
        {
          label: 'Xác nhận',
          type: 'primary',
          autoLoading: true, // bật spinner nếu onClick trả Promise
          onClick: (cmp: AddSessionComponent) => {
            return cmp.onAddSession().then((result: any) => {
              cmp.modalRef.close(); // Đóng modal và trả về kết quả
              this.sessions = [...this.sessions, result];
              this.changeSession.emit(this.sessions); // Phát sự kiện với dữ liệu phiên mới
            });
          },
        },
      ],
      nzClassName: 'modal-admin',
    });
  }

  handleEditSession(session: any) {
    const modalRef: any = this.modal.create({
      nzTitle: 'Chỉnh sửa phiên',
      nzContent: EditSessionComponent,
      nzWidth: '390px',
      nzCentered: true,
      nzData: {
        session,
      },
      nzFooter: [
        { label: 'Hủy', onClick: () => modalRef.destroy() },
        {
          label: 'Xác nhận',
          type: 'primary',
          autoLoading: true, // bật spinner nếu onClick trả Promise
          onClick: (cmp: EditSessionComponent) => {
            return cmp.onEditSession().then((result: any) => {
              cmp.modalRef.close(); // Đóng modal và trả về kết quả
              this.sessions = this.sessions.map((s: any) => (s._id === result._id ? result : s));
              this.changeSession.emit(this.sessions); // Phát sự kiện với dữ liệu phiên đã chỉnh sửa
            });
          },
        },
      ],
      nzClassName: 'modal-admin',
    });
  }

  handleDeleteSession(sessionId: any) {
    this.sessions = this.sessions.filter((s: any) => s._id !== sessionId);
    this.changeSession.emit(this.sessions); // Phát sự kiện với dữ liệu phiên đã xóa
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.sessions, event.previousIndex, event.currentIndex);
    this.changeSession.emit(this.sessions); // Phát sự kiện với dữ liệu phiên đã xóa
  }
}
