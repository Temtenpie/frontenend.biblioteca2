import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
    return this.http.post<LoginResponse>(this.loginUrl, { username, password });
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