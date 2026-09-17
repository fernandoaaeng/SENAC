# Corpos de requisicao. A validacao HTTP fica aqui; a regra de negocio fica nas funcoes.

from typing import Literal

from pydantic import BaseModel


class ClienteCreate(BaseModel):
    nome: str
    cpf: str


class ContaCreate(BaseModel):
    cpf: str
    tipo: Literal["p", "c"]
    saldo_inicial: float


class ValorOperacao(BaseModel):
    valor: float
