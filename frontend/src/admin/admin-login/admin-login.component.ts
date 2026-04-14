import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
// Import các Module của Ng-Zorro
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzIconModule,
    NzCheckboxModule,
  ],
})
export class AdminLoginComponent {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private msg = inject(NzMessageService); // Dùng để hiện thông báo popup
  passwordVisible = false;

  isLoading = false;

  // Form definition
  validateForm = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]), // Backend dùng email
    password: this.fb.control('', [Validators.required]),
    remember: this.fb.control(true),
  });

  submitForm(): void {
    // if (this.validateForm.valid) {
    //   this.isLoading = true;
    //   const { email, password } = this.validateForm.getRawValue();
    //   this.authService
    //     .loginAdmin({ email, password })
    //     .then((res: any) => {
    //       this.isLoading = false;
    //       this.msg.success('Login successful!');
    //       this.router.navigate(['/admin']);
    //     })
    //     .catch((err) => {
    //       console.error('err', err);
    //       this.isLoading = false;
    //       this.msg.error(err.error?.msg || 'Login failed. Please try again.');
    //     });
    // }
  }
}
