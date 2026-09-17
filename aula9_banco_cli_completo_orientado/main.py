# Mini banco CLI COM orientacao a objetos.
# Rode nesta pasta: python main.py
# Compare com aula9_banco_cli_completo_estruturado (mesma aplicacao so com funcoes).
# O menu so le a opcao; quem imprime resultado e o BancoService.

from models.banco import Banco
from services.banco_service import BancoService

banco = Banco()
service = BancoService(banco)

while True:
    print("\n=== Banco UC11 ===")
    print("1. Cadastrar cliente")
    print("2. Criar conta")
    print("3. Listar contas")
    print("4. Depositar")
    print("5. Sacar")
    print("6. Render (poupanca)")
    print("7. Excluir conta")
    print("0. Sair")

    opcao = input("Escolha: ").strip()

    if opcao == "1":
        nome = input("Nome: ")
        cpf = input("CPF: ")
        service.cadastrar_cliente(nome, cpf)

    elif opcao == "2":
        cpf = input("CPF do cliente: ")
        tipo = input("Tipo (p=poupanca / c=corrente): ").strip().lower()
        saldo = float(input("Saldo inicial: "))
        service.criar_conta(cpf, tipo, saldo)

    elif opcao == "3":
        service.listar_contas()

    elif opcao == "4":
        numero = input("Numero da conta: ")
        valor = float(input("Valor: "))
        service.depositar(numero, valor)

    elif opcao == "5":
        numero = input("Numero da conta: ")
        valor = float(input("Valor: "))
        service.sacar(numero, valor)

    elif opcao == "6":
        numero = input("Numero da poupanca: ")
        service.render_poupanca(numero)

    elif opcao == "7":
        numero = input("Numero da conta: ")
        service.excluir_conta(numero)

    elif opcao == "0":
        print("Ate logo!")
        break

    else:
        print("Opcao invalida.")
