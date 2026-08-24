import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-denied',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <h1>Sem acesso</h1>
      <p>Esta tela só abre para quem o token local diz ser ADMIN.</p>
      <p><a routerLink="/play">Voltar ao jogo</a></p>
      <p class="note">A API ainda aceita o token adulterado via Console (V3).</p>
    </div>
  `,
  styles: [`
    p { line-height: 1.5; color: #d7dadc; }
    a { font-weight: 800; }
  `],
})
export class DeniedComponent {}
