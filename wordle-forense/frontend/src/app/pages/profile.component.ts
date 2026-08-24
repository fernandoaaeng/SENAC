import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <div class="page">
      <h1>Conta</h1>
      @if (user) {
        <p class="line"><span>Jogador</span>{{ user.username }}</p>
        <p class="line"><span>Email</span>{{ user.email }}</p>
        <p class="line"><span>Papel</span>{{ user.role }}</p>
      } @else if (error) {
        <p>{{ error }}</p>
      }
      <p class="note">Mude o número na URL — /users/1, /users/2… — para ver outras contas (V4).</p>
    </div>
  `,
  styles: [`
    .line {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      padding: 16px 0;
      margin: 0;
      font-weight: 700;
    }
    .line span { color: var(--muted); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; }
  `],
})
export class ProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  id = '';
  user: { username: string; email: string; role: string } | null = null;
  error = '';

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id') || '';
      this.user = null;
      this.error = '';
      this.http.get<{ username: string; email: string; role: string }>(`/api/users/${this.id}`).subscribe({
        next: (u) => (this.user = u),
        error: () => (this.error = 'Não encontrado'),
      });
    });
  }
}
