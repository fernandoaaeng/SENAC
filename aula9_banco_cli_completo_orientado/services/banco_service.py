# O service usa o Banco e as contas e e quem fala com o usuario (print).

from models.conta import ContaPoupanca


class BancoService:
    def __init__(self, banco):
        self.banco = banco

    def cadastrar_cliente(self, nome, cpf):
        cliente = self.banco.cadastrar_cliente(nome, cpf)
        if cliente is None:
            print("CPF ja cadastrado.")
        else:
            print(f"Cliente {nome} cadastrado.")

    def criar_conta(self, cpf, tipo, saldo):
        conta = self.banco.criar_conta(cpf, tipo, saldo)
        if conta is None:
            print("Cliente nao encontrado. Cadastre o cliente primeiro.")
        else:
            print(f"Conta {conta.numero} criada para {conta.titular.nome}.")

    def listar_contas(self):
        print("\n=== Contas ===")
        if not self.banco.contas:
            print("(nenhuma conta)")
            return
        for conta in self.banco.contas.values():
            print(conta.resumo())

    def depositar(self, numero, valor):
        conta = self.banco.pegar_conta(numero)
        if conta is None:
            print("Conta nao encontrada.")
            return
        if conta.depositar(valor):
            print(
                f"[{conta.titular.nome}] Deposito de R$ {valor:.2f}. "
                f"Saldo atual: R$ {conta.saldo():.2f}"
            )
        else:
            print("Valor de deposito invalido.")

    def sacar(self, numero, valor):
        conta = self.banco.pegar_conta(numero)
        if conta is None:
            print("Conta nao encontrada.")
            return
        if conta.sacar(valor):
            print(
                f"[{conta.titular.nome}] Saque de R$ {valor:.2f}. "
                f"Saldo atual: R$ {conta.saldo():.2f}"
            )
        else:
            print(f"[{conta.titular.nome}] Saldo insuficiente ou valor invalido!")

    def render_poupanca(self, numero):
        conta = self.banco.pegar_conta(numero)
        if not isinstance(conta, ContaPoupanca):
            print("Essa conta nao e poupanca.")
            return
        rendimento = conta.render()
        print(
            f"[{conta.titular.nome}] Rendeu R$ {rendimento:.2f}. "
            f"Novo saldo: R$ {conta.saldo():.2f}"
        )

    def excluir_conta(self, numero):
        if self.banco.excluir_conta(numero):
            print(f"Conta {numero} excluida.")
        else:
            print("Conta nao encontrada.")
