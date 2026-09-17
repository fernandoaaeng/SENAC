# Mini banco CLI — orientacao a objetos

Mesmo banco da versao estruturada, agora com classes (`Cliente`, `Conta`, `ContaPoupanca`, `ContaCorrente`, `Banco`) e um `BancoService` que imprime as mensagens.

Compare com `banco_cli_completo_estruturado`.

## Como rodar

No terminal, **nesta pasta** (para os `import` de `models/` funcionarem):

```bash
cd banco_cli_completo_orientado
python main.py
```

O menu aparece no terminal. Digite o numero da opcao e pressione Enter.

Dados ja prontos para a aula:

- Ana, CPF `1`, conta poupanca `1001`, saldo 1000
- Bruno, CPF `2`, conta corrente `1002`, saldo 100 (limite 200)

Para sair: opcao `0`.

Nao precisa instalar bibliotecas extras — so Python 3.
