import { CommonModule, DatePipe } from '@angular/common';
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
import { NzModalService } from 'ng-zorro-antd/modal';
import { AddConferenceComponent } from './add-conference/add-conference.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-conferences',
  templateUrl: './conferences.component.html',
  styleUrls: ['./conferences.component.css'],
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
    DatePipe,
    RouterLink,
  ],
})
export class ConferencesComponent implements OnInit {
  conferences: any = [];
  dataSearched: any = [];
  keySearch: string = '';
  loading: boolean = false;
  sort: any = { _id: -1 };
  roles: any = [];
  typeMap: any = {
    event: 'Sự kiện',
    conference: 'Hội nghị/Hội thảo',
  };

  @ViewChild('container', { read: ElementRef }) container!: ElementRef<HTMLInputElement>;

  //Khoa/Viện
  faculties: any = [];
  selectedFaculty: any = 'all';
  statusOptions: any = [
    { label: 'Chưa duyệt', value: 'pending' },
    { label: 'Duyệt', value: 'confirmed' },
    { label: 'Hủy', value: 'canceled' },
  ];

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
  ) {}

  ngOnInit() {
    this.getFaculties();
  }

  getFaculties() {
    this.apiService.getFaculties_byFields({}, {}).then((res: any) => {
      this.faculties = res.data;
    });
  }

  getConferences() {
    const query: any = {};
    if (this.selectedFaculty != 'all') {
      query.faculty_id = this.selectedFaculty;
    }
    this.loading = true;
    console.log('sort', this.sort);

    this.apiService
      .getConferences_byFields(query, this.sort, this.pageIndex, this.pageSize)
      .then((res: any) => {
        this.conferences = res.data;
        this.total = res.total;
        this.loading = false;
      })
      .catch((err) => {
        console.error(err);
        this.loading = false;
      });
  }

  handleDelete() {
    if (this.setOfCheckedId.size == 0) {
      this.msg.warning('Vui lòng chọn ít nhất 1 hội nghị cần xóa');
      return;
    }
    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa các hội nghị đã chọn?',
      nzOkText: 'Xác nhận',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.loading = true;
        console.log('setOfCheckedId', this.setOfCheckedId);

        const idsToDelete = Array.from(this.setOfCheckedId);
        const promises = idsToDelete.map((id: any) => this.apiService.deleteConference(id));

        return Promise.all(promises)
          .then(() => {
            // Xóa tất cả faculty có id nằm trong idsToDelete
            this.conferences = this.conferences.filter(
              (item: any) => !this.setOfCheckedId.has(item._id),
            );
            this.setOfCheckedId.clear();
          })
          .finally(() => {
            this.loading = false;
          });
      },
      nzCancelText: 'Hủy',
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

    // Nếu có click sort trên tiêu đề cột của bảng
    if (sortField) {
      this.sort = {
        [sortField]: sortOrder === 'ascend' ? 1 : -1,
      };
    }
    // Nếu không có cột nào được click sort (ví dụ lúc mới load trang)
    else {
      this.sort = { _id: -1 }; // ✅ Reset về mặc định: Mới nhất lên đầu
    }

    if (!this.keySearch) {
      this.getConferences();
    }
  }

  handleEdit(user: any) {}

  handleAdd() {
    const conferenceDraft = localStorage.getItem('conference_draft');
    const modalRef: any = this.modal.create({
      nzTitle: 'Thêm hội nghị mới',
      nzContent: AddConferenceComponent,
      nzData: {
        conferenceDraft,
      },
      nzWidth: '95vw',
      nzFooter: [
        { label: 'Hủy', onClick: () => modalRef.destroy() },
        {
          label: 'Xác nhận',
          type: 'primary',
          autoLoading: true, // bật spinner nếu onClick trả Promise
          onClick: (cmp: AddConferenceComponent) => {
            return cmp.onAddConference().then((res: any) => {
              if (res.vcode == 0 && res.data) {
                this.conferences = [res.data, ...this.conferences];
                modalRef.destroy();
              }
            }); // ⬅️ TRẢ Promise ra đây
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

  changeRole(item: any, role: any) {
    item.role = role;
    const roleId = this.roles.find((r: any) => r.name == role).id;
    item.role_id = roleId;
    this.apiService
      .updateUser(item.id, { role_id: roleId })
      .then((res: any) => {
        this.msg.success('Cập nhật vai trò thành công');
      })
      .catch((err: any) => {
        this.msg.error('Cập nhật vai trò thất bại');
      });
  }

  handleChangeStatus(newStatus: string, data: any) {
    this.loading = true;
    this.apiService
      .updateConference(data._id, {
        status: newStatus,
      })
      .then((res: any) => {})
      .finally(() => (this.loading = false));
  }
}
