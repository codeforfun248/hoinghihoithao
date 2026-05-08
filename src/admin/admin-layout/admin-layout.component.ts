import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLink } from '@angular/router';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { AuthenticatedDropdownComponent } from '../../components/authenticated-dropdown/authenticated-dropdown.component';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  imports: [
    NzBreadCrumbModule,
    NzIconModule,
    NzMenuModule,
    NzLayoutModule,
    RouterOutlet,
    RouterLinkWithHref,
    RouterLink,
    AuthenticatedDropdownComponent,
    NzDrawerModule,
  ],
})
export class AdminLayoutComponent implements OnInit {
  routes: any = [
    {
      label: 'Tổng quan',
      route: '/admin',
      icon: 'dashboard',
    },
    {
      label: 'Quản lý hội nghị',
      route: '/admin/conferences',
      icon: 'file',
    },
    {
      label: 'Quản lý Khoa/Viện',
      route: '/admin/faculties',
      icon: 'snippets',
    },
    {
      label: 'Quản lý người dùng',
      route: '/admin/users',
      icon: 'team',
    },
  ];
  isCollapsed = false;
  openDrawer = false;
  protected readonly date = new Date();
  constructor() {}

  ngOnInit() {}
}
