import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Dùng await để đợi API chạy xong mới đi tiếp
  // Code chạy tuần tự, rất dễ hiểu
  try {
    const res: any = await authService.fetchMe();

    if (res && (res.data.role === 'admin' || res.data.role === 'organizer')) {
      return true; // Cho phép vào
    } else {
      router.navigate(['']); // Đá về trang chủ
      return false;
    }
  } catch (error) {
    router.navigate(['']); // Đá về trang chủ
    return false;
  }
};
