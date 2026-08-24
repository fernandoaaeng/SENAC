import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-denied',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="card">
      <h1>Acesso negado</h1>
      <p>O front bloqueou /admin porque a role do token local não é ADMIN.</p>
      <p class="warn">
        Objetivo da aula (V3): a API continua aceitando a chamada se o token adulterado
        for enviado direto (Console/fetch ou curl), mesmo com esta tela.
      </p>
      <p><a routerLink="/play">Voltar ao jogo</a></p>
    </div>
  `,
})
export class DeniedComponent {}
