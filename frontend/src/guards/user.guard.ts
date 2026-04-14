import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

export const userGuard = async () => {
  const authService = inject(AuthService);
  const apiService = inject(ApiService);

  // Dùng await để đợi API chạy xong mới đi tiếp
  // Code chạy tuần tự, rất dễ hiểu
  apiService.loading = true;
  try {
    await authService.fetchMe();
  } catch (error) {
  } finally {
    apiService.loading = false;
  }

  return true;
};
