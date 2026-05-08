import { Routes } from '@angular/router';
import { HomeComponent } from '../pages/home/home.component';
import { DashboardComponent } from '../admin/dashboard/dashboard.component';
import { AdminLayoutComponent } from '../admin/admin-layout/admin-layout.component';
import { adminGuard } from '../guards/admin.guard';
import { ConferencesComponent } from '../admin/conferences/conferences.component';
import { UserLayoutComponent } from '../components/user-layout/user-layout.component';
import { userGuard } from '../guards/user.guard';
import { UsersComponent } from '../admin/users/users.component';
import { FacultiesComponent } from '../admin/faculties/faculties.component';
import { ConferenceDetailComponent } from '../pages/conference-detail/conference-detail.component';
import { AdminConferenceDetailComponent } from '../admin/conferences/admin-conference-detail/admin-conference-detail.component';
import { MyConferencesComponent } from '../pages/my-conferences/my-conferences.component';
import { ResetPasswordComponent } from '../pages/reset-password/reset-password.component';

export const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    canActivate: [userGuard],
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'conferences/:id',
        component: ConferenceDetailComponent,
      },
      // 👇 Thêm dòng này vào 👇
      { path: 'my-conferences', component: MyConferencesComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
    ],
  },

  // Route Login (Ai cũng vào được)
  // { path: 'admin/login', component: AdminLoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent, // Layout chứa Sidebar/Header Admin
    canActivate: [adminGuard], // <--- GẮN GUARD Ở ĐÂY
    children: [
      { path: '', component: DashboardComponent },
      { path: 'conferences', component: ConferencesComponent },
      // 👇 THÊM DÒNG NÀY ĐỂ VÀO TRANG CHI TIẾT HỘI NGHỊ TRONG ADMIN 👇
      { path: 'conferences/:id', component: AdminConferenceDetailComponent },
      { path: 'faculties', component: FacultiesComponent },
      { path: 'users', component: UsersComponent },
    ],
  },
];
