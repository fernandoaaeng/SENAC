import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="bar">
      <div class="icons">
        @if (auth.token()) {
          <button type="button" class="icon" (click)="menu = !menu; help = false" aria-label="Menu">☰</button>
        }
        <button type="button" class="icon" (click)="help = !help; menu = false" aria-label="Como jogar">?</button>
      </div>
      <a routerLink="/play" class="logo">Wordle</a>
      <div class="icons right">
        @if (auth.token()) {
          <a class="icon" routerLink="/sessions" aria-label="Estatísticas">▦</a>
        }
      </div>
    </header>

    @if (menu) {
      <div class="scrim" (click)="menu = false"></div>
      <aside class="drawer">
        <a routerLink="/play" (click)="menu = false">Jogo</a>
        <a routerLink="/sessions" (click)="menu = false">Partidas</a>
        <a [routerLink]="['/users', auth.payload()?.userId]" (click)="menu = false">Conta</a>
        @if (auth.isAdmin()) {
          <a routerLink="/admin" (click)="menu = false">Admin</a>
        }
        <button type="button" (click)="auth.logout(); menu = false">Sair</button>
      </aside>
    }

    @if (help) {
      <div class="scrim" (click)="help = false"></div>
      <div class="modal" role="dialog">
        <button type="button" class="close" (click)="help = false">×</button>
        <h2>Como jogar</h2>
        <p>Adivinhe a palavra em 6 tentativas. Cada palpite deve ter 5 letras. As cores mostram o quão perto você está.</p>
        <p>
          <span class="example"><span class="G">C</span></span>
          está na palavra e no lugar certo.
        </p>
        <p>
          <span class="example"><span class="Y">A</span></span>
          está na palavra, mas no lugar errado.
        </p>
        <p>
          <span class="example"><span class="X">G</span></span>
          não está na palavra.
        </p>
        <p class="aula">Laboratório de computação forense — o app é intencionalmente vulnerável. Use só neste ambiente.</p>
      </div>
    }

    <router-outlet />
  `,
  styles: [`
    .bar {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      height: 50px;
      padding: 0 8px;
      border-bottom: 1px solid var(--border);
    }
    .logo {
      font-weight: 800;
      font-size: 28px;
      line-height: 1;
      letter-spacing: -0.03em;
      text-decoration: none;
      color: #fff;
    }
    .icons { display: flex; gap: 2px; align-items: center; }
    .right { justify-content: flex-end; }
    .icon {
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: 0;
      color: #fff;
      font-size: 1.15rem;
      text-decoration: none;
      cursor: pointer;
    }
    .scrim {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.55);
      z-index: 20;
    }
    .drawer {
      position: fixed; top: 50px; left: 0; bottom: 0;
      width: 220px;
      background: #121213;
      border-right: 1px solid var(--border);
      z-index: 21;
      display: flex;
      flex-direction: column;
      padding: 12px 0;
    }
    .drawer a, .drawer button {
      background: none;
      border: 0;
      color: #fff;
      text-align: left;
      padding: 14px 20px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
    }
    .modal {
      position: fixed;
      left: 50%;
      top: 56px;
      transform: translateX(-50%);
      width: min(480px, calc(100% - 24px));
      background: #121213;
      border: 1px solid var(--border);
      border-radius: 8px;
      z-index: 22;
      padding: 28px 24px 24px;
      max-height: calc(100vh - 80px);
      overflow: auto;
    }
    .modal h2 {
      text-align: center;
      font-size: 1rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin: 0 0 16px;
    }
    .modal p { color: #d7dadc; font-size: 0.9rem; line-height: 1.5; margin: 0 0 12px; }
    .aula { color: var(--muted) !important; font-size: 0.72rem !important; margin-top: 20px !important; }
    .close {
      position: absolute; top: 8px; right: 10px;
      background: none; border: 0; color: #fff; font-size: 1.6rem; cursor: pointer;
    }
  `],
})
export class AppComponent {
  auth = inject(AuthService);
  menu = false;
  help = false;
}
