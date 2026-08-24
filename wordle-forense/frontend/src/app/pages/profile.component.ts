import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <div class="card">
      <h1>Perfil #{{ id }}</h1>
      <p class="warn">V4: GET /api/users/id não checa identidade. Mude o número na barra de endereço (/users/1, /users/2…).</p>
      @if (user) {
        <p><strong>Username:</strong> {{ user.username }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Role:</strong> {{ user.role }}</p>
      } @else if (error) {
        <p>{{ error }}</p>
      }
    </div>
  `,
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
        error: () => (this.error = 'Usuário não encontrado'),
      });
    });
  }
}
