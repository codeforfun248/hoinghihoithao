import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ApiService } from '../../services/api.service';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { AddUserComponent } from './add-user/add-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzIconModule,
    NzDropDownModule,
    NzTableModule,
    NzImageModule,
    NzInputModule,
    NzSelectModule,
    NzTagModule,
    NzModalModule,
  ],
})
export class UsersComponent implements OnInit {
  users: any = [];
  dataSearched: any = [];
  keySearch: string = '';
  loading: boolean = false;
  sort: any = {};
  roleOptions = [
    { label: 'ADMIN', value: 'admin' }, // Trùm hệ thống: Duyệt hội nghị, duyệt bài
    { label: 'ORGANIZER', value: 'organizer' }, // Ban tổ chức: Chỉ tạo hội nghị, quản lý hội nghị của mình
    { label: 'USER', value: 'user' },
  ];

  @ViewChild('container', { read: ElementRef }) container!: ElementRef<HTMLInputElement>;

  /** ------------------------Pagination------------------------ */
  /** Trang hiện tại */
  pageIndex: number = 1;
  /** Tổng số trang */
  total: number = 1;
  /** Số lượng bản ghi trên 1 trang */
  pageSize: number = 20;

  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  listOfData: readonly any[] = [];
  setOfCheckedId = new Set<number>();

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) => this.updateCheckedSet(item._id, value));
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange($event: readonly any[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every((item) => this.setOfCheckedId.has(item._id));
    this.indeterminate =
      this.listOfCurrentPageData.some((item) => this.setOfCheckedId.has(item._id)) && !this.checked;
  }

  constructor(
    public apiService: ApiService,
    private msg: NzMessageService,
    private modal: NzModalService,
    public authService: AuthService,
  ) {}

  ngOnInit() {}

  getUsers() {
    this.loading = true;
    this.apiService
      .getUsers_byFields({}, this.sort, this.pageIndex, this.pageSize)
      .then((res: any) => {
        this.users = res.data;
        this.total = res.total;
        this.loading = false;

        // new Event('resize') tạo ra một event có type = "resize".
        // Khi phát đi, tất cả các listener đang lắng nghe sự kiện resize của window sẽ được gọi.
        // height lúc chưa load sản phẩm sẽ khác height sau khi load sản phẩm xong nên cần trigger lại sự kiện resize để virtual scroll hoạt động chính xác
        window.dispatchEvent(new Event('resize'));
      })
      .catch((err) => {
        console.error(err);
        this.loading = false;
      });
  }

  handleDelete() {
    if (this.setOfCheckedId.size == 0) {
      this.msg.warning('Bạn chưa chọn người dùng');
      return;
    }
    this.modal.confirm({
      nzTitle: `Xóa ${this.setOfCheckedId.size} người dùng`,
      nzOkText: 'Xác nhận',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.loading = true;
        const idsToDelete = Array.from(this.setOfCheckedId);
        const promises = idsToDelete.map((_id: any) => this.apiService.deleteUser(_id));

        return Promise.all(promises)
          .then(() => {
            // Xóa tất cả category có id nằm trong idsToDelete
            this.users = this.users.filter((item: any) => !this.setOfCheckedId.has(item._id));
            this.setOfCheckedId.clear();
          })
          .finally(() => {
            this.loading = false;
          });
      },
      nzCancelText: 'Hủy',
    });
  }

  onSearch() {}

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find((item) => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;

    if (sortField == 'name') {
      // this.sort = {
      //   [`name.${this.apiService.projectWorking.language.default}`]:
      //     sortOrder == 'ascend' ? 1 : -1,
      // };
    }

    if (!sortField) {
      this.sort = {};
    }

    if (!this.keySearch) {
      this.getUsers();
    }
  }

  handleEdit(user: any) {
    const modalRef: any = this.modal.create({
      nzTitle: 'Cập nhật người dùng',
      nzContent: EditUserComponent,
      nzWidth: '390px',
      nzCentered: true,
      nzData: {
        user,
      },
      nzFooter: [
        { label: 'Hủy', onClick: () => modalRef.destroy() },
        {
          label: 'Xác nhận',
          type: 'primary',
          autoLoading: true, // bật spinner nếu onClick trả Promise
          onClick: (cmp: EditUserComponent) => {
            return cmp.onEditUser().then((result: any) => {
              cmp.modalRef.close(); // Đóng modal và trả về kết quả
              this.users = this.users.map((u: any) => (u._id === result._id ? result : u));
            });
          },
        },
      ],
      nzClassName: 'modal-admin',
    });
  }

  handleSortLocal = (a: any, b: any): number => {
    const an = (a?.name ?? '').toString();
    const bn = (b?.name ?? '').toString();
    return an.localeCompare(bn, undefined, { sensitivity: 'base' });
  };

  handleChangeRole(newRole: any, data: any) {
    this.apiService
      .updateUser(data._id, { role: newRole })
      .then((res: any) => {
        if (res.vcode == 0) {
          data.role = newRole;
          this.msg.success('Cập nhật vai trò thành công');
        }
      })
      .catch((err: any) => {
        this.msg.error('Cập nhật vai trò thất bại');
      });
  }

  handleAddUser() {
    const modalRef: any = this.modal.create({
      nzTitle: 'Thêm người dùng mới',
      nzContent: AddUserComponent,
      nzWidth: '390px',
      nzCentered: true,
      nzFooter: [
        { label: 'Hủy', onClick: () => modalRef.destroy() },
        {
          label: 'Xác nhận',
          type: 'primary',
          autoLoading: true, // bật spinner nếu onClick trả Promise
          onClick: (cmp: AddUserComponent) => {
            return cmp.onAddUser().then((result: any) => {
              cmp.modalRef.close(); // Đóng modal và trả về kết quả
              this.users = [result, ...this.users];
            });
          },
        },
      ],
      nzClassName: 'modal-admin',
    });
  }
}
