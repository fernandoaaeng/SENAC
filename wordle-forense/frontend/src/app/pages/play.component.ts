import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { sugestoesPt5 } from '../core/palavras-pt';

interface StartRes { id: number; status: string; }
interface GuessRes { attemptNumber: number; guess: string; result: string; status: string; }

const KEYS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

@Component({
  selector: 'app-play',
  standalone: true,
  template: `
    <div class="game">
      <div class="board" aria-label="Tabuleiro">
        @for (row of displayRows(); track $index) {
          <div class="row">
            @for (cell of row; track $index) {
              <div
                class="tile"
                [class.filled]="!!cell.letter && !cell.color"
                [class.G]="cell.color === 'G'"
                [class.Y]="cell.color === 'Y'"
                [class.X]="cell.color === 'X'"
              >{{ cell.letter }}</div>
            }
          </div>
        }
      </div>

      @if (toast()) {
        <div class="toast">{{ toast() }}</div>
      }
      @if (error) {
        <div class="toast">{{ error }}</div>
      }

      @if (status() === 'IN_PROGRESS' && sugestoes().length && current) {
        <div class="hints">
          @for (w of sugestoes(); track w) {
            <button type="button" (click)="usarSugestao(w)">{{ w }}</button>
          }
        </div>
      }

      @if (status() !== 'IN_PROGRESS' && sessionId()) {
        <button class="again" type="button" (click)="start()">Jogar de novo</button>
      }

      <div class="keyboard">
        @for (line of keys; track $index) {
          <div class="krow">
            @for (key of line; track key) {
              <button
                type="button"
                class="key"
                [class.wide]="key === 'ENTER' || key === '⌫'"
                [class.G]="keyColor(key) === 'G'"
                [class.Y]="keyColor(key) === 'Y'"
                [class.X]="keyColor(key) === 'X'"
                (click)="press(key)"
              >{{ key }}</button>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .game {
      width: min(500px, 100%);
      margin: 0 auto;
      min-height: calc(100vh - 50px);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 8px 16px;
    }
    .board {
      width: min(100%, 330px);
      display: grid;
      gap: 5px;
      margin: 8px 0 12px;
    }
    .row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; }
    .tile {
      aspect-ratio: 1;
      border: 2px solid #3a3a3c;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.85rem;
      text-transform: uppercase;
      background: #121213;
    }
    .tile.filled { border-color: #565758; }
    .tile.G { background: #538d4e; border-color: #538d4e; }
    .tile.Y { background: #b59f3b; border-color: #b59f3b; }
    .tile.X { background: #c62828; border-color: #c62828; }
    .toast {
      position: fixed;
      top: 64px;
      left: 50%;
      transform: translateX(-50%);
      background: #fff;
      color: #121213;
      font-weight: 800;
      font-size: 0.85rem;
      padding: 8px 14px;
      border-radius: 4px;
      z-index: 30;
    }
    .hints {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 4px;
      margin-bottom: 8px;
      min-height: 28px;
    }
    .hints button {
      background: none;
      border: 0;
      color: #818384;
      font-weight: 700;
      font-size: 0.7rem;
      letter-spacing: 0.14em;
      cursor: pointer;
      padding: 4px 6px;
    }
    .again {
      margin: 8px 0;
      background: #538d4e;
      color: #fff;
      border: 0;
      border-radius: 4px;
      padding: 10px 16px;
      font-weight: 800;
      cursor: pointer;
    }
    .keyboard {
      margin-top: auto;
      width: 100%;
      max-width: 500px;
      display: grid;
      gap: 6px;
      padding-top: 8px;
    }
    .krow { display: flex; justify-content: center; gap: 6px; }
    .key {
      flex: 1;
      max-width: 43px;
      height: 58px;
      border: 0;
      border-radius: 4px;
      background: #818384;
      color: #fff;
      font-weight: 700;
      font-size: 0.82rem;
      cursor: pointer;
    }
    .key.wide { max-width: 66px; font-size: 0.62rem; flex: 1.4; }
    .key.G { background: #538d4e; }
    .key.Y { background: #b59f3b; }
    .key.X { background: #c62828; }
  `],
})
export class PlayComponent implements OnInit {
  private http = inject(HttpClient);
  readonly keys = KEYS;
  sessionId = signal<number | null>(null);
  status = signal('IN_PROGRESS');
  toast = signal('');
  rows: { letter: string; color: string }[][] = emptyBoard();
  current = '';
  error = '';
  nextRow = 0;
  keyState: Record<string, string> = {};

  ngOnInit() {
    this.start();
  }

  sugestoes() {
    return sugestoesPt5(this.current, 6);
  }

  displayRows() {
    return this.rows.map((row, i) => {
      if (i !== this.nextRow || this.status() !== 'IN_PROGRESS') {
        return row;
      }
      return row.map((_, c) => ({ letter: this.current[c] || '', color: '' }));
    });
  }

  start() {
    this.rows = emptyBoard();
    this.nextRow = 0;
    this.current = '';
    this.error = '';
    this.keyState = {};
    this.toast.set('');
    this.status.set('IN_PROGRESS');
    this.http.post<StartRes>('/api/game/start', {}).subscribe((res) => this.sessionId.set(res.id));
  }

  usarSugestao(w: string) {
    this.current = w;
    this.send();
  }

  press(key: string) {
    if (this.status() !== 'IN_PROGRESS' || this.sessionId() == null) {
      return;
    }
    if (key === 'ENTER') {
      this.send();
      return;
    }
    if (key === '⌫') {
      this.current = this.current.slice(0, -1);
      return;
    }
    if (this.current.length < 5) {
      this.current += key;
    }
  }

  keyColor(key: string): string {
    return key.length === 1 ? this.keyState[key] || '' : '';
  }

  send() {
    const guess = this.current.toUpperCase();
    if (guess.length !== 5 || this.sessionId() == null) {
      this.flash(guess.length !== 5 ? 'Só palavras de 5 letras' : '');
      return;
    }
    this.http.post<GuessRes>(`/api/game/${this.sessionId()}/guess`, { guess }).subscribe({
      next: (res) => {
        this.rows[this.nextRow] = [...guess].map((letter, i) => ({ letter, color: res.result[i] }));
        [...guess].forEach((letter, i) => {
          const r = res.result[i];
          const prev = this.keyState[letter];
          if (r === 'G' || (r === 'Y' && prev !== 'G') || (!prev && r === 'X')) {
            this.keyState[letter] = r;
          }
        });
        this.nextRow++;
        this.status.set(res.status);
        this.current = '';
        this.error = '';
        if (res.status === 'WON') {
          this.flash(this.nextRow === 1 ? 'Gênio' : this.nextRow <= 3 ? 'Impressionante' : 'Parabéns');
        } else if (res.status === 'LOST') {
          this.flash('Fim de jogo');
        }
      },
      error: (e) => this.flash(e.error?.error || 'Não foi possível enviar'),
    });
  }

  flash(msg: string) {
    this.error = msg;
    this.toast.set(msg);
    setTimeout(() => {
      if (this.toast() === msg) {
        this.toast.set('');
      }
      if (this.error === msg && this.status() === 'IN_PROGRESS') {
        this.error = '';
      }
    }, 1600);
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (this.status() !== 'IN_PROGRESS' || this.sessionId() == null) {
      return;
    }
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      this.send();
      return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault();
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
