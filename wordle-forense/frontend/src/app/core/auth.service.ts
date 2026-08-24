import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly token = signal<string | null>(localStorage.getItem('token'));

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<LoginResponse>('/api/auth/login', { username, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        this.token.set(res.token);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.token.set(null);
    this.router.navigateByUrl('/login');
  }

  /** Decodifica Base64(userId:username:role) — o mesmo formato inseguro do backend (V3). */
  payload(): { userId: string; username: string; role: string } | null {
    const t = this.token();
    if (!t) {
      return null;
    }
    try {
      const decoded = atob(t);
      const [userId, username, role] = decoded.split(':');
      if (!userId || !username || !role) {
        return null;
      }
      return { userId, username, role };
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    return this.payload()?.role === 'ADMIN';
  }
}
