# Aula 9 — Passo 2: Encapsulamento
# Ideia: proteger o saldo (_saldo) e só alterar por métodos (depositar / sacar).


class Conta:
    """Conta com saldo protegido. Operações passam pelos métodos."""

    def __init__(self, titular, saldo):
        self.titular = titular
        # Convenção Python: um underline = "protegido" (não use direto de fora).
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


# --- Demonstração ---
print("=== Passo 2: encapsulamento ===")

conta = Conta("Ana", 1000.00)
conta.exibir()

print("\nDepósito:")
conta.depositar(200.00)

print("\nSaque válido:")
conta.sacar(150.00)

print("\nSaque inválido (maior que o saldo):")
conta.sacar(5000.00)

print("\nSaldo final (o saque inválido não alterou nada):")
conta.exibir()
