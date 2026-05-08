import { Component, Input, OnInit, output } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { AddSpeakerComponent } from './add-speaker/add-speaker.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

@Component({
  selector: 'app-speaker-management',
  templateUrl: './speaker-management.component.html',
  styleUrls: ['./speaker-management.component.css'],
  imports: [NzTableModule, NzIconModule, NzButtonModule, NzPopconfirmModule],
})
export class SpeakerManagementComponent implements OnInit {
  @Input() speakers: any = [];
  changeSpeaker = output();
  constructor(private modal: NzModalService) {}

  ngOnInit() {}

  handleDeleteSpeaker(speaker: any) {
    this.speakers = this.speakers.filter((item: any) => item !== speaker);
    this.changeSpeaker.emit(this.speakers); // Phát sự kiện với dữ liệu ban tổ chức mới
  }

  handleAddSpeaker() {
    const modalRef: any = this.modal.create({
      nzTitle: 'Thêm diễn giả',
      nzContent: AddSpeakerComponent,
      nzWidth: '390px',
      nzCentered: true,
      nzFooter: [
        { label: 'Hủy', onClick: () => modalRef.destroy() },
        {
          label: 'Xác nhận',
          type: 'primary',
          autoLoading: true, // bật spinner nếu onClick trả Promise
          onClick: (cmp: AddSpeakerComponent) => {
            return cmp.onAddSpeaker().then((result: any) => {
              modalRef.close(); // Đóng modal và trả về kết quả
              this.speakers = [...this.speakers, result];
              this.changeSpeaker.emit(this.speakers); // Phát sự kiện với dữ liệu ban tổ chức mới
            });
          },
        },
      ],
      nzClassName: 'modal-admin',
    });
  }
}
