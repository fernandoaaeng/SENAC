# Wordle Forense

Laboratório **intencionalmente vulnerável** para aula prática de **computação forense**.

O sistema é um CRUD estilo Wordle (Angular + Quarkus + PostgreSQL, orquestrado com Docker). Os alunos exploram falhas reais (SQL Injection, IDOR, broken access control), depois reconstroem o ataque nos logs da aplicação e do banco.

> **Aviso:** este projeto **não** deve ficar exposto na internet fora do horário da aula. As vulnerabilidades são reais e exploráveis. Liberar o IP da sala na hora e revogar/desligar a instância em seguida.

O roteiro falado (tempo, o que mostrar na tela, o que perguntar à turma) está em **[ROTEIRO-APRESENTACAO.md](./ROTEIRO-APRESENTACAO.md)**.

---

## Objetivo pedagógico

1. Explorar quatro vulnerabilidades isoladas e comentadas no código.
2. Correlacionar horário da requisição (DevTools → Network) com:
   - access log do Quarkus;
   - log da aplicação (`app.log`, query concatenada);
   - log do Postgres (`log_statement=all`).
3. Entender a correção de cada falha (bind parameters, checagem de dono, JWT assinado / role no banco).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Angular 18 (standalone components) |
| Backend | Quarkus 3.15 (REST Jackson, Panache, Hibernate Validator, Lombok) |
| Banco | PostgreSQL 16 |
| Orquestração | Docker Compose |
| Deploy | scripts AWS (Security Group) e Azure (NSG), IP da sala |

Arquitetura em Docker: só a porta **80** do frontend é publicada. Backend e banco ficam na rede interna do Compose. O Nginx faz proxy de `/api` para o Quarkus.

---

## Como subir localmente

Na pasta `wordle-forense`:

```bash
docker compose up --build
```

Abra [http://localhost](http://localhost).

Contas seed (senha em **texto plano**, de propósito didático):

| Usuário | Senha | Role |
|---|---|---|
| `admin` | `admin123` | ADMIN |
| `aluno1` | `senha123` | USER |
| `aluno2` | `senha456` | USER |
| `aluno3` | `senha789` | USER |

Para parar:

```bash
docker compose down
```

O volume de dados do Postgres **não** é persistido em named volume dedicado: se precisar resetar o seed, `docker compose down -v` (apaga o volume anônimo do banco).

### Logs (rastro forense)

| Origem | Onde ver |
|---|---|
| Access log HTTP (Quarkus) | `logs/backend/access.log` (volume montado) |
| Log da aplicação + SQL Hibernate | `logs/backend/app.log` |
| Queries do Postgres | `docker compose logs db` (`log_statement=all` no stderr) |

Comandos úteis:

```bash
docker compose logs backend --tail=200
docker compose logs db --tail=200
```

No PowerShell / Git Bash, exemplos de busca:

```bash
docker compose logs db | findstr /C:"OR '1'='1"
docker compose logs backend | findstr /C:"admin/"
```

Em Linux/macOS:

```bash
docker compose logs db | grep -F "OR '1'='1"
grep -n "ACESSO ADMIN" logs/backend/app.log
grep -n "GET /api/game/" logs/backend/access.log
```

---

## Estrutura do repositório

```
wordle-forense/
├── docker-compose.yml
├── README.md                      ← este arquivo
├── ROTEIRO-APRESENTACAO.md        ← passo a passo da aula
├── db/init.sql                    ← tabelas + seed
├── backend/                       ← Quarkus
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/br/edu/forense/wordle/
│       ├── entity/                ← JPA + Lombok
│       ├── repository/            ← PanacheRepository
│       ├── service/               ← regras de negócio
│       ├── resource/              ← JAX-RS (fino)
│       ├── dto/                   ← Java records
│       ├── security/              ← token Base64, filtros
│       ├── exception/
│       └── game/                  ← avaliador Wordle
├── frontend/                      ← Angular + Nginx
├── logs/                          ← access.log / app.log em runtime
└── deploy/
    ├── aws_setup.sh
    └── azure_setup.sh
```

Padrão do backend (Quarkus): Resource → Service → Panache Repository. DTOs são records. Entidades usam Lombok (`@Getter`/`@Setter`). Segurança via `@NameBinding` (`@LoggedIn`, `@AdminOnly`).

---

## Modelo de dados

- **users**: `id`, `username`, `password` (texto plano — proposital), `email`, `role` (`USER` / `ADMIN`)
- **words**: `id`, `word` (5 letras), `difficulty`, `active`
- **game_sessions**: `id`, `user_id`, `word_id`, `status` (`IN_PROGRESS` / `WON` / `LOST`), `started_at`, `finished_at`
- **attempts**: `id`, `session_id`, `guess`, `result` (padrão `GYXXG`), `attempt_number`, `created_at`

IDs são **sequenciais** de propósito (enumeração em aula).

---

## API

| Método | Rota | Auth | Observação |
|---|---|---|---|
| POST | `/api/auth/login` | não | **V1 (SQLi)** |
| GET | `/api/words` | não | palavras ativas (sem o texto) |
| POST | `/api/game/start` | token | cria sessão |
| POST | `/api/game/{id}/guess` | token | **checa dono** (contraste com V2) |
| GET | `/api/game/{id}` | opcional | **V2 (IDOR)** — inclui a palavra-alvo |
| GET | `/api/game/my` | token | sessões do usuário |
| GET | `/api/users/{id}` | opcional | **V4 (IDOR)** |
| GET | `/api/admin/users` | role no token = ADMIN | **V3** |
| GET/POST/PUT/DELETE | `/api/admin/words[/{id}]` | idem | CRUD de palavras (V3) |

O “token” **não é JWT**. É `Base64(userId:username:role)`, **sem assinatura**, gerado em `TokenUtil`. Essa é a peça central da V3.

---

## As quatro vulnerabilidades (resumo técnico)

### V1 — SQL Injection no login

Arquivo: `AuthService.java`.

A query é concatenada:

```text
SELECT ... FROM users WHERE username = '<input>' AND password = '<input>'
```

Payloads didáticos no campo usuário:

- `admin' --` (qualquer senha)
- `' OR '1'='1` (usuário e senha)

**Correção (comentada no código, não aplicada):** Panache `find("username = ?1 and password = ?2", ...)` ou native query com `:u` / `:p`.

**Rastro:** log DEBUG da aplicação com a SQL literal; `docker compose logs db` com o mesmo texto.

### V2 — IDOR na sessão de jogo

`GET /api/game/{sessionId}` devolve a sessão **completa** (incluindo `targetWord`) sem checar o dono.

Contraste: `POST /api/game/{id}/guess` **faz** a checagem. Mesmo resource, certo vs. errado.

**Rastro:** access log com `GET /api/game/<id alheio>`.

### V3 — Escalada de privilégio (token adulterado)

O filtro `@AdminOnly` lê a `role` **de dentro do token**, sem consultar o banco. Como não há assinatura, o aluno troca `USER` por `ADMIN` no Base64.

O menu Admin no Angular também só olha o token no `localStorage` (checagem frágil de propósito). O front pode mostrar “acesso negado”, mas a API aceita o token adulterado via Console/`curl`.

**Correção:** JWT assinado (`quarkus-oidc` / SmallRye JWT) e/ou `SELECT role FROM users WHERE id = :userId`.

**Rastro:** `ACESSO ADMIN (role lida do token, NAO validada no banco)` no `app.log`; access log em `/api/admin/**`.

### V4 — IDOR no perfil

`GET /api/users/{id}` devolve username, email e role de qualquer ID. Enumeração: `/users/1`, `/users/2`, `/users/3`.

**Rastro:** access log com a sequência de IDs.

---

## Páginas do frontend

| Rota | Função |
|---|---|
| `/login` | formulário; token no `localStorage` |
| `/play` | grade 6×5 (verde / amarelo / cinza) |
| `/sessions` | lista sessões; ponto de partida da V2 |
| `/users/:id` | perfil — V4 na barra de endereço |
| `/admin` | palavras + usuários; visível se role local = ADMIN |
| `/denied` | front bloqueou `/admin` (a API pode continuar aberta) |

---

## Deploy na nuvem (só o IP da sala)

Parametrize `SALA_IP` com o IP público da rede da sala, por exemplo `200.x.x.x/32`.

### AWS

```bash
export SALA_IP=200.x.x.x/32
export SG_ID=sg-xxxxxxxx
./deploy/aws_setup.sh allow    # antes da aula
./deploy/aws_setup.sh revoke   # depois da aula
```

Na EC2 (Ubuntu): instalar Docker + Compose, copiar o projeto, `docker compose up -d --build`.

### Azure

```bash
export SALA_IP=200.x.x.x/32
export RG=nome-do-resource-group
export NSG=nome-do-nsg
./deploy/azure_setup.sh allow
./deploy/azure_setup.sh revoke
```

Não deixe a VM com a porta 80 aberta `0.0.0.0/0`.

---

## Desenvolvimento sem Docker (opcional)

Postgres precisa estar no ar (mesmo `init.sql`) e o Quarkus apontando para ele. Ajuste `quarkus.datasource.jdbc.url` em `backend/src/main/resources/application.properties`.

```bash
# backend
cd backend
./mvnw quarkus:dev    # se gerar o wrapper; senão mvn quarkus:dev

# frontend (proxy /api → localhost:8080)
cd frontend
npm install
npm start
```

O `Dockerfile` do backend usa Maven no build da imagem; não é obrigatório ter Maven na máquina host para o fluxo Docker.

---

## Exercício forense (depois de explorar)

Para cada vulnerabilidade, montar uma linha do tempo:

1. Horário da requisição no DevTools (Network).
2. Mesma URI/status no `access.log`.
3. Query ou mensagem correspondente no `app.log` e/ou no log do Postgres.

Cruzar os três é o exercício propriamente dito — não só “quebrar” o app.

---

## Licença de uso

Material didático. Uso restrito a laboratório controlado. Não reutilize este código em sistema real.
