# Banco web — FastAPI estruturado (sem classes)

Mesmas rotas, mesmo JSON e o **mesmo** front-end de `banco_web`. A diferenca e so o codigo: dicionarios globais e `if` de tipo, em vez de classes e heranca.

Suba junto com `banco_web` (porta 8000) para comparar na aula.

## 1. Abrir a pasta

```bash
cd banco_web_estruturado
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

## 4. Subir o servidor (porta 8001)

A porta **8001** evita conflito com a versao OOP (8000).

```bash
python -m uvicorn main:app --reload --port 8001
```

No navegador:

- Interface do banco: http://localhost:8001
- Swagger (testar a API): http://localhost:8001/docs

`--reload` reinicia sozinho quando voce altera o codigo. Para parar: `Ctrl + C`.

## Lado a lado com a versao OOP

Em **outro** terminal:

```bash
cd banco_web
python -m uvicorn main:app --reload --port 8000
```

Aí voce compara:

- OOP: http://localhost:8000
- Estruturado: http://localhost:8001
