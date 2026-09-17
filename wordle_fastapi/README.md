# Wordle UC11 (Aula 10) — FastAPI

Jogo estilo Wordle com backend FastAPI e frontend HTML/CSS/JS.
Login de demonstracao: **jogador** / **wordle123**

## 1. Abrir a pasta do projeto

No terminal, entre na pasta do projeto:

```bash
cd wordle_fastapi
```

## 2. (Opcional) Criar e ativar um ambiente virtual (venv)

O venv isola as bibliotecas deste projeto do restante do Python da maquina.

**Criar o venv:**

```bash
python -m venv .venv
```

**Ativar o venv:**

- PowerShell (Windows):

```powershell
.\.venv\Scripts\Activate.ps1
```

Se o PowerShell bloquear o script, rode uma vez:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

- Prompt de comando (cmd):

```bat
.venv\Scripts\activate.bat
```

Quando o venv estiver ativo, o terminal mostra `(.venv)` no inicio da linha.

Para sair do venv depois: `deactivate`

## 3. Instalar as dependencias

Com o terminal ainda na pasta `wordle_fastapi` (e de preferencia com o venv ativo):

```bash
python -m pip install -r requirements.txt
```

Isso instala FastAPI e Uvicorn.

## 4. Subir a aplicacao

```bash
python -m uvicorn main:app --reload
```

- Jogo: http://localhost:8000
- Swagger (documentacao): http://localhost:8000/docs

`--reload` reinicia o servidor sozinho quando voce altera o codigo (util na aula).

Para parar: `Ctrl + C` no terminal.

## Modificacao da aula

Em `models/jogo.py`:

- `MAX_TENTATIVAS` — numero de tentativas
- `PALAVRAS_SECRETAS` — banco de palavras

Reinicie o servidor (ou espere o `--reload`) e clique em **Nova partida**.
