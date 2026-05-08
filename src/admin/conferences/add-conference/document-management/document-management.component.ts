import { Component, Input, OnInit, output } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { AddDocumentComponent } from './add-document/add-document.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { EditDocumentComponent } from './edit-document/edit-document.component';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

@Component({
  selector: 'app-document-management',
  templateUrl: './document-management.component.html',
  styleUrls: ['./document-management.component.css'],
  imports: [NzTableModule, NzIconModule, NzButtonModule, NzPopconfirmModule],
})
export class DocumentManagementComponent implements OnInit {
  @Input() documents: any = [];
  changeDocuments = output();
  constructor(private modal: NzModalService) {}

  ngOnInit() {}

  handleDeleteDocument(document: any) {
    this.documents = this.documents.filter((item: any) => item._id != document._id);
    this.changeDocuments.emit(this.documents); // Phát sự kiện với dữ liệu ban tổ chức mới
  }

  handleAddDocument() {
    const modalRef: any = this.modal.create({
      nzTitle: 'Thêm tài liệu',
      nzContent: AddDocumentComponent,
      nzWidth: '390px',
      nzCentered: true,
      nzFooter: [
        { label: 'Hủy', onClick: () => modalRef.destroy() },
        {
          label: 'Xác nhận',
          type: 'primary',
          autoLoading: true, // bật spinner nếu onClick trả Promise
          onClick: (cmp: AddDocumentComponent) => {
            return cmp.onAddDocument().then((result: any) => {
              modalRef.close(); // Đóng modal và trả về kết quả
              this.documents = [...this.documents, result];
              this.changeDocuments.emit(this.documents); // Phát sự kiện với dữ liệu ban tổ chức mới
            });
          },
        },
      ],
      nzClassName: 'modal-admin',
    });
  }

  handleEditDocument(documentEdit: any) {
    const modalRef: any = this.modal.create({
      nzTitle: 'Cập nhật tài tài liệu',
      nzContent: EditDocumentComponent,
      nzWidth: '390px',
      nzCentered: true,
      nzData: {
        documentEdit,
      },
      nzFooter: [
        { label: 'Hủy', onClick: () => modalRef.destroy() },
        {
          label: 'Xác nhận',
          type: 'primary',
          autoLoading: true, // bật spinner nếu onClick trả Promise
          onClick: (cmp: EditDocumentComponent) => {
            return cmp.onEditDocument().then((result: any) => {
              this.documents = this.documents.map((item: any) => {
                if (item._id == documentEdit._id) {
                  return result;
                }

                return item;
              });
              this.changeDocuments.emit(this.documents); // Phát sự kiện với dữ liệu ban tổ chức mới
              modalRef.close(); // Đóng modal và trả về kết quả
            });
          },
        },
      ],
      nzClassName: 'modal-admin',
    });
  }
}
