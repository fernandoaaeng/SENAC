const telaLogin = document.getElementById("tela-login");
const telaJogo = document.getElementById("tela-jogo");
const gridEl = document.getElementById("grid");
const msgLogin = document.getElementById("msg-login");
const msgJogo = document.getElementById("msg-jogo");
const statusEl = document.getElementById("status");
const chuteEl = document.getElementById("chute");

let usuario = "";

async function api(url, opcoes) {
  const resp = await fetch(url, opcoes);
  const dados = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(dados.detail || "Erro na requisicao");
  }
  return dados;
}

function desenharGrid(estado) {
  const linhas = estado.max_tentativas;
  const cols = estado.tamanho_palavra;
  gridEl.innerHTML = "";

  for (let i = 0; i < linhas; i++) {
    const linha = document.createElement("div");
    linha.className = "linha";
    linha.style.gridTemplateColumns = `repeat(${cols}, 56px)`;

    const tentativa = estado.historico[i];
    for (let j = 0; j < cols; j++) {
      const cel = document.createElement("div");
      cel.className = "celula";
      if (tentativa) {
        cel.textContent = tentativa.chute[j];
        cel.classList.add(tentativa.feedback[j]);
      }
      linha.appendChild(cel);
    }
    gridEl.appendChild(linha);
  }
}

function atualizarTela(estado) {
  desenharGrid(estado);
  chuteEl.maxLength = estado.tamanho_palavra;
  statusEl.textContent = `Tentativas restantes: ${estado.tentativas_restantes}`;

  if (estado.erro) {
    msgJogo.textContent = estado.erro;
  } else if (estado.venceu) {
    msgJogo.textContent = "Voce venceu!";
    msgJogo.style.color = "#6aaa64";
  } else if (estado.jogo_encerrado) {
    msgJogo.textContent = `Fim de jogo. A palavra era ${estado.palavra_secreta}.`;
    msgJogo.style.color = "#f87171";
  } else {
    msgJogo.textContent = "";
    msgJogo.style.color = "";
  }

  chuteEl.disabled = estado.jogo_encerrado;
}

document.getElementById("btn-login").addEventListener("click", async () => {
  msgLogin.textContent = "";
  try {
    const dados = await api("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario: document.getElementById("usuario").value.trim(),
        senha: document.getElementById("senha").value,
      }),
    });
    usuario = dados.usuario;
    telaLogin.classList.add("escondido");
    telaJogo.classList.remove("escondido");
    atualizarTela(dados.estado);
    chuteEl.focus();
  } catch (err) {
    msgLogin.textContent = err.message;
  }
});

document.getElementById("form-chute").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  try {
    const estado = await api("/jogo/tentar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, chute: chuteEl.value }),
    });
    chuteEl.value = "";
    atualizarTela(estado);
  } catch (err) {
    msgJogo.textContent = err.message;
  }
});

document.getElementById("btn-novo").addEventListener("click", async () => {
  try {
    const estado = await api("/jogo/novo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario }),
    });
    chuteEl.value = "";
    atualizarTela(estado);
    chuteEl.focus();
  } catch (err) {
    msgJogo.textContent = err.message;
  }
});
