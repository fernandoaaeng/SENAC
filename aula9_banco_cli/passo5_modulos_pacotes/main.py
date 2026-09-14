# Aula 9 — Passo 5: módulos e pacotes
# Ideia: as classes ficam em models/conta.py; aqui só importamos e demonstramos.
# Execute a partir desta pasta: python main.py

from models.conta import Conta, ContaPoupanca, ContaCorrente

print("=== Passo 5: módulos e pacotes ===")

contas = [
    ContaPoupanca("Ana", 1000.00, 0.01),
    ContaCorrente("Bruno", 100.00, 200.00),
    Conta("Carla", 50.00),
]

# Polimorfismo: o laço chama exibir() em cada item sem perguntar o tipo.
print("\nExibindo todas as contas com o mesmo for:")
for conta in contas:
    conta.exibir()
