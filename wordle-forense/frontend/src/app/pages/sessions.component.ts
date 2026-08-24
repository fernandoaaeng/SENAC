import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

interface SessionRow {
  id: number;
  status: string;
  startedAt: string;
  finishedAt: string;
}

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="card">
      <h1>Minhas sessões</h1>
      <p class="warn">V2: o detalhe da sessão (GET /api/game/id) não checa o dono. Troque o ID na URL ou no fetch.</p>
      <table>
        <thead>
          <tr><th>ID</th><th>Status</th><th>Início</th><th></th></tr>
        </thead>
        <tbody>
          @for (s of sessions; track s.id) {
            <tr>
              <td>{{ s.id }}</td>
              <td>{{ s.status }}</td>
              <td>{{ s.startedAt }}</td>
              <td><a [routerLink]="[]" (click)="open(s.id); $event.preventDefault()">abrir detalhe API</a></td>
            </tr>
          }
        </tbody>
      </table>
      @if (detail) {
        <pre>{{ detail }}</pre>
      }
    </div>
  `,
})
export class SessionsComponent implements OnInit {
  private http = inject(HttpClient);
  sessions: SessionRow[] = [];
  detail = '';

  ngOnInit() {
    this.http.get<SessionRow[]>('/api/game/my').subscribe((rows) => (this.sessions = rows));
  }

  open(id: number) {
    this.http.get(`/api/game/${id}`).subscribe((d) => (this.detail = JSON.stringify(d, null, 2)));
  }
}
