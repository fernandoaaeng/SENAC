# Aula 9 — Passo 1: Classe e objeto
# Ideia: a classe é o "molde"; cada objeto (instância) tem seus próprios dados.


class Conta:
    """Representa uma conta bancária simples, com titular e saldo públicos."""

    def __init__(self, titular, saldo):
        # Atributos públicos: qualquer código pode ler e alterar direto.
        self.titular = titular
        self.saldo = saldo

    def exibir(self):
        print(f"Titular: {self.titular} | Saldo: R$ {self.saldo:.2f}")


# --- Demonstração (roda sozinha, sem input) ---
print("=== Passo 1: classe e objeto ===")

conta_ana = Conta("Ana", 1000.00)
conta_bruno = Conta("Bruno", 250.50)

print("\nContas criadas:")
conta_ana.exibir()
conta_bruno.exibir()

print("\nAlteramos só o saldo da Ana. A conta do Bruno não muda:")
conta_ana.saldo = 1500.00
conta_ana.exibir()
conta_bruno.exibir()
