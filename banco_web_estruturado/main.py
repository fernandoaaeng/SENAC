# Banco web SEM classes (programacao estruturada).
# Rode nesta pasta: python -m uvicorn main:app --reload --port 8001
# Interface: http://localhost:8001   |   Swagger: http://localhost:8001/docs
#
# Compare com banco_web (porta 8000, mesmas rotas COM classes).
# Aqui o estado e dicionario global; poupanca x corrente vira if/else.

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from schemas import ClienteCreate, ContaCreate, ValorOperacao

app = FastAPI(title="Banco UC11", version="1.0.0")

# cpf -> {"nome": str, "cpf": str}
clientes = {}

# numero -> {"numero", "cpf", "tipo", "saldo", ...campos extras do tipo}
# tipo "p" = poupanca (taxa_rendimento)
# tipo "c" = corrente (limite)
contas = {}
proximo_numero = 1001


def cadastrar_cliente(nome, cpf):
    if cpf in clientes:
        return None
    cliente = {"nome": nome, "cpf": cpf}
    clientes[cpf] = cliente
    return cliente


def criar_conta(cpf, tipo, saldo):
    global proximo_numero
    if cpf not in clientes:
        return None

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
    return conta


def pegar_conta(numero):
    try:
        return contas.get(int(numero))
    except (TypeError, ValueError):
        return None


def conta_para_dict(conta):
    # Sem polimorfismo: o tipo vai no if, em vez de isinstance() nas classes.
    return {
        "numero": conta["numero"],
        "titular": clientes[conta["cpf"]]["nome"],
        "tipo": "poupanca" if conta["tipo"] == "p" else "corrente",
        "saldo": conta["saldo"],
    }


def depositar(conta, valor):
    if valor <= 0:
        return False
    # Sem encapsulamento: o saldo e um campo comum, alterado direto.
    conta["saldo"] += valor
    return True


def sacar(conta, valor):
    # Sem polimorfismo: precisa perguntar o tipo antes de decidir a regra.
    # Na versao OOP, ContaCorrente sobrescreve sacar() e o if some daqui.
    if conta["tipo"] == "c":
        permitido = valor > 0 and (conta["saldo"] - valor) >= -conta["limite"]
    else:
        permitido = valor > 0 and valor <= conta["saldo"]

    if not permitido:
        return False
    conta["saldo"] -= valor
    return True


def render_poupanca(conta):
    # Precisa perguntar o tipo. Na OOP, so ContaPoupanca tem o metodo render().
    if conta["tipo"] != "p":
        return None
    rendimento = conta["saldo"] * conta["taxa_rendimento"]
    conta["saldo"] += rendimento
    return rendimento


def excluir_conta(numero):
    conta = pegar_conta(numero)
    if conta is None:
        return False
    del contas[conta["numero"]]
    return True


def dados_iniciais():
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


def pegar_conta_ou_404(numero):
    conta = pegar_conta(numero)
    if conta is None:
        raise HTTPException(status_code=404, detail="Conta nao encontrada.")
    return conta


dados_iniciais()


@app.post("/clientes", status_code=201)
def rota_cadastrar_cliente(dados: ClienteCreate):
    cliente = cadastrar_cliente(dados.nome, dados.cpf)
    if cliente is None:
        raise HTTPException(status_code=400, detail="CPF ja cadastrado.")
    return {"nome": cliente["nome"], "cpf": cliente["cpf"]}


@app.post("/contas", status_code=201)
def rota_criar_conta(dados: ContaCreate):
    conta = criar_conta(dados.cpf, dados.tipo, dados.saldo_inicial)
    if conta is None:
        raise HTTPException(
            status_code=404,
            detail="Cliente nao encontrado. Cadastre o cliente primeiro.",
        )
    return conta_para_dict(conta)


@app.get("/contas")
def rota_listar_contas():
    return [conta_para_dict(conta) for conta in contas.values()]


@app.get("/contas/{numero}")
def rota_detalhe_conta(numero: int):
    return conta_para_dict(pegar_conta_ou_404(numero))


@app.post("/contas/{numero}/depositar")
def rota_depositar(numero: int, dados: ValorOperacao):
    conta = pegar_conta_ou_404(numero)
    if not depositar(conta, dados.valor):
        raise HTTPException(status_code=400, detail="Valor de deposito invalido.")
    return conta_para_dict(conta)


@app.post("/contas/{numero}/sacar")
def rota_sacar(numero: int, dados: ValorOperacao):
    conta = pegar_conta_ou_404(numero)
    if not sacar(conta, dados.valor):
        raise HTTPException(
            status_code=400,
            detail="Saldo insuficiente ou valor invalido!",
        )
    return conta_para_dict(conta)


@app.post("/contas/{numero}/render")
def rota_render_poupanca(numero: int):
    conta = pegar_conta_ou_404(numero)
    rendimento = render_poupanca(conta)
    if rendimento is None:
        raise HTTPException(status_code=400, detail="Essa conta nao e poupanca.")
    return {"rendimento": rendimento, **conta_para_dict(conta)}


@app.delete("/contas/{numero}")
def rota_excluir_conta(numero: int):
    if not excluir_conta(numero):
        raise HTTPException(status_code=404, detail="Conta nao encontrada.")
    return {"detail": f"Conta {numero} excluida."}


@app.get("/")
def inicio():
    return FileResponse("static/index.html")


app.mount("/static", StaticFiles(directory="static"), name="static")
