import { Component, Input, OnInit, output } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { AddSponsorComponent } from './add-sponsor/add-sponsor.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { EditSponsorComponent } from './edit-sponsor/edit-sponsor.component';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

@Component({
  selector: 'app-sponsor-management',
  templateUrl: './sponsor-management.component.html',
  styleUrls: ['./sponsor-management.component.css'],
  imports: [NzTableModule, NzIconModule, NzButtonModule, NzPopconfirmModule],
})
export class SponsorManagementComponent implements OnInit {
  @Input() sponsors: any = [];
  changeSponsor = output();
  constructor(private modal: NzModalService) {}

  ngOnInit() {}

  handleDeleteSponsor(sponsor: any) {
    this.sponsors = this.sponsors.filter((item: any) => item._id != sponsor._id);
    this.changeSponsor.emit(this.sponsors);
  }

  handleAddSponsor() {
    const modalRef: any = this.modal.create({
      nzTitle: 'Thêm nhà tài trợ',
      nzContent: AddSponsorComponent,
      nzWidth: '500px',
      nzCentered: true,
      nzFooter: [
        { label: 'Hủy', onClick: () => modalRef.destroy() },
        {
          label: 'Xác nhận',
          type: 'primary',
          autoLoading: true,
          onClick: (cmp: AddSponsorComponent) => {
            return cmp.onAddSponsor().then((result: any) => {
              modalRef.close();
              this.sponsors = [...this.sponsors, result];
              this.changeSponsor.emit(this.sponsors);
            });
          },
        },
      ],
      nzClassName: 'modal-admin',
    });
  }

  handleEditSponsor(sponsorEdit: any) {
    const modalRef: any = this.modal.create({
      nzTitle: 'Cập nhật nhà tài trợ',
      nzContent: EditSponsorComponent,
      nzWidth: '500px',
      nzCentered: true,
      nzData: {
        sponsorEdit,
      },
      nzFooter: [
        { label: 'Hủy', onClick: () => modalRef.destroy() },
        {
          label: 'Xác nhận',
          type: 'primary',
          autoLoading: true,
          onClick: (cmp: EditSponsorComponent) => {
            return cmp.onEditSponsor().then((result: any) => {
              this.sponsors = this.sponsors.map((item: any) => {
                if (item._id == sponsorEdit._id) {
                  return result;
                }
                return item;
              });
              this.changeSponsor.emit(this.sponsors);
              modalRef.close();
            });
          },
        },
      ],
      nzClassName: 'modal-admin',
    });
  }
}
