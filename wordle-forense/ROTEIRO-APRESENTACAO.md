# Roteiro de apresentação — Wordle Forense

Guia para o professor (ou aluno apresentador) **simular e mostrar** as quatro vulnerabilidades na frente da turma.

Tempo sugerido: **50–70 minutos** (exploração) + **15–20 minutos** (rastro nos logs).

Pré-requisito: `docker compose up --build` e o app em [http://localhost](http://localhost) (ou o IP da VM da sala).

> Use **só o navegador** (DevTools). `curl` é opcional, para quem quiser printar o relatório.

---

## Antes da aula (checklist)

1. Subir o Compose e testar login `aluno1` / `senha123`.
2. Confirmar que os logs existem:
   - `logs/backend/` (depois da primeira request);
   - `docker compose logs db` mostra SQL.
3. Abrir **duas janelas**: uma normal e uma anônima (V2 precisa de dois usuários).
4. Projetar a tela com DevTools já aberto (F12), aba **Network** visível.
5. Avisar: ambiente de laboratório, não atacar sistemas de terceiros.

### Ferramentas na tela

| Aba do DevTools | Para que serve |
|---|---|
| **Network** | ver URL, headers, body e timestamp |
| **Console** | `atob` / `btoa` / `fetch` |
| **Application** (Chrome) ou **Storage** (Firefox) | editar `localStorage.token` |

---

## Abertura (3–5 min)

**Fale:** “Isto é um Wordle de mentira com falhas de verdade. Vocês vão autenticar sem senha, ler o jogo de outro aluno, virar admin sem o banco mudar, e enumerar perfis só incrementando o ID. Depois vamos ao log e montar a linha do tempo.”

**Mostre:** tela de login e as contas seed no README (sem ainda explorar).

**Pergunte:** “Onde vocês acham que a evidência de um ataque aparece primeiro: no HTML, na API, ou no banco?”

---

## V1 — SQL Injection no login (~10 min)

### O que mostrar no código (se houver tempo)

Arquivo `backend/.../service/AuthService.java`: concatenação da SQL. Comente a versão **corrigida** que está no Javadoc (não está ligada).

### Simulação (navegador)

1. Abrir `/login`. Antes de enviar, abrir **Network** e filtrar `login`.
2. Usuário: `admin' --`  
   Senha: `123` (qualquer coisa).
3. Clicar em **Entrar**.
4. Resultado esperado: entra como **admin**, menu **Admin** aparece.

**Mostre no Network:** o JSON do body com o payload. Status 200.

**No quadro, escreva a query resultante:**

```sql
SELECT id, username, password, role FROM users
WHERE username = 'admin' --' AND password = '123'
```

O `--` comenta o resto. A senha deixa de importar.

### Variante (1 min)

Logout. Usuário e senha: `' OR '1'='1`  
Explica precedência de `AND`/`OR` se a turma já viu SQL.

### Rastro (fazer na hora ou deixar para o bloco final)

```bash
docker compose logs db --tail=80
```

Procurar a linha com `admin' --` ou `OR '1'='1`.

Também em `logs/backend/app.log`: `V1 login SQL concatenada`.

**Frase de fechamento:** “O log do Postgres é a prova mais forte: a query **literal** com o payload. Por isso a senha está em texto plano neste lab — no mundo real isso seria ainda mais grave, e mesmo com hash o SQLi de bypass já basta.”

---

## V2 — IDOR na sessão (~12 min)

### Preparação

1. **Janela A:** login `aluno1` / `senha123`.
2. Jogar: **Nova partida**, um ou dois chutes (não precisa ganhar).
3. Network: anotar o `id` de `POST /api/game/start` **ou** ir em **Sessões** e ver o ID na tabela.
4. Clicar em “abrir detalhe API” e **mostrar `targetWord`** na resposta (já é IDOR se outro usuário fizer o mesmo GET — ainda estamos no dono).

### Contraste (importante)

Ainda como aluno1, mostre no Network um `POST .../guess`. Diga: “Este endpoint **confere o dono**. O GET da sessão **não confere**. Mesma feature, dois códigos.”

Opcional: abrir `GameResource` / `GameService` — `guess` vs `getSession`.

### Simulação do IDOR

1. **Janela anônima (B):** login `aluno2` / `senha456`.
2. Console:

```js
fetch('/api/game/ID_DO_ALUNO1')
  .then(r => r.json())
  .then(console.log)
```

(Substitua `ID_DO_ALUNO1`. O interceptor do Angular **não** entra neste `fetch` se você esquecer o header — então use o token do aluno2:)

```js
fetch('/api/game/ID_DO_ALUNO1', {
  headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
}).then(r => r.json()).then(console.log)
```

3. Resultado esperado: JSON com `targetWord` e as tentativas do **aluno1**.

**Pergunte:** “Por que o ID 1, 2, 3 facilita? O que mudaria com UUID?”

### Rastro

Access log: `GET /api/game/<id>` no horário da janela B.

---

## V3 — Token adulterado (admin) (~15 min)

Esta é a falha mais conceitual. Vá devagar.

### Ideia em uma frase

“O backend pergunta ao **token** se você é admin. O token é um Base64 que **vocês** controlam. Ninguém assinou isso.”

### Simulação

1. Logout se estiver como admin. Login **`aluno1`**.
2. Application → Local Storage → chave `token`. Copiar o valor.
3. Console:

```js
atob("COLE_O_TOKEN")
```

Esperado: algo como `2:aluno1:USER` (o id pode variar).

4. Recodificar:

```js
btoa("2:aluno1:ADMIN")
```

Use o **mesmo** `userId` e `username` que o `atob` mostrou; só a role muda.

5. **Opção A (visual):** colar o novo valor no `localStorage` → recarregar. O link **Admin** deve aparecer. Entrar em `/admin` e listar usuários / palavras.

6. **Opção B (API, mesmo com o front bloqueando):** sem mexer no storage, no Console:

```js
fetch('/api/admin/users', {
  headers: { Authorization: 'Bearer ' + btoa("2:aluno1:ADMIN") }
}).then(r => r.json()).then(console.log)
```

Mostre a lista completa (`admin`, `aluno1`, `aluno2`…).

7. **Contraste do front:** em outra aba, token original de aluno1, acessar `/admin` → tela **Acesso negado**. Diga: “UI não é controle de acesso. A API é.”

`curl` opcional (Git Bash / WSL):

```bash
TOKEN=$(echo -n "2:aluno1:ADMIN" | base64)
curl -s -H "Authorization: Bearer $TOKEN" http://localhost/api/admin/users
```

No Windows PowerShell o Base64 pode inserir quebra de linha; prefira o Console do navegador na demo.

### Rastro

`app.log`: `ACESSO ADMIN (role lida do token, NAO validada no banco)`.  
Access log: `GET /api/admin/users`.

**Correção a falar:** assinar JWT **e** reler `role` no banco pelo `userId`. Uma das duas sozinha ainda deixa buraco se mal implementada; o lab mostra a pior combinação (sem assinatura + role no cliente).

---

## V4 — IDOR de perfil (~5 min)

1. Logado (qualquer usuário), ir em **Perfil** (URL `/users/<seu id>`).
2. Na **barra de endereço**, trocar para `/users/1`, `/users/2`, `/users/3`.
3. Resultado: email e role de todo mundo, **sem** virar admin.

**Mostre Network:** `GET /api/users/2` 200.

**Ligue com a V3:** “A V3 desbloqueia a lista inteira de uma vez. A V4 é a mesma classe de erro (falta de autorização), acessível até para quem não adulterou o token.”

---

## Bloco forense — linha do tempo (~15 min)

Não pule este bloco: é o objetivo da disciplina.

### Procedimento na tela

1. Pedir para um aluno dizer o **horário** de um clique (Network → Timing / coluna Time).
2. Abrir `logs/backend/access.log` (ou `docker compose logs backend`).
3. Achar o mesmo método + URI + status.
4. Abrir log do Postgres e achar a SQL da V1 no mesmo minuto.
5. Montar no quadro:

| Hora | Ação | Evidência |
|---|---|---|
| 09:12:03 | POST `/api/auth/login` payload SQLi | `app.log` + `db` |
| 09:14:10 | GET `/api/game/7` com token aluno2 | access.log |
| 09:16:02 | GET `/api/admin/users` | app.log `ACESSO ADMIN` |
| 09:17:40 | GET `/api/users/1` … `/3` | access.log enumeração |

### Comandos prontos para projetar

```bash
docker compose logs db --tail=300
docker compose logs backend --tail=300
```

Procurar:

- payload de login;
- `GET /api/game/`;
- `ACESSO ADMIN` ou `/api/admin/`;
- `GET /api/users/`.

---

## Encerramento (3 min)

Recapitule em quatro linhas:

1. **V1** — nunca concatenar SQL; parâmetros.
2. **V2/V4** — autorização no **recurso** (dono ou papel), não só autenticação.
3. **V3** — não confiar em dado que o cliente manda; assinar e/ou revalidar no banco.
4. **Forense** — access log + app + banco, mesmo relógio, mesma história.

**Lembrete operacional:** revogar SG/NSG (`deploy/aws_setup.sh revoke` ou Azure equivalente) e desligar a VM.

---

## Plano B (se algo falhar na hora)

| Problema | O que fazer |
|---|---|
| Compose ainda buildando | ter um `docker compose up` pronto 10 min antes |
| Login SQLi não entra | conferir aspas: `admin' --` (espaço depois de `--` ajuda em alguns parsers) |
| `btoa` gera token “errado” | o id no `atob` tem que ser o mesmo; não inventar `1:aluno1:ADMIN` se o id for `2` |
| `fetch` 401 | faltou `Authorization: Bearer ...` |
| Sem arquivo em `logs/backend` | o volume só aparece após o container gravar; force um login e atualize a pasta |
| Postgres sem SQL no log | `docker compose logs db` (stderr), não o volume `logs/postgres` |

---

## Ordem na lousa (resumo para o apresentador)

```
V1  form login  →  Network body  →  log SQL
V2  duas janelas  →  GET sessão alheia  →  targetWord
V3  atob / btoa  →  /api/admin/users  →  front denied vs API ok
V4  /users/1 /2 /3
Forense  cruzar horários
```