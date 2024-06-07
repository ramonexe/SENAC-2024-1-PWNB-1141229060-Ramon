document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.querySelector("#pedido-form");
  const botaoAdicionar = document.querySelector("#botao-adicionar");

  // Recupera os pedidos do Local Storage
  const dadosString = localStorage.getItem("dadosPedido");
  const pedidos = dadosString ? JSON.parse(dadosString) : [];
  botaoAdicionar.addEventListener("click", gravarDados);

  const status = {
    confirmado: "Em preparo",
    pronto: "Pronto",
  };

  function formatarHorario(horario) {
    const data = new Date(horario);
    const dia = data.getDate().toString().padStart(2, "0");
    const mes = (data.getMonth() + 1).toString().padStart(2, "0");
    const ano = data.getFullYear();
    const horas = data.getHours().toString().padStart(2, "0");
    const minutos = data.getMinutes().toString().padStart(2, "0");
    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
  }

  function gravarDados() {
    const agora = new Date();
    pedidos.push({
      mesa: formulario.mesa.value,
      pedido: formulario.pedido.value,
      valor: formulario.valor.value,
      data: formatarHorario(agora),
      status: status.confirmado
    });

    localStorage.setItem("dadosPedido", JSON.stringify(pedidos));
    formulario.reset();
    recuperarDados();
  }

  function mudarStatus(index) {
    const pedidoIndex = pedidos.length - 1 - index;
    if (pedidos[pedidoIndex].status === status.confirmado) {
      pedidos[pedidoIndex].status = status.pronto;
    } else {
      pedidos[pedidoIndex].status = status.confirmado;
    }
    localStorage.setItem("dadosPedido", JSON.stringify(pedidos));
    recuperarDados();
  }

  function atualizarPedido(index) {
    const pedidoIndex = pedidos.length - 1 - index;
    const novoPedido = prompt("Novo pedido:", pedidos[pedidoIndex].pedido);
    const novoValor = prompt("Novo valor:", pedidos[pedidoIndex].valor);
    const novaMesa = prompt("Nova mesa:", pedidos[pedidoIndex].mesa);

    if (novoPedido && novoValor && novaMesa) {
      pedidos[pedidoIndex].pedido = novoPedido;
      pedidos[pedidoIndex].valor = novoValor;
      pedidos[pedidoIndex].mesa = novaMesa;
      localStorage.setItem("dadosPedido", JSON.stringify(pedidos));
      recuperarDados();
    }
  }

  function excluirPedido(index) {
    const pedidoIndex = pedidos.length - 1 - index;
    pedidos.splice(pedidoIndex, 1);
    localStorage.setItem("dadosPedido", JSON.stringify(pedidos));
    recuperarDados();
  }

  function recuperarDados() {
    const divPedidos = document.querySelector(".lista-pedidos");
    divPedidos.innerHTML = '';

    pedidos.slice().reverse().forEach((pedido, index) => {
      const divInPedidos = document.createElement("div");
      divInPedidos.setAttribute("class", "in-pedidos");

      for (const campo in pedido) {
        const itemLista = document.createElement("p");
        itemLista.setAttribute("class", "texto-box");
        itemLista.innerHTML = `<strong>${campo.charAt(0).toUpperCase() + campo.substring(1)}</strong>: ${pedido[campo]}`;
        divInPedidos.appendChild(itemLista);
      }

      const statusBola = document.createElement("span");
      statusBola.classList.add("status");
      statusBola.classList.add(pedido.status === status.confirmado ? "status-preparo" : "status-pronto");

      const botaoStatus = document.createElement("button");
      botaoStatus.textContent = "Alterar Status";
      botaoStatus.classList.add("button-action", "button-status");
      botaoStatus.addEventListener("click", () => mudarStatus(index));

      const botaoAtualizar = document.createElement("button");
      botaoAtualizar.textContent = "Atualizar";
      botaoAtualizar.classList.add("button-action", "button-update");
      botaoAtualizar.addEventListener("click", () => atualizarPedido(index));

      const botaoExcluir = document.createElement("button");
      botaoExcluir.textContent = "Excluir";
      botaoExcluir.classList.add("button-action", "button-delete");
      botaoExcluir.addEventListener("click", () => excluirPedido(index));

      divInPedidos.appendChild(statusBola);
      divInPedidos.appendChild(botaoStatus);
      divInPedidos.appendChild(botaoAtualizar);
      divInPedidos.appendChild(botaoExcluir);
      divPedidos.appendChild(divInPedidos);
    });
  }

  recuperarDados();
});
