# Banco web — FastAPI. Rode nesta pasta: uvicorn main:app --reload
# Jogo: http://localhost:8000   |   Swagger: http://localhost:8000/docs
# As rotas so encapam os metodos das classes de models/. A logica nao foi reescrita.

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from models.banco import Banco
from models.conta import ContaCorrente, ContaPoupanca
from schemas import ClienteCreate, ContaCreate, ValorOperacao

app = FastAPI(title="Banco UC11", version="1.0.0")

# Uma unica instancia em memoria, a mesma classe Banco do CLI orientado.
banco = Banco()


def conta_para_dict(conta):
    if isinstance(conta, ContaPoupanca):
        tipo = "poupanca"
    elif isinstance(conta, ContaCorrente):
        tipo = "corrente"
    else:
        tipo = "conta"
    return {
        "numero": conta.numero,
        "titular": conta.titular.nome,
        "tipo": tipo,
        "saldo": conta.saldo(),
    }


def pegar_conta_ou_404(numero):
    # Rota fina: so chama Banco.pegar_conta(); 404 se nao achar.
    conta = banco.pegar_conta(numero)
    if conta is None:
        raise HTTPException(status_code=404, detail="Conta nao encontrada.")
    return conta


@app.post("/clientes", status_code=201)
def cadastrar_cliente(dados: ClienteCreate):
    # Rota fina: so chama banco.cadastrar_cliente(), a logica ja existe.
    cliente = banco.cadastrar_cliente(dados.nome, dados.cpf)
    if cliente is None:
        raise HTTPException(status_code=400, detail="CPF ja cadastrado.")
    return {"nome": cliente.nome, "cpf": cliente.cpf}


@app.post("/contas", status_code=201)
def criar_conta(dados: ContaCreate):
    # Rota fina: so chama banco.criar_conta(); o tipo p/c ja e decidido na classe.
    conta = banco.criar_conta(dados.cpf, dados.tipo, dados.saldo_inicial)
    if conta is None:
        raise HTTPException(
            status_code=404,
            detail="Cliente nao encontrado. Cadastre o cliente primeiro.",
        )
    return conta_para_dict(conta)


@app.get("/contas")
def listar_contas():
    # Rota fina: equivalente ao item 3 do menu CLI (listar contas).
    return [conta_para_dict(conta) for conta in banco.contas.values()]


@app.get("/contas/{numero}")
def detalhe_conta(numero: int):
    conta = pegar_conta_ou_404(numero)
    return conta_para_dict(conta)


@app.post("/contas/{numero}/depositar")
def depositar(numero: int, dados: ValorOperacao):
    # Rota fina: so chama conta.depositar(), a logica ja existe.
    conta = pegar_conta_ou_404(numero)
    if not conta.depositar(dados.valor):
        raise HTTPException(status_code=400, detail="Valor de deposito invalido.")
    return conta_para_dict(conta)


@app.post("/contas/{numero}/sacar")
def sacar(numero: int, dados: ValorOperacao):
    # Rota fina: so chama conta.sacar(); poupanca e corrente ja se comportam diferente.
    conta = pegar_conta_ou_404(numero)
    if not conta.sacar(dados.valor):
        raise HTTPException(
            status_code=400,
            detail="Saldo insuficiente ou valor invalido!",
        )
    return conta_para_dict(conta)


@app.post("/contas/{numero}/render")
def render_poupanca(numero: int):
    # Rota fina: so chama conta.render() se for ContaPoupanca (polimorfismo + isinstance).
    conta = pegar_conta_ou_404(numero)
    if not isinstance(conta, ContaPoupanca):
        raise HTTPException(status_code=400, detail="Essa conta nao e poupanca.")
    rendimento = conta.render()
    return {"rendimento": rendimento, **conta_para_dict(conta)}


@app.delete("/contas/{numero}")
def excluir_conta(numero: int):
    # Rota fina: so chama banco.excluir_conta(), a logica ja existe.
    if not banco.excluir_conta(numero):
        raise HTTPException(status_code=404, detail="Conta nao encontrada.")
    return {"detail": f"Conta {numero} excluida."}


@app.get("/")
def inicio():
    return FileResponse("static/index.html")


app.mount("/static", StaticFiles(directory="static"), name="static")
