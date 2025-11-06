import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoginResponse } from '../interfaces/auth.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = environment.apiUrl + '/auth/login';
  private registerUrl = environment.apiUrl + '/auth/register';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    console.log('📡 Login URL:', this.loginUrl);
    const payload: any = { username, password };
    // En algunos backends el campo es `email`; enviamos ambos para compatibilidad
    payload.email = username;

    return this.http
      .post<any>(this.loginUrl, payload, { withCredentials: true })
      .pipe(
        map((res: any) => {
          const token = res?.token ?? res?.accessToken ?? res?.data?.token ?? '';
          const user = res?.user ?? res?.data?.user ?? null;
          const success = res?.success ?? !!token;
          const normalized: LoginResponse = {
            success,
            token,
            user: user ?? { id: '', username: username, role: 'student', name: '' },
            message: res?.message
          };
          return normalized;
        })
      );
  }

  register(payload: { username: string; password: string; name: string; email: string; role?: 'admin' | 'student' | 'teacher' }): Observable<any> {
    console.log('📡 Register URL:', this.registerUrl);
    return this.http.post<any>(this.registerUrl, payload);
  }

  // ===== Helpers para guards y control de sesión =====
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!token || !!user;
  }

  getCurrentUser(): { id?: string; username?: string; name?: string; email?: string; role?: 'admin' | 'student' | 'teacher' } | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}