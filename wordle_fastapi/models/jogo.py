# Constantes visiveis para os alunos alterarem em aula.
MAX_TENTATIVAS = 6  # MODIFIQUE AQUI: numero de tentativas permitidas
PALAVRAS_SECRETAS = ["PISTA", "TESTE", "CLASS", "PYTHO", "SENHA"]  # MODIFIQUE AQUI: banco de palavras


def _avaliar_chute(palavra_secreta, chute):
    """Compara letra a letra no padrao Wordle (trata letras repetidas)."""
    tamanho = len(palavra_secreta)
    feedback = ["ausente"] * tamanho
    restantes = {}

    for i, letra in enumerate(palavra_secreta):
        if chute[i] == letra:
            feedback[i] = "correto"
        else:
            restantes[letra] = restantes.get(letra, 0) + 1

    for i, letra in enumerate(chute):
        if feedback[i] == "correto":
            continue
        if restantes.get(letra, 0) > 0:
            feedback[i] = "presente"
            restantes[letra] -= 1

    return feedback


class JogoWordle:
    """Guarda o estado de UMA partida (POO: objeto com dados + comportamento)."""

    def __init__(self, palavra_secreta, max_tentativas=MAX_TENTATIVAS):
        self.palavra_secreta = palavra_secreta.upper()
        self.max_tentativas = max_tentativas
        self.tentativas_feitas = []
        self.jogo_encerrado = False
        self.venceu = False

    def tentar(self, chute):
        chute = (chute or "").strip().upper()

        if self.jogo_encerrado:
            resultado = self.estado()
            resultado["erro"] = "O jogo ja terminou. Inicie uma nova partida."
            return resultado

        if len(chute) != len(self.palavra_secreta):
            resultado = self.estado()
            resultado["erro"] = (
                f"O chute deve ter {len(self.palavra_secreta)} letras."
            )
            return resultado

        feedback = _avaliar_chute(self.palavra_secreta, chute)
        self.tentativas_feitas.append({"chute": chute, "feedback": feedback})

        if chute == self.palavra_secreta:
            self.venceu = True
            self.jogo_encerrado = True
        elif len(self.tentativas_feitas) >= self.max_tentativas:
            self.jogo_encerrado = True

        resultado = self.estado()
        resultado["feedback"] = feedback
        return resultado

    def estado(self):
        dados = {
            "tentativas_restantes": self.max_tentativas - len(self.tentativas_feitas),
            "max_tentativas": self.max_tentativas,
            "tamanho_palavra": len(self.palavra_secreta),
            "historico": self.tentativas_feitas,
            "jogo_encerrado": self.jogo_encerrado,
            "venceu": self.venceu,
        }
        if self.jogo_encerrado:
            dados["palavra_secreta"] = self.palavra_secreta
        return dados
