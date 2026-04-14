import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { lastValueFrom, Observable, of, Subject } from 'rxjs'; // 1. Import hàm này
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private urlBE = `${environment.apiUrl}/api/v1`;
  user: any = null;

  // Subject để trigger mở modal login từ các component khác
  showLogin = new Subject<void>();

  constructor(private http: HttpClient) {}

  triggerLogin() {
    this.showLogin.next();
  }

  onGoogleLogin(idToken: string) {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.post<any>(`${this.urlBE}/auth/google-login`, { idToken }).pipe(
          tap((res) => {
            this.user = res.data;
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  onLogin(email: string, password: string) {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http
          .post<any>(`${this.urlBE}/auth/login`, {
            email,
            password,
          })
          .pipe(
            tap((res) => {
              this.user = res.data;
              resolve(res);
            }),
          ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  onRegister(name: string, email: string, password: string) {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http
          .post<any>(`${this.urlBE}/auth/register`, {
            name,
            email,
            password,
          })
          .pipe(
            tap((res) => {
              this.user = res.data;
              resolve(res);
            }),
          ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  onLogout() {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.post<any>(`${this.urlBE}/auth/logout`, {}).pipe(
          tap((res) => {
            this.user = null;
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  fetchMe() {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.post<any>(`${this.urlBE}/auth/me`, {}).pipe(
          tap((res) => {
            this.user = res.data;
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }
}
