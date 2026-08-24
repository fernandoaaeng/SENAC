import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface WordRow {
  id: number;
  word: string;
  difficulty: string;
  active: boolean;
}

interface UserRow {
  id: number;
  username: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <h1>Admin</h1>

      <h2>Jogadores</h2>
      @for (u of users; track u.id) {
        <p class="line"><span>#{{ u.id }} {{ u.username }}</span>{{ u.role }}</p>
      }

      <h2>Palavras</h2>
      <form (ngSubmit)="create()">
        <label>Nova
          <input name="w" [(ngModel)]="newWord" maxlength="5" autocomplete="off" spellcheck="false" />
        </label>
        <select name="d" [(ngModel)]="newDiff">
          <option>FACIL</option>
          <option>MEDIO</option>
          <option>DIFICIL</option>
        </select>
        <button class="btn" type="submit">Adicionar</button>
      </form>
      @for (w of words; track w.id) {
        <p class="line">
          <span>{{ w.word }}</span>
          <button class="btn-ghost" type="button" (click)="toggle(w)">{{ w.active ? 'on' : 'off' }}</button>
          <button class="btn-danger" type="button" (click)="remove(w.id)">apagar</button>
        </p>
      }
      <p class="note">A API confia na role que veio no token Base64, sem consultar o banco (V3).</p>
    </div>
  `,
  styles: [`
    h2 { font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin: 28px 0 8px; }
    .line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid var(--border);
      padding: 12px 0;
      margin: 0;
      font-weight: 700;
    }
    form { display: grid; gap: 10px; margin-bottom: 8px; }
  `],
})
export class AdminComponent implements OnInit {
  private http = inject(HttpClient);
  users: UserRow[] = [];
  words: WordRow[] = [];
  newWord = '';
  newDiff = 'MEDIO';

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.http.get<UserRow[]>('/api/admin/users').subscribe((u) => (this.users = u));
    this.http.get<WordRow[]>('/api/admin/words').subscribe((w) => (this.words = w));
  }

  create() {
    if (this.newWord.length !== 5) {
      return;
    }
    this.http.post('/api/admin/words', { word: this.newWord, difficulty: this.newDiff, active: true }).subscribe(() => {
      this.newWord = '';
      this.reload();
    });
  }

  toggle(w: WordRow) {
    this.http.put(`/api/admin/words/${w.id}`, { active: !w.active }).subscribe(() => this.reload());
  }

  remove(id: number) {
    this.http.delete(`/api/admin/words/${id}`).subscribe(() => this.reload());
  }
}
