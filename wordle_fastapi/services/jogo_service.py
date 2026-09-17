# Regras de aplicacao: login, sessoes em memoria e criar partida.
# A classe JogoWordle fica em models/; daqui so usamos os objetos.

import random

from models.jogo import MAX_TENTATIVAS, PALAVRAS_SECRETAS, JogoWordle

USUARIO_FIXO = "jogador"
SENHA_FIXA = "wordle123"


class JogoService:
    def __init__(self):
        self.sessoes = {}  # usuario -> JogoWordle

    def autenticar(self, usuario, senha):
        return usuario == USUARIO_FIXO and senha == SENHA_FIXA

    def login(self, usuario, senha):
        if not self.autenticar(usuario, senha):
            return None
        if usuario not in self.sessoes:
            self.sessoes[usuario] = self._nova_partida()
        return self.sessoes[usuario]

    def pegar_partida(self, usuario):
        return self.sessoes.get(usuario)

    def tentar(self, usuario, chute):
        jogo = self.pegar_partida(usuario)
        if jogo is None:
            return None
        return jogo.tentar(chute)

    def estado(self, usuario):
        jogo = self.pegar_partida(usuario)
        if jogo is None:
            return None
        return jogo.estado()

    def nova_partida(self, usuario):
        if usuario not in self.sessoes:
            return None
        self.sessoes[usuario] = self._nova_partida()
        return self.sessoes[usuario].estado()

    def _nova_partida(self):
        palavra = random.choice(PALAVRAS_SECRETAS)
        return JogoWordle(palavra, MAX_TENTATIVAS)
