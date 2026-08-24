import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface SessionRow {
  id: number;
  status: string;
  startedAt: string;
  finishedAt: string;
}

@Component({
  selector: 'app-sessions',
  standalone: true,
  template: `
    <div class="page">
      <h1>Estatísticas</h1>
      @for (s of sessions; track s.id) {
        <button type="button" class="stat" (click)="open(s.id)">
          <strong>#{{ s.id }}</strong>
          <span>{{ s.status === 'WON' ? 'Vitória' : s.status === 'LOST' ? 'Derrota' : 'Em jogo' }}</span>
        </button>
      }
      @if (!sessions.length) {
        <p class="empty">Nenhuma partida ainda.</p>
      }
      @if (detail) {
        <pre>{{ detail }}</pre>
      }
      <p class="note">O detalhe da partida não verifica o dono. Troque o número do id na API (V2).</p>
    </div>
  `,
  styles: [`
    .stat {
      width: 100%;
      display: flex;
      justify-content: space-between;
      background: none;
      border: 0;
      border-bottom: 1px solid var(--border);
      color: #fff;
      padding: 16px 2px;
      cursor: pointer;
      font-weight: 700;
    }
    .stat span { color: var(--muted); font-weight: 600; }
    .empty { color: var(--muted); }
  `],
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
