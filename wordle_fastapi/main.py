# Backend FastAPI do Wordle (Aula 10).
# Ponto de entrada oficial: uvicorn main:app --reload
# Jogo: http://localhost:8000   |   Swagger: http://localhost:8000/docs

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from services.jogo_service import JogoService

app = FastAPI(title="Wordle UC11", version="1.0.0")
service = JogoService()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginIn(BaseModel):
    usuario: str
    senha: str


class TentarIn(BaseModel):
    usuario: str
    chute: str


class NovoIn(BaseModel):
    usuario: str


@app.post("/login")
def login(dados: LoginIn):
    jogo = service.login(dados.usuario, dados.senha)
    if jogo is None:
        raise HTTPException(status_code=401, detail="Usuario ou senha invalidos.")
    return {"ok": True, "usuario": dados.usuario, "estado": jogo.estado()}


@app.post("/jogo/tentar")
def tentar(dados: TentarIn):
    resultado = service.tentar(dados.usuario, dados.chute)
    if resultado is None:
        raise HTTPException(status_code=404, detail="Usuario sem partida. Faca login.")
    return resultado


@app.get("/jogo/estado/{usuario}")
def estado(usuario: str):
    resultado = service.estado(usuario)
    if resultado is None:
        raise HTTPException(status_code=404, detail="Usuario sem partida. Faca login.")
    return resultado


@app.post("/jogo/novo")
def novo(dados: NovoIn):
    resultado = service.nova_partida(dados.usuario)
    if resultado is None:
        raise HTTPException(status_code=404, detail="Usuario sem partida. Faca login.")
    return resultado


@app.get("/")
def inicio():
    return FileResponse("static/index.html")


app.mount("/static", StaticFiles(directory="static"), name="static")
