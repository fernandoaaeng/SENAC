async function tratarResposta(resp) {
  const data = await resp.json();
  if (!resp.ok) {
    const detalhe = typeof data.detail === "string"
      ? data.detail
      : "Nao foi possivel concluir a operacao.";
    alert(detalhe);
    return null;
  }
  return data;
}

async function carregarContas() {
  const resp = await fetch("/contas");
  const contas = await tratarResposta(resp);
  if (!contas) return;

  const corpo = document.getElementById("lista-contas");
  corpo.innerHTML = "";

  contas.forEach((conta) => {
    const tr = document.createElement("tr");
    const renderBtn = conta.tipo === "poupanca"
      ? `<button class="btn-render" type="button" data-acao="render" data-numero="${conta.numero}">Render</button>`
      : "";

    tr.innerHTML = `
      <td>${conta.numero}</td>
      <td>${conta.titular}</td>
      <td>${conta.tipo}</td>
      <td>R$ ${Number(conta.saldo).toFixed(2)}</td>
      <td>
        <div class="acoes">
          <button class="btn-depositar" type="button" data-acao="depositar" data-numero="${conta.numero}">Depositar</button>
          <button class="btn-sacar" type="button" data-acao="sacar" data-numero="${conta.numero}">Sacar</button>
          ${renderBtn}
          <button class="btn-excluir" type="button" data-acao="excluir" data-numero="${conta.numero}">Excluir</button>
        </div>
      </td>
    `;
    corpo.appendChild(tr);
  });
}

async function cadastrarCliente(evento) {
  evento.preventDefault();
  const resp = await fetch("/clientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: document.getElementById("cliente-nome").value,
      cpf: document.getElementById("cliente-cpf").value,
    }),
  });
  const ok = await tratarResposta(resp);
  if (ok) {
    evento.target.reset();
    await carregarContas();
  }
}

async function criarConta(evento) {
  evento.preventDefault();
  const resp = await fetch("/contas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cpf: document.getElementById("conta-cpf").value,
      tipo: document.getElementById("conta-tipo").value,
      saldo_inicial: Number(document.getElementById("conta-saldo").value),
    }),
  });
  const ok = await tratarResposta(resp);
  if (ok) {
    evento.target.reset();
    await carregarContas();
  }
}

async function depositar(numero) {
  const bruto = prompt("Valor do deposito:");
  if (bruto === null) return;
  const resp = await fetch(`/contas/${numero}/depositar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ valor: Number(bruto) }),
  });
  if (await tratarResposta(resp)) await carregarContas();
}

async function sacar(numero) {
  const bruto = prompt("Valor do saque:");
  if (bruto === null) return;
  const resp = await fetch(`/contas/${numero}/sacar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ valor: Number(bruto) }),
  });
  if (await tratarResposta(resp)) await carregarContas();
}

async function renderPoupanca(numero) {
  const resp = await fetch(`/contas/${numero}/render`, { method: "POST" });
  if (await tratarResposta(resp)) await carregarContas();
}

async function excluirConta(numero) {
  const resp = await fetch(`/contas/${numero}`, { method: "DELETE" });
  if (await tratarResposta(resp)) await carregarContas();
}

document.getElementById("form-cliente").addEventListener("submit", cadastrarCliente);
document.getElementById("form-conta").addEventListener("submit", criarConta);

document.getElementById("lista-contas").addEventListener("click", (evento) => {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) return;
  const numero = botao.dataset.numero;
  const acao = botao.dataset.acao;
  if (acao === "depositar") depositar(numero);
  if (acao === "sacar") sacar(numero);
  if (acao === "render") renderPoupanca(numero);
  if (acao === "excluir") excluirConta(numero);
});

carregarContas();
