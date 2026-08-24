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
    <div class="card" style="max-width: 920px;">
      <h1>Painel admin</h1>
      <p class="warn">
        Menu visível só se a role decodificada do token local for ADMIN (checagem só no front).
        A API confia na role do token Base64 sem assinatura (V3).
      </p>

      <h2>Usuários</h2>
      <table>
        <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th></tr></thead>
        <tbody>
          @for (u of users; track u.id) {
            <tr>
              <td>{{ u.id }}</td>
              <td>{{ u.username }}</td>
              <td>{{ u.email }}</td>
              <td>{{ u.role }}</td>
            </tr>
          }
        </tbody>
      </table>

      <h2>Palavras</h2>
      <form class="row" (ngSubmit)="create()">
        <input name="w" [(ngModel)]="newWord" maxlength="5" placeholder="PALAVRA" />
        <select name="d" [(ngModel)]="newDiff">
          <option>FACIL</option>
          <option>MEDIO</option>
          <option>DIFICIL</option>
        </select>
        <button class="btn" type="submit">Criar</button>
      </form>
      <table>
        <thead><tr><th>ID</th><th>Palavra</th><th>Dificuldade</th><th>Ativa</th><th></th></tr></thead>
        <tbody>
          @for (w of words; track w.id) {
            <tr>
              <td>{{ w.id }}</td>
              <td>{{ w.word }}</td>
              <td>{{ w.difficulty }}</td>
              <td>{{ w.active ? 'sim' : 'não' }}</td>
              <td>
                <button class="btn btn-ghost" type="button" (click)="toggle(w)">{{ w.active ? 'desativar' : 'ativar' }}</button>
                <button class="btn btn-danger" type="button" (click)="remove(w.id)">apagar</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`.row { display: flex; gap: 8px; margin: 12px 0; }`],
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
