import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap, catchError, of, Observable } from 'rxjs';
import { AuthResponse, User, ApiResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  currentUser = signal<User | null>(null);

  constructor() {
    this.loadUser();
  }

  login(credentials: any): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  register(userData: any): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.currentUser.set(null);
  }

  private setSession(authResult: AuthResponse) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', authResult.token);
    }
    this.currentUser.set(authResult.user);
  }

  loadUser() {
    if (!isPlatformBrowser(this.platformId)) return;
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`).pipe(
        catchError(() => {
          this.logout();
          return of(null);
        })
      ).subscribe(res => {
        if (res && res.success) {
          this.currentUser.set(res.data);
        }
      });
    }
  }

  updateProfile(data: { fullName?: string, phone?: string }): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/me`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
        }
      })
    );
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }
}
