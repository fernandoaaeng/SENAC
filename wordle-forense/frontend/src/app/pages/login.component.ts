import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card">
      <h1>Entrar</h1>
      <p class="muted">Aula de computação forense — aplicação intencionalmente vulnerável.</p>
      <p class="warn">V1: o login monta SQL por concatenação. Experimente usuário <code>admin' --</code>.</p>
      <form (ngSubmit)="submit()">
        <label>Usuário<br /><input name="username" [(ngModel)]="username" autocomplete="username" /></label>
        <label>Senha<br /><input name="password" type="password" [(ngModel)]="password" autocomplete="current-password" /></label>
        <button class="btn" type="submit">Entrar</button>
        @if (error) { <p class="err">{{ error }}</p> }
      </form>
      <p class="muted">Contas seed: admin/admin123 · aluno1/senha123 · aluno2/senha456</p>
    </div>
  `,
  styles: [`
    form { display: grid; gap: 12px; margin-top: 16px; }
    .err { color: var(--danger); }
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
      error: () => (this.error = 'Falha no login'),
    });
  }
}
