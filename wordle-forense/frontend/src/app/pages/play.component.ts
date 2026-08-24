import { Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface StartRes { id: number; status: string; }
interface GuessRes { attemptNumber: number; guess: string; result: string; status: string; }

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card play">
      <h1>Jogar</h1>
      @if (!sessionId()) {
        <button class="btn" type="button" (click)="start()">Nova partida</button>
      } @else {
        <p class="muted">Sessão #{{ sessionId() }} · 6 tentativas · 5 letras</p>
        <div class="board">
          @for (row of rows; track $index) {
            <div class="row">
              @for (cell of row; track $index) {
                <div class="tile" [class]="cell.color">{{ cell.letter }}</div>
              }
            </div>
          }
        </div>
        @if (status() === 'IN_PROGRESS') {
          <form (submit)="$event.preventDefault(); send()">
            <input maxlength="5" name="guess" [(ngModel)]="current" (ngModelChange)="current = $event.toUpperCase()" />
            <button class="btn" type="submit" [disabled]="current.length !== 5">Chutar</button>
          </form>
        } @else {
          <p><strong>{{ status() === 'WON' ? 'Você acertou!' : 'Fim de jogo' }}</strong></p>
          <button class="btn" type="button" (click)="start()">Jogar de novo</button>
        }
        @if (error) { <p class="err">{{ error }}</p> }
      }
    </div>
  `,
  styles: [`
    .board { display: grid; gap: 6px; margin: 16px 0; }
    .row { display: grid; grid-template-columns: repeat(5, 52px); gap: 6px; justify-content: center; }
    .tile {
      width: 52px; height: 52px; border: 2px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.3rem; text-transform: uppercase;
    }
    .G { background: var(--green); border-color: var(--green); }
    .Y { background: var(--yellow); border-color: var(--yellow); color: #111; }
    .X { background: var(--gray); }
    form { display: flex; gap: 8px; justify-content: center; }
    form input { width: 140px; text-transform: uppercase; letter-spacing: 4px; text-align: center; }
    .err { color: var(--danger); }
  `],
})
export class PlayComponent {
  private http = inject(HttpClient);
  sessionId = signal<number | null>(null);
  status = signal('IN_PROGRESS');
  rows: { letter: string; color: string }[][] = emptyBoard();
  current = '';
  error = '';
  private nextRow = 0;

  start() {
    this.rows = emptyBoard();
    this.nextRow = 0;
    this.current = '';
    this.error = '';
    this.status.set('IN_PROGRESS');
    this.http.post<StartRes>('/api/game/start', {}).subscribe((res) => this.sessionId.set(res.id));
  }

  send() {
    const guess = this.current.toUpperCase();
    if (guess.length !== 5 || this.sessionId() == null) {
      return;
    }
    this.http.post<GuessRes>(`/api/game/${this.sessionId()}/guess`, { guess }).subscribe({
      next: (res) => {
        this.rows[this.nextRow] = [...guess].map((letter, i) => ({ letter, color: res.result[i] }));
        this.nextRow++;
        this.status.set(res.status);
        this.current = '';
        this.error = '';
      },
      error: (e) => (this.error = e.error?.error || 'Erro ao chutar'),
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (this.status() !== 'IN_PROGRESS' || this.sessionId() == null) {
      return;
    }
    if ((e.target as HTMLElement)?.tagName === 'INPUT') {
      return;
    }
    if (e.key === 'Enter') {
      this.send();
      return;
    }
    if (e.key === 'Backspace') {
      this.current = this.current.slice(0, -1);
      return;
    }
    if (/^[a-zA-Z]$/.test(e.key) && this.current.length < 5) {
      this.current += e.key.toUpperCase();
    }
  }
}

function emptyBoard() {
  return Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => ({ letter: '', color: '' })));
}
