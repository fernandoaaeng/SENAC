# Banco web — FastAPI + OOP

A mesma logica de `banco_cli_completo_orientado` (classes `Banco`, `ContaPoupanca`, `ContaCorrente`), agora atras de rotas HTTP e de uma pagina HTML.

Para comparar **sem classes**, suba tambem `banco_web_estruturado` na porta **8001**.

## 1. Abrir a pasta

```bash
cd banco_web
```

## 2. (Opcional) Ambiente virtual

```bash
python -m venv .venv
```

No PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

## 3. Instalar dependencias

```bash
python -m pip install -r requirements.txt
```

## 4. Subir o servidor

```bash
python -m uvicorn main:app --reload --port 8000
```

No navegador:

- Interface do banco: http://localhost:8000
- Swagger (testar a API): http://localhost:8000/docs

`--reload` reinicia sozinho quando voce altera o codigo. Para parar: `Ctrl + C`.

Se a porta 8000 estiver ocupada (por exemplo pelo Wordle), use outra: `--port 8002`.

## Lado a lado com a versao estruturada

Em **outro** terminal:

```bash
cd banco_web_estruturado
python -m uvicorn main:app --reload --port 8001
```

Aí voce compara:

- OOP: http://localhost:8000
- Estruturado: http://localhost:8001
