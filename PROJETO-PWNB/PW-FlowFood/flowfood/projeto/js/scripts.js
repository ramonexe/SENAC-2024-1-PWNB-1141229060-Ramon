document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".nav-button");
  const itemForm = document.getElementById("item-form");
  const itemTableBody = document.getElementById("item-table-body");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const closeMenuButton = document.querySelector(".close-menu");

  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("visible");
  });

  closeMenuButton.addEventListener("click", () => {
    mobileMenu.classList.remove("visible");
  });
  // Função para carregar itens do localStorage
  const loadItems = () => {
    const items = JSON.parse(localStorage.getItem("estoque")) || [];

    itemTableBody.innerHTML = ""; // Limpa a tabela

    items.forEach((item, index) => {
      const row = document.createElement("tr");

      const itemNameCell = document.createElement("td");
      itemNameCell.textContent = item.name;

      const itemQuantityCell = document.createElement("td");
      itemQuantityCell.textContent = item.quantity;

      const itemNivelCell = document.createElement("td");
      itemNivelCell.textContent = item.nivel;

      const actionsCell = document.createElement("td");

      const editButton = document.createElement("button");
      editButton.textContent = "Editar";
      editButton.className = "button-action";
      editButton.onclick = () => editItem(index);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Deletar";
      deleteButton.className = "button-action";
      deleteButton.onclick = () => deleteItem(index);

      actionsCell.appendChild(editButton);
      actionsCell.appendChild(deleteButton);

      row.appendChild(itemNameCell);
      row.appendChild(itemQuantityCell);
      row.appendChild(itemNivelCell);
      row.appendChild(actionsCell);

      itemTableBody.appendChild(row); // Adiciona a linha à tabela
    });
  };

  // Função para adicionar um item ao estoque
  itemForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const itemName = document.getElementById("item-name").value;
    const itemQuantity = parseInt(
      document.getElementById("item-quantity").value,
      10
    );
    const itemNivel = document.getElementById("item-nivel").value;

    if (isNaN(itemQuantity) || itemQuantity <= 0) {
      alert("Quantidade inválida. Por favor, insira um valor positivo.");
      return;
    }

    const items = JSON.parse(localStorage.getItem("estoque")) || [];
    items.push({ name: itemName, quantity: itemQuantity, nivel: itemNivel });

    localStorage.setItem("estoque", JSON.stringify(items));

    itemForm.reset(); // Limpa o formulário
    loadItems(); // Carrega os itens do estoque ao iniciar a página
  });

  // Função para editar um item do estoque
  const editItem = (index) => {
    const items = JSON.parse(localStorage.getItem("estoque")) || [];

    const itemName = prompt("Novo nome do item:", items[index].name);
    const itemQuantity = parseInt(
      prompt("Nova quantidade:", items[index].quantity),
      10
    );
    const itemNivel = prompt("Novo nível crítico:", items[index].nivel);

    if (itemName && !isNaN(itemQuantity, itemNivel)) {
      items[index].name = itemName;
      items[index].quantity = itemQuantity;
      items[index].nivel = itemNivel;

      localStorage.setItem("estoque", JSON.stringify(items));
      loadItems(); // Atualiza a tabela
    }
  };

  // Função para deletar um item do estoque
  const deleteItem = (index) => {
    const items = JSON.parse(localStorage.getItem("estoque")) || [];
    items.splice(index, 1);

    localStorage.setItem("estoque", JSON.stringify(items));

    loadItems();
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));

      button.classList.add("active");

      const targetId = button.getAttribute("data-target");
      const sections = document.querySelectorAll(".content-section");

      sections.forEach((section) => {
        section.classList.add("hidden");
        section.classList.remove("visible");
      });

      const targetSection = document.querySelector(`#${targetId}`);
      if (targetSection) {
        targetSection.classList.add("visible"); // deixa visivel
        targetSection.classList.remove("hidden"); // deixa escondido (Pode esconder removendo o visible também).
      }
    });
  });

  function recuperarDados() {
    const dadosString = localStorage.getItem("dadosReserva");
    const reservas = dadosString ? JSON.parse(dadosString) : [];

    const divReservasAtuais = document.querySelector(".reservas-atual");
    // Cria uma lista para cada reserva
    reservas.forEach((reserva) => {
      const divInReservasAtuais = document.createElement("div");
      divInReservasAtuais.setAttribute("class", "in-reservas-atual");

      for (const campo in reserva) {
        if (reserva.status == "Agendada") {
          const itemLista = document.createElement("p");
          itemLista.setAttribute("class", "texto-box");
          //deixando a primeira letra Maiuscula
          itemLista.innerHTML = `<strong> ${
            campo.charAt(0).toUpperCase() + campo.substring(1)
          } </strong>: ${reserva[campo]}`;

          divInReservasAtuais.appendChild(itemLista);
          divReservasAtuais.appendChild(divInReservasAtuais);
        }
      }
    });
  }

  function calculaSaldo() {
    const transactionsString = localStorage.getItem("transactions");
    const transactions = transactionsString
      ? JSON.parse(transactionsString)
      : [];
    const despesas = transactions.filter(
      (transaction) =>
        transaction.type === "despesa" && transaction.status === "Pendente"
    );
    const receitas = transactions.filter(
      (transaction) =>
        transaction.type === "receita" && transaction.status === "Pago"
    );
    const totalDespesas = despesas.reduce(
      (total, despesa) => total + despesa.value,
      0
    );
    const totalReceitas = receitas.reduce(
      (total, receita) => total + receita.value,
      0
    );
    const saldo = totalReceitas - totalDespesas;
    const pSaldo = document.querySelector(".quantia-receita-atual");
    pSaldo.textContent = `R$ ${saldo.toFixed(2)}`;
  }

  function recuperarPedidos() {
    const dadosString = localStorage.getItem("dadosPedido");
    const pedidos = dadosString ? JSON.parse(dadosString) : [];

    const divPedidosAtuais = document.querySelector(".pedidos-atual");
    // Cria uma lista para cada pedido
    pedidos.forEach((pedido) => {
      const divInPedidosAtuais = document.createElement("div");
      divInPedidosAtuais.setAttribute("class", "in-pedidos");

      for (const campo in pedido) {
        const itemLista = document.createElement("p");
        itemLista.setAttribute("class", "texto-box");
        // Deixando a primeira letra Maiuscula
        itemLista.innerHTML = `<strong>${
          campo.charAt(0).toUpperCase() + campo.substring(1)
        }</strong>: ${pedido[campo]}`;

        divInPedidosAtuais.appendChild(itemLista);
      }

      divPedidosAtuais.appendChild(divInPedidosAtuais);
    });
  }

  function recuperarEstoque() {
    const items = JSON.parse(localStorage.getItem("estoque")) || [];
    const divEstoqueAtual = document.querySelector(".estoque-atual");

    items.forEach((item) => {
      const divItem = document.createElement("div");
      divItem.setAttribute("class", "in-estoque-atual");
      const itemLista = document.createElement("p");
      itemLista.setAttribute("class", "texto-box");
      itemLista.innerHTML = `<strong>Item:</strong> ${item.name} <br> <strong>Quantidade:</strong> ${item.quantity} <br> <strong>Nível crítico:  ${item.nivel}`;
      divItem.appendChild(itemLista); // Adicione o itemLista ao divItem
      divEstoqueAtual.appendChild(divItem); // Adicione o divItem ao divEstoqueAtual
    });
  }

  recuperarDados();
  recuperarPedidos();
  calculaSaldo();
  recuperarEstoque();
});
