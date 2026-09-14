# Pacote models — classes do mini banco (Passo 5).
# Separar em arquivos deixa o main.py só com a demonstração.


class Conta:
    """Classe base: titular, saldo protegido, depositar e sacar."""

    def __init__(self, titular, saldo):
        self.titular = titular
        self._saldo = saldo

    def exibir(self):
        print(f"Titular: {self.titular} | Saldo: R$ {self._saldo:.2f}")

    def depositar(self, valor):
        self._saldo += valor
        print(
            f"[{self.titular}] Depósito de R$ {valor:.2f}. "
            f"Saldo atual: R$ {self._saldo:.2f}"
        )

    def sacar(self, valor):
        if valor > 0 and valor <= self._saldo:
            self._saldo -= valor
            print(
                f"[{self.titular}] Saque de R$ {valor:.2f}. "
                f"Saldo atual: R$ {self._saldo:.2f}"
            )
        else:
            print(f"[{self.titular}] Saldo insuficiente ou valor inválido!")


class ContaPoupanca(Conta):
    """Poupança: herda tudo de Conta e ganha rendimento."""

    def __init__(self, titular, saldo, taxa_rendimento):
        super().__init__(titular, saldo)
        self.taxa_rendimento = taxa_rendimento

    def render(self):
        rendimento = self._saldo * self.taxa_rendimento
        self._saldo += rendimento
        print(
            f"[{self.titular}] Rendeu R$ {rendimento:.2f}. "
            f"Novo saldo: R$ {self._saldo:.2f}"
        )


class ContaCorrente(Conta):
    """Corrente: herda Conta, mas o saque pode usar um limite (cheque especial)."""

    def __init__(self, titular, saldo, limite):
        super().__init__(titular, saldo)
        self.limite = limite

    def sacar(self, valor):
        if valor > 0 and (self._saldo - valor) >= -self.limite:
            self._saldo -= valor
            print(
                f"[{self.titular}] Saque de R$ {valor:.2f}. "
                f"Saldo atual: R$ {self._saldo:.2f}"
            )
        else:
            print(
                f"[{self.titular}] Saldo insuficiente (limite excedido) ou valor inválido!"
            )
