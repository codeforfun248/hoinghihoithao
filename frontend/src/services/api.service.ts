import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private urlBE = `${environment.apiUrl}/api/v1`;
  loading: boolean = false;

  constructor(private http: HttpClient) {}

  //   onLogin(idToken: string) {
  //     return new Promise((resolve, reject) => {
  //       lastValueFrom(
  //         this.http.post<any>(`${this.urlBE}/auth/google-login`, { idToken }).pipe(
  //           tap((res) => {
  //             this.user = res.data;
  //             resolve(res);
  //           }),
  //         ),
  //       ).catch((error) => {
  //         reject(error);
  //       });
  //     });
  //   }

  getUsers_byFields(query: any, sort: any, page?: number, limit?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http
          .get<any>(
            `${this.urlBE}/admin/users?query=${encodeURIComponent(
              JSON.stringify(query),
            )}&sort=${encodeURIComponent(JSON.stringify(sort))}&limit=${limit}&page=${page}`,
          )
          .pipe(
            tap((res) => {
              resolve(res);
            }),
          ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  addUser(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.post<any>(`${this.urlBE}/admin/users`, data).pipe(
          tap((res) => {
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  updateUser(userId: number, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.put<any>(`${this.urlBE}/admin/users/${userId}`, data).pipe(
          tap((res) => {
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  deleteUser(userId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.delete<any>(`${this.urlBE}/admin/users/${userId}`).pipe(
          tap((res) => {
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  uploadImage(file: File, folder: string = 'avatar'): Promise<any> {
    const formData = new FormData();
    formData.append('folder', folder);
    formData.append('file', file);
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.post<any>(`${this.urlBE}/upload`, formData).pipe(
          tap((res) => {
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  // ===================== FACULTY =====================
  getFaculties_byFields(query: any, sort: any, page?: number, limit?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http
          .get<any>(
            `${this.urlBE}/admin/faculties?query=${encodeURIComponent(
              JSON.stringify(query),
            )}&sort=${encodeURIComponent(JSON.stringify(sort))}&limit=${limit}&page=${page}`,
          )
          .pipe(
            tap((res) => {
              resolve(res);
            }),
          ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  addFaculty(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.post<any>(`${this.urlBE}/admin/faculties`, data).pipe(
          tap((res) => {
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  updateFaculty(facultyId: number, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.put<any>(`${this.urlBE}/admin/faculties/${facultyId}`, data).pipe(
          tap((res) => {
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  deleteFaculty(facultyId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.delete<any>(`${this.urlBE}/admin/faculties/${facultyId}`).pipe(
          tap((res) => {
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  onSearch(value: any, colname: any): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.post<any>(`${this.urlBE}/admin/search`, { value, colname }).pipe(
          tap((res) => {
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  // ===================== CONFERENCE =====================
  getConferences_byFields(
    query: any = {},
    sort: any = {},
    page?: number,
    limit?: number,
  ): Promise<any> {
    // 1. Tạo HttpParams và tự động ép kiểu sang JSON string an toàn
    let params = new HttpParams()
      .set('query', JSON.stringify(query))
      .set('sort', JSON.stringify(sort));

    // 2. Chỉ thêm page và limit vào URL nếu chúng có giá trị
    if (page) {
      params = params.set('page', page);
    }
    if (limit) {
      params = params.set('limit', limit);
    }

    // 3. Truyền biến params vào config của this.http.get
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http
          .get<any>(`${this.urlBE}/conferences`, { params: params })
          .pipe(tap((res) => resolve(res))),
      ).catch((error) => reject(error));
    });
  }

  addConference(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.post<any>(`${this.urlBE}/conferences`, data).pipe(
          tap((res) => {
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  updateConference(id: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.put<any>(`${this.urlBE}/conferences/${id}`, data).pipe(
          tap((res) => {
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  deleteConference(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.delete<any>(`${this.urlBE}/conferences/${id}`).pipe(
          tap((res) => {
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  // ===================== CONFERENCE =====================
  getDashboardStats(): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.get<any>(`${this.urlBE}/admin/stats`).pipe(
          tap((res) => {
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  registerParticipate(conferenceId: any): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http
          .post<any>(`${this.urlBE}/conferences/register-participate`, {
            conferenceId,
          })
          .pipe(
            tap((res) => {
              resolve(res);
            }),
          ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  checkRegistration(conferenceId: any): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http
          .post<any>(`${this.urlBE}/conferences/check-registration`, {
            conferenceId,
          })
          .pipe(
            tap((res) => {
              resolve(res);
            }),
          ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  // Lấy danh sách tài liệu / bài báo cáo
  getSubmissions_byFields(query: any, sort: any, page?: number, limit?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http
          .get<any>(
            `${this.urlBE}/submissions?query=${encodeURIComponent(
              JSON.stringify(query),
            )}&sort=${encodeURIComponent(JSON.stringify(sort))}&limit=${limit}&page=${page}`,
          )
          .pipe(
            tap((res) => {
              resolve(res);
            }),
          ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  // Nộp bài mới
  createSubmission(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.post<any>(`${this.urlBE}/submissions`, data).pipe(
          tap((res) => {
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  // Cập nhật bài báo cáo
  updateSubmission(id: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.put<any>(`${this.urlBE}/submissions/${id}`, data).pipe(
          tap((res) => {
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  // Xóa bài báo cáo
  deleteSubmission(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.delete<any>(`${this.urlBE}/submissions/${id}`).pipe(
          tap((res) => {
            resolve(res);
          }),
        ),
      ).catch((error) => {
        reject(error);
      });
    });
  }

  // ================= API QUẢN LÝ ĐĂNG KÝ (REGISTRATIONS) =================

  getRegistrations_byFields(
    query: any = {},
    sort: any = {},
    page?: number,
    limit?: number,
  ): Promise<any> {
    let params = new HttpParams()
      .set('query', JSON.stringify(query))
      .set('sort', JSON.stringify(sort));

    if (page) params = params.set('page', page);
    if (limit) params = params.set('limit', limit);

    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http
          .get<any>(`${this.urlBE}/registrations`, { params: params })
          .pipe(tap((res) => resolve(res))),
      ).catch((error) => reject(error));
    });
  }

  createRegistration(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.post<any>(`${this.urlBE}/registrations`, data).pipe(tap((res) => resolve(res))),
      ).catch((error) => reject(error));
    });
  }

  updateRegistration(id: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http
          .put<any>(`${this.urlBE}/registrations/${id}`, data)
          .pipe(tap((res) => resolve(res))),
      ).catch((error) => reject(error));
    });
  }

  deleteRegistration(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http.delete<any>(`${this.urlBE}/registrations/${id}`).pipe(tap((res) => resolve(res))),
      ).catch((error) => reject(error));
    });
  }

  forgotPassword(email: any): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http
          .post<any>(`${this.urlBE}/auth/forgot-password`, {
            email,
          })
          .pipe(tap((res) => resolve(res))),
      ).catch((error) => reject(error));
    });
  }

  resetPassword(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      lastValueFrom(
        this.http
          .post<any>(`${this.urlBE}/auth/reset-password`, data)
          .pipe(tap((res) => resolve(res))),
      ).catch((error) => reject(error));
    });
  }
}
