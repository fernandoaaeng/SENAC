# Mini banco CLI SEM orientacao a objetos (programacao estruturada).
# Rode nesta pasta: python main.py
#
# Compare com aula9_banco_cli_completo_orientado (mesma aplicacao COM classes).
# Aqui os dados sao dicionarios e o comportamento diferente (poupanca x corrente)
# aparece como if/else espalhado nas funcoes.

# cpf -> {"nome": str, "cpf": str}
clientes = {}

# numero -> {"numero", "cpf", "tipo", "saldo", ...campos extras do tipo}
# tipo "p" = poupanca (taxa_rendimento)
# tipo "c" = corrente (limite)
contas = {}
proximo_numero = 1001


def cadastrar_cliente(nome, cpf):
    if cpf in clientes:
        print("CPF ja cadastrado.")
        return
    clientes[cpf] = {"nome": nome, "cpf": cpf}
    print(f"Cliente {nome} cadastrado.")


def criar_conta(cpf, tipo, saldo):
    global proximo_numero
    if cpf not in clientes:
        print("Cliente nao encontrado. Cadastre o cliente primeiro.")
        return

    numero = proximo_numero
    proximo_numero += 1

    # Sem heranca: os dois tipos viram o mesmo dicionario, com chaves diferentes.
    if tipo == "p":
        conta = {
            "numero": numero,
            "cpf": cpf,
            "tipo": "p",
            "saldo": saldo,
            "taxa_rendimento": 0.01,
        }
    else:
        conta = {
            "numero": numero,
            "cpf": cpf,
            "tipo": "c",
            "saldo": saldo,
            "limite": 200.0,
        }

    contas[numero] = conta
    print(f"Conta {numero} criada para {clientes[cpf]['nome']}.")


def pegar_conta(numero):
    try:
        return contas.get(int(numero))
    except ValueError:
        return None


def nome_titular(conta):
    return clientes[conta["cpf"]]["nome"]


def resumo_conta(conta):
    # Sem polimorfismo: o texto e montado na mao para qualquer tipo.
    return (
        f"Conta {conta['numero']} | Titular: {nome_titular(conta)} | "
        f"Saldo: R$ {conta['saldo']:.2f}"
    )


def listar_contas():
    print("\n=== Contas ===")
    if not contas:
        print("(nenhuma conta)")
        return
    for conta in contas.values():
        print(resumo_conta(conta))


def depositar(numero, valor):
    conta = pegar_conta(numero)
    if conta is None:
        print("Conta nao encontrada.")
        return
    if valor <= 0:
        print("Valor de deposito invalido.")
        return
    # Sem encapsulamento: o saldo e um campo comum, alterado direto.
    conta["saldo"] += valor
    print(
        f"[{nome_titular(conta)}] Deposito de R$ {valor:.2f}. "
        f"Saldo atual: R$ {conta['saldo']:.2f}"
    )


def sacar(numero, valor):
    conta = pegar_conta(numero)
    if conta is None:
        print("Conta nao encontrada.")
        return

    # Sem polimorfismo: cada tipo de conta exige um if.
    # Na versao OO, cada classe implementa o proprio sacar().
    if conta["tipo"] == "c":
        permitido = valor > 0 and (conta["saldo"] - valor) >= -conta["limite"]
    else:
        permitido = valor > 0 and valor <= conta["saldo"]

    if permitido:
        conta["saldo"] -= valor
        print(
            f"[{nome_titular(conta)}] Saque de R$ {valor:.2f}. "
            f"Saldo atual: R$ {conta['saldo']:.2f}"
        )
    else:
        print(f"[{nome_titular(conta)}] Saldo insuficiente ou valor invalido!")


def render_poupanca(numero):
    conta = pegar_conta(numero)
    # Precisa perguntar o tipo. Na OO, so poupanca tem o metodo render().
    if conta is None or conta["tipo"] != "p":
        print("Essa conta nao e poupanca.")
        return
    rendimento = conta["saldo"] * conta["taxa_rendimento"]
    conta["saldo"] += rendimento
    print(
        f"[{nome_titular(conta)}] Rendeu R$ {rendimento:.2f}. "
        f"Novo saldo: R$ {conta['saldo']:.2f}"
    )


def excluir_conta(numero):
    conta = pegar_conta(numero)
    if conta is None:
        print("Conta nao encontrada.")
        return
    del contas[conta["numero"]]
    print(f"Conta {numero} excluida.")


def dados_iniciais():
    # Duas contas prontas para testar na aula (Ana=1001, Bruno=1002).
    # Insercao direta para nao imprimir "cadastrado" na largada.
    global proximo_numero
    clientes["1"] = {"nome": "Ana", "cpf": "1"}
    clientes["2"] = {"nome": "Bruno", "cpf": "2"}
    contas[1001] = {
        "numero": 1001,
        "cpf": "1",
        "tipo": "p",
        "saldo": 1000,
        "taxa_rendimento": 0.01,
    }
    contas[1002] = {
        "numero": 1002,
        "cpf": "2",
        "tipo": "c",
        "saldo": 100,
        "limite": 200.0,
    }
    proximo_numero = 1003


dados_iniciais()

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
        cadastrar_cliente(nome, cpf)

    elif opcao == "2":
        cpf = input("CPF do cliente: ")
        tipo = input("Tipo (p=poupanca / c=corrente): ").strip().lower()
        saldo = float(input("Saldo inicial: "))
        criar_conta(cpf, tipo, saldo)

    elif opcao == "3":
        listar_contas()

    elif opcao == "4":
        numero = input("Numero da conta: ")
        valor = float(input("Valor: "))
        depositar(numero, valor)

    elif opcao == "5":
        numero = input("Numero da conta: ")
        valor = float(input("Valor: "))
        sacar(numero, valor)

    elif opcao == "6":
        numero = input("Numero da poupanca: ")
        render_poupanca(numero)

    elif opcao == "7":
        numero = input("Numero da conta: ")
        excluir_conta(numero)

    elif opcao == "0":
        print("Ate logo!")
        break

    else:
        print("Opcao invalida.")
