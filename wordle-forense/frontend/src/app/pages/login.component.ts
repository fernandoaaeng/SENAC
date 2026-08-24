import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page login">
      <p class="kicker">Adivinhe a palavra de 5 letras.</p>
      <form (ngSubmit)="submit()">
        <label>Usuário
          <input name="username" [(ngModel)]="username" autocomplete="off" spellcheck="false" />
        </label>
        <label>Senha
          <input name="password" type="password" [(ngModel)]="password" autocomplete="current-password" />
        </label>
        <button class="btn" type="submit">Jogar</button>
        @if (error) { <p class="fail">{{ error }}</p> }
      </form>
      <p class="note">aluno1 / senha123 · aluno2 / senha456 · admin / admin123</p>
    </div>
  `,
  styles: [`
    .login { text-align: center; padding-top: 48px; }
    .kicker { font-size: 1.05rem; font-weight: 600; margin: 0 0 36px; }
    form { display: grid; gap: 8px; text-align: left; }
    .btn { width: 100%; margin-top: 12px; }
    .fail { color: #fff; margin-top: 12px; font-weight: 700; font-size: 0.85rem; }
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  username = '';
  password = '';
  error = '';

  submit() {
    this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigateByUrl('/play'),
      error: () => (this.error = 'Não foi possível entrar'),
    });
  }
}
