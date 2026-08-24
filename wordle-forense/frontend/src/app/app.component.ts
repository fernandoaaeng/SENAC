import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="top">
      <strong>Wordle Forense</strong>
      @if (auth.token()) {
        <nav>
          <a routerLink="/play">Jogar</a>
          <a routerLink="/sessions">Sessões</a>
          <a [routerLink]="['/users', auth.payload()?.userId]">Perfil</a>
          @if (auth.isAdmin()) {
            <a routerLink="/admin">Admin</a>
          }
          <button class="btn btn-ghost" type="button" (click)="auth.logout()">Sair</button>
        </nav>
      }
    </header>
    <router-outlet />
  `,
  styles: [`
    .top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border);
      background: var(--panel);
    }
    nav { display: flex; gap: 14px; align-items: center; }
  `],
})
export class AppComponent {
  auth = inject(AuthService);
}
