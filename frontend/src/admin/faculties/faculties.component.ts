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
import { NzModalService } from 'ng-zorro-antd/modal';
import { AddFacultyComponent } from './add-faculty/add-faculty.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { EditFacultyComponent } from './edit-faculty/edit-faculty.component';

@Component({
  selector: 'app-faculties',
  templateUrl: './faculties.component.html',
  styleUrls: ['./faculties.component.css'],
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
export class FacultiesComponent implements OnInit {
  faculties: any = [];
  dataSearched: any = [];
  keySearch: string = '';
  loading: boolean = false;
  sort: any = {};
  roles: any = [];
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
    this.listOfCurrentPageData.forEach((item) => this.updateCheckedSet(item.id, value));
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange($event: readonly any[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every((item) => this.setOfCheckedId.has(item.id));
    this.indeterminate =
      this.listOfCurrentPageData.some((item) => this.setOfCheckedId.has(item.id)) && !this.checked;
  }

  constructor(
    public apiService: ApiService,
    private msg: NzMessageService,
    private modal: NzModalService,
  ) {}

  ngOnInit() {
    // const test = [
    //   // ===== thêm 50 dữ liệu =====
    //   { name: 'Khoa công nghệ thông tin' },
    //   { name: 'Khoa khoa học máy tính' },
    //   { name: 'Khoa trí tuệ nhân tạo' },
    //   { name: 'Khoa hệ thống thông tin' },
    //   { name: 'Khoa an toàn thông tin' },
    //   { name: 'Khoa khoa học dữ liệu' },
    //   { name: 'Khoa điện – điện tử' },
    //   { name: 'Khoa cơ khí – tự động hóa' },
    //   { name: 'Khoa công nghệ sinh học' },
    //   { name: 'Khoa công nghệ thực phẩm' },
    //   { name: 'Khoa toán – thống kê' },
    //   { name: 'Khoa vật lý ứng dụng' },
    //   { name: 'Khoa hóa học' },
    //   { name: 'Khoa môi trường' },
    //   { name: 'Khoa khoa học xã hội' },
    //   { name: 'Viện nghiên cứu AI & Big Data' },
    //   { name: 'Viện nghiên cứu khoa học ứng dụng' },
    //   { name: 'Viện nghiên cứu công nghệ cao' },
    //   { name: 'Viện nghiên cứu phát triển bền vững' },
    //   { name: 'Viện nghiên cứu đô thị thông minh' },
    //   { name: 'Trung tâm nghiên cứu và khởi nghiệp' },
    //   { name: 'Trung tâm đào tạo doanh nghiệp' },
    //   { name: 'Trung tâm CNTT & chuyển đổi số' },
    //   { name: 'Trung tâm học liệu số' },
    //   { name: 'Trung tâm thí nghiệm công nghệ' },
    //   { name: 'Phòng khoa học và công nghệ' },
    //   { name: 'Phòng đào tạo và đảm bảo chất lượng' },
    //   { name: 'Phòng hợp tác quốc tế' },
    //   { name: 'Phòng công tác sinh viên' },
    //   { name: 'Phòng quản lý dự án NCKH' },
    //   { name: 'Bộ môn công nghệ web' },
    //   { name: 'Bộ môn trí tuệ nhân tạo' },
    //   { name: 'Bộ môn kỹ thuật phần mềm' },
    //   { name: 'Bộ môn khoa học dữ liệu' },
    //   { name: 'Bộ môn an ninh mạng' },
    //   { name: 'Khoa kinh doanh và khởi nghiệp' },
    //   { name: 'Khoa marketing số' },
    //   { name: 'Khoa logistics và chuỗi cung ứng' },
    //   { name: 'Khoa tài chính – ngân hàng' },
    //   { name: 'Khoa quản trị kinh doanh' },
    // ];
    // let promises = [];
    // for (let i = 0; i < test.length; i++) {
    //   promises.push(this.apiService.addFaculty(test[i]));
    // }
    // Promise.all(promises)
    //   .then(() => {
    //     this.getFaculties();
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //     this.getFaculties();
    //   });
  }

  getFaculties() {
    this.keySearch = '';

    this.loading = true;
    this.apiService
      .getFaculties_byFields({}, this.sort, this.pageIndex, this.pageSize)
      .then((res: any) => {
        this.faculties = res.data;
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
      this.msg.warning('Vui lòng chọn ít nhất 1 Khoa/Viện cần xóa');
      return;
    }
    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa các Khoa/Viện đã chọn?',
      nzOkText: 'Xác nhận',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.loading = true;
        const idsToDelete = Array.from(this.setOfCheckedId);
        const promises = idsToDelete.map((id: any) => this.apiService.deleteFaculty(id));

        return Promise.all(promises)
          .then(() => {
            // Xóa tất cả faculty có id nằm trong idsToDelete
            this.faculties = this.faculties.filter(
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

  onSearch() {
    if (!this.keySearch) {
      this.getFaculties();
      return;
    }
    this.loading = true;
    this.apiService
      .onSearch(this.keySearch, 'faculties')
      .then((res: any) => {
        if (res.vcode === 0) {
          this.dataSearched = res.data;
          this.faculties = res.data;
          this.total = res.totaldocs;
        }
      })
      .finally(() => (this.loading = false));
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find((item) => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;

    if (sortField == 'name') {
      this.sort = {
        [`name`]: sortOrder == 'ascend' ? 1 : -1,
      };
    }

    if (!sortField) {
      this.sort = {};
    }

    if (!this.keySearch) {
      this.getFaculties();
    }
  }

  handleEdit(faculty: any) {
    const modalRef: any = this.modal.create({
      nzTitle: 'Chỉnh sửa thông tin Khoa/Viện',
      nzContent: EditFacultyComponent,
      nzWidth: '390px',
      nzCentered: true,
      nzData: {
        faculty,
      },
      nzFooter: [
        { label: 'Hủy', onClick: () => modalRef.destroy() },
        {
          label: 'Lưu',
          type: 'primary',
          autoLoading: true, // bật spinner nếu onClick trả Promise
          onClick: (cmp: EditFacultyComponent) => {
            return cmp.onEditFaculty(); // ⬅️ TRẢ Promise ra đây
          },
        },
      ],
      nzClassName: 'modal-admin modal-height-fit-content',
    });

    // nhận dữ liệu khi đóng
    modalRef.afterClose.subscribe((result: any) => {
      if (result) {
        this.faculties = this.faculties.map((item: any) => {
          if (item.id === result.id) {
            return result;
          }
          return item;
        });
      }
    });
  }

  handleSortLocal = (a: any, b: any): number => {
    const an = (a?.name ?? '').toString();
    const bn = (b?.name ?? '').toString();
    return an.localeCompare(bn, undefined, { sensitivity: 'base' });
  };

  addFaculty() {
    const modalRef: any = this.modal.create({
      nzTitle: 'Thêm Khoa/Viện mới',
      nzContent: AddFacultyComponent,
      nzWidth: '390px',
      nzCentered: true,

      nzFooter: [
        { label: 'Hủy', onClick: () => modalRef.destroy() },
        {
          label: 'Xác nhận',
          type: 'primary',
          autoLoading: true, // bật spinner nếu onClick trả Promise
          onClick: (cmp: AddFacultyComponent) => {
            return cmp.onAddFaculty(); // ⬅️ TRẢ Promise ra đây
          },
        },
      ],
      nzClassName: 'modal-admin',
    });

    // nhận dữ liệu khi đóng
    modalRef.afterClose.subscribe((result: any) => {
      if (result) {
        this.faculties = [result, ...this.faculties];
      }
    });
  }
}
