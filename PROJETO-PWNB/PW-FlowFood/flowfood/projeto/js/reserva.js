document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.querySelector("#reserva-form");

  // Recupera as reservas do Local Storage
  const dadosString = localStorage.getItem("dadosReserva");
  const reservas = dadosString ? JSON.parse(dadosString) : [];
  formulario.addEventListener("submit", gravarDados);

  const status = {
    agendada: "Agendada",
    confirmada: "Confirmada",
    cancelada: "Cancelada",
    concluida: "Concluída",
  };

  function formatarHorario(horario) {
    const data = new Date(horario);
    const dia = data.getDate().toString().padStart(2, "0");
    const mes = (data.getMonth() + 1).toString().padStart(2, "0"); // Os meses começam do 0 em JavaScript
    const ano = data.getFullYear();
    const horas = data.getHours().toString().padStart(2, "0");
    const minutos = data.getMinutes().toString().padStart(2, "0");
    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
  }
  function gravarDados(event) {
    event.preventDefault();
    //atualiza a lista de reservas capturadas com os dados da nova reserva
    reservas.push({
      id: Date.now(), //uma maneira de criar um id unico para cada reserva, utilizado para controle na função de atualizar a reserva
      cliente: formulario.cliente.value,
      mesa: formulario.mesa.value,
      quantidade: formulario.quantidade.value,
      data: formatarHorario(formulario.data.value),
      status: status.agendada,
    });

    localStorage.setItem("dadosReserva", JSON.stringify(reservas));
    const reservasAgendadas = document.querySelector(
      ".reserva-agendada .reservas-container"
    );
    reservasAgendadas.innerHTML = "";
    recuperarDados();
    //limpando o formulario
    formulario.reset();
  }

  function recuperarDados() {
    //localStorage.clear();
    //recuperando as divs da pagina
    const reservasAgendadas = document.querySelector(
      ".reserva-agendada .reservas-container"
    );
    const reservasConfirmadas = document.querySelector(
      ".reserva-confirmada .reservas-container"
    );
    const reservasConcluidas = document.querySelector(
      ".reserva-concluida .reservas-container"
    );
    const reservasCanceladas = document.querySelector(
      ".reserva-cancelada .reservas-container"
    );

    // Aqui limpo as divs para quando o status mudar ela saia da div antiga e vá para a nova
    reservasAgendadas.innerHTML = "";
    reservasConfirmadas.innerHTML = "";
    reservasConcluidas.innerHTML = "";
    reservasCanceladas.innerHTML = "";

    //esse sort divide a hora e a data, e ordena a data em ordem decrescente e a hora em ordem crescente
    reservas
      .sort((a, b) => {
        const [dataA, horaA] = a.data.split(" ");
        const [dataB, horaB] = b.data.split(" ");

        const comparaData = new Date(dataB) - new Date(dataA);

        if (comparaData === 0) {
          // Se as datas forem iguais, compara as horas delas
          return horaA.localeCompare(horaB);
        } else {
          // Se são diferentes, retorna a comparação das datas
          return comparaData;
        }
      })
      .forEach((reserva) => {
        const divInReservas = document.createElement("div");
        divInReservas.setAttribute("class", "in-reservas");

        for (const campo in reserva) {
          // Cria um paragrafo para cada campo da reserva
          const itemLista = document.createElement("p");
          itemLista.setAttribute("class", "texto-box");

          //deixando a primeira letra Maiuscula
          itemLista.innerHTML = `<strong> ${
            campo.charAt(0).toUpperCase() + campo.substring(1)
          } </strong>: ${reserva[campo]}`;
          divInReservas.appendChild(itemLista);
        }

        const botaoStatus = document.createElement("button");
        botaoStatus.setAttribute("id", "botao-atualizar");
        botaoStatus.textContent = "Atualizar Reserva";
        botaoStatus.addEventListener("click", () =>
          atualizaReserva(reserva.id)
        );
        divInReservas.appendChild(botaoStatus);
        const botaoEditar = document.createElement("button");
        botaoEditar.setAttribute("id", "botao-editar");
        botaoEditar.textContent = "Editar";
        botaoEditar.addEventListener("click", () => editarReserva(reserva.id));
        divInReservas.appendChild(botaoEditar);
        //verificando qual o status das reservas para distribuir nas divs corretas
        switch (reserva.status) {
          case "Agendada":
            reservasAgendadas.appendChild(divInReservas);
            break;

          case "Confirmada":
            reservasConfirmadas.appendChild(divInReservas);
            break;

          case "Concluída":
            reservasConcluidas.appendChild(divInReservas);
            break;

          case "Cancelada":
            reservasCanceladas.appendChild(divInReservas);
            break;
        }
      });
    calcularReservas();
  }

  function atualizaReserva(id) {
    // Usado para calcular o indice da reserva
    const indiceReserva = reservas.findIndex((reserva) => reserva.id === id);

    // Muda o status da reserva com base no status atual(o padrão é agendada)
    switch (reservas[indiceReserva].status) {
      case status.agendada:
        reservas[indiceReserva].status = status.confirmada;
        break;
      case status.confirmada:
        reservas[indiceReserva].status = status.concluida;
        break;
      case status.concluida:
        reservas[indiceReserva].status = status.cancelada;
        break;
      default:
        reservas[indiceReserva].status = status.agendada;
    }

    // Salva o array reservas atualizado no Local Storage
    localStorage.setItem("dadosReserva", JSON.stringify(reservas));

    // Atualiza a exibição das reservas
    recuperarDados();
  }

  function calcularReservas() {
    const totalReservas = reservas.length;
    const totalAgendadas = reservas.filter(
      (reserva) => reserva.status === status.agendada
    ).length;
    const totalConfirmadas = reservas.filter(
      (reserva) => reserva.status === status.confirmada
    ).length;
    const totalConcluidas = reservas.filter(
      (reserva) => reserva.status === status.concluida
    ).length;
    const totalCanceladas = reservas.filter(
      (reserva) => reserva.status === status.cancelada
    ).length;

    const totalReservasElemento = document.querySelector(
      "#quantia-reservas-total"
    );
    const totalAgendadasElemento = document.querySelector(
      "#quantia-reservas-agendadas"
    );
    const totalConfirmadasElemento = document.querySelector(
      "#quantia-reservas-confirmadas"
    );
    const totalConcluidasElemento = document.querySelector(
      "#quantia-reservas-concluidas"
    );
    const totalCanceladasElemento = document.querySelector(
      "#quantia-reservas-canceladas"
    );

    totalReservasElemento.textContent = totalReservas;
    totalAgendadasElemento.textContent = totalAgendadas;
    totalConfirmadasElemento.textContent = totalConfirmadas;
    totalConcluidasElemento.textContent = totalConcluidas;
    totalCanceladasElemento.textContent = totalCanceladas;
  }

  // Cria um formulário para o usuário inserir os novos dados da reserva

  function editarReserva(idReserva) {
    // Encontra o índice da reserva com o id especificado
    const indiceReserva = reservas.findIndex(
      (reserva) => reserva.id === idReserva
    );

    // Se a reserva não foi encontrada, retorna
    if (indiceReserva === -1) return;

    const novaMesa = prompt(
      `Digite a nova mesa para a reserva: ${reservas[indiceReserva].id}`,
      reservas[indiceReserva].mesa
    );
    const novaQtd = prompt(
      `Digite a nova quantidade de pessoas para a reserva: ${reservas[indiceReserva].id}`,
      reservas[indiceReserva].quantidade
    );
    const novaDataString = prompt(
      `Digite a nova data para a reserva: ${reservas[indiceReserva].id}`,
      moment(reservas[indiceReserva].data).format("DD/MM/YYYY")
    );
    const novaHoraString = prompt(
      `Digite a nova hora para a reserva: ${reservas[indiceReserva].id}`,
      moment(reservas[indiceReserva].data).format("HH:mm")
    );

   const novaDataformatada = convertDateFormat(novaDataString);
    const novaDataHoraString = `${novaDataformatada}T${novaHoraString}`;
    const novaDataHora = formatarHorario(new Date(novaDataHoraString));

    if (novaMesa && novaQtd && novaMesa && novaDataString && novaHoraString) {
      reservas[indiceReserva].mesa = novaMesa;
      reservas[indiceReserva].quantidade = novaQtd;
      reservas[indiceReserva].data = novaDataHora;
      localStorage.setItem("dadosReserva", JSON.stringify(reservas));
      recuperarDados();
    }
  }

  function convertDateFormat(data) {
    var partes = data.split("/");
    return partes[2] + "-" + partes[1] + "-" + partes[0];
}

  recuperarDados();
});
