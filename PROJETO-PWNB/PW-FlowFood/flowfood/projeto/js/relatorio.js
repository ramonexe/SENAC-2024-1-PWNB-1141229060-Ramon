document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById('graficoVendas').getContext('2d');

  // Obtém as transações financeiras do Local Storage
  const transactionsString = localStorage.getItem('transactions');
  const transactions = transactionsString ? JSON.parse(transactionsString) : [];

  // Calcula o total de receitas e despesas
  let totalReceita = 0;
  let totalDespesa = 0;

  transactions.forEach(transaction => {
    if (transaction.type === 'receita' && transaction.status === 'Pago') {
      totalReceita += transaction.value;
    } else if (transaction.type === 'despesa') {
      totalDespesa += transaction.value;
    }
  });

  // Exibe o total de receita e despesas na página
  document.getElementById('total-receita').textContent = totalReceita.toFixed(2);
  document.getElementById('total-despesa').textContent = totalDespesa.toFixed(2);

  // pega o localstorage de pedidos
  const dadosString = localStorage.getItem("dadosPedido");
  const pedidos = dadosString ? JSON.parse(dadosString) : [];

  // array para o total de vendas por dia do mes
  const diasNoMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(); // pega o número de dias do mês
  let vendasPorDia = Array(diasNoMes).fill(0);

  pedidos.forEach(pedido => {
    const data = new Date(pedido.data.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3"));
    const dia = data.getDate();
    if (dia <= diasNoMes) {
      vendasPorDia[dia - 1] += parseFloat(pedido.valor);
    }
  });

  const labelsDias = Array.from({ length: diasNoMes }, (_, i) => i + 1);

  const dadosVendas = {
    labels: labelsDias,
    datasets: [{
      label: 'Vendas no Mês',
      data: vendasPorDia,
      backgroundColor: '#e5940e',
      borderColor: '#bb7a10',
      borderWidth: 1
    }]
  };

  const config = {
    type: 'bar',
    data: dadosVendas,
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += 'R$ ' + context.parsed.y.toFixed(2).replace('.', ',');
              }
              return label;
            }
          }
        }
      }
    }
  };

  new Chart(ctx, config);

  let totalVendas = pedidos.reduce((total, pedido) => total + parseFloat(pedido.valor), 0);
  const pedidosAberto = pedidos.filter(pedido => pedido.status === "Em preparo").length;
  const pedidosConcluidos = pedidos.filter(pedido => pedido.status === "Pronto").length;

  document.getElementById('total-vendas').textContent = totalVendas.toFixed(2);
  document.getElementById('pedidos-aberto').textContent = pedidosAberto;
  document.getElementById('pedidos-concluidos').textContent = pedidosConcluidos;

  // preenche tabela
  const tabelaPedidos = document.getElementById('tabela-pedidos').getElementsByTagName('tbody')[0];

  pedidos.forEach(pedido => {
    const row = tabelaPedidos.insertRow();
    row.insertCell(0).textContent = pedido.mesa;
    row.insertCell(1).textContent = pedido.pedido;
    row.insertCell(2).textContent = `R$ ${parseFloat(pedido.valor).toFixed(2)}`;
    row.insertCell(3).textContent = pedido.data;
    row.insertCell(4).textContent = pedido.status;
  });

  // Registro de transações financeiras
  const transactionForm = document.getElementById('transaction-form');

  transactionForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const transactionType = document.getElementById('transaction-type').value;
    const transactionDescription = document.getElementById('transaction-description').value;
    const transactionValue = parseFloat(document.getElementById('transaction-value').value);
    const transactionDate = document.getElementById('transaction-date').value;

    // Validação dos campos
    if (!transactionDescription || !transactionValue || !transactionDate) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    // Criação do objeto de transação
    const transaction = {
      type: transactionType,
      description: transactionDescription,
      value: transactionValue,
      date: transactionDate,
      status: 'Pendente' // Define o status como pendente inicialmente
    };

    // Armazena a transação no Local Storage
    const transactionsString = localStorage.getItem('transactions');
    const transactions = transactionsString ? JSON.parse(transactionsString) : [];
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Atualiza a lista de transações na página
    updateTransactionList();

    // Limpa os campos do formulário
    transactionForm.reset();

    // Exibe uma mensagem de sucesso
    alert('Transação registrada com sucesso!');
  });

  // Função para atualizar a lista de transações na página
  function updateTransactionList() {
    const transactionsList = document.getElementById('transactions-list');
    transactionsList.innerHTML = ''; // Limpa a lista antes de atualizar
  
    const transactionsString = localStorage.getItem('transactions');
    const transactions = transactionsString ? JSON.parse(transactionsString) : [];
  
    // Variável para armazenar o total de despesas
    let totalDespesas = 0;
    // Variável para armazenar o total de receitas
    let totalReceita = 0;
  
    transactions.forEach((transaction, index) => {
      const transactionElement = document.createElement('div');
      transactionElement.classList.add('transaction');
  
      let transactionTypeText = '';
      if (transaction.type === 'receita') {
        transactionTypeText = 'Receita';
        // Se a transação for receita e estiver paga, adiciona ao total de receita
        if (transaction.status === 'Pago') {
          totalReceita += transaction.value;
        }
      } else if (transaction.type === 'despesa') {
        transactionTypeText = 'Despesa';
      }
  
      // Adiciona a classe de acordo com o status
      let statusClass = transaction.status === 'Pago' ? 'status-pago' : 'status-pendente';
      transactionElement.classList.add(statusClass);
  
      transactionElement.innerHTML = `
      <div class="transaction-type">${transactionTypeText}</div>
      <div class="transaction-description">${transaction.description}</div>
      <div class="transaction-value">Valor: R$ ${transaction.value.toFixed(2)}</div>
      <div class="transaction-date">Data: ${transaction.date}</div>
      <div class="transaction-status">Status: ${transaction.status}</div>
      <button class="toggle-status-button" data-index="${index}">Alterar Status</button>
      <button class="delete-transaction-button" data-index="${index}">Excluir</button>
    `;
  
      transactionsList.appendChild(transactionElement);
  
      // Atualiza o total de despesas se a transação for uma despesa
      if (transaction.type === 'despesa') {
        if (transaction.status === 'Pago') {
          // Se a transação for marcada como "Pago", subtraia o valor do total de despesas
          totalDespesas -= totalDespesas;
        } else {
          // Se a transação for marcada como "Pendente", adicione o valor ao total de despesas
          totalDespesas += transaction.value;
        }
      }
    });
  
    // Atualiza o total de despesas exibido na página
    document.getElementById('total-despesa').textContent = totalDespesas.toFixed(2);
    // Atualiza o total de receitas exibido na página
    document.getElementById('total-receita').textContent = totalReceita.toFixed(2);
  
    // Adiciona eventos de clique aos botões de alteração de status
    const toggleStatusButtons = document.getElementsByClassName('toggle-status-button');
    Array.from(toggleStatusButtons).forEach(button => {
      button.addEventListener('click', function () {
        const index = parseInt(this.getAttribute('data-index'));
  
        // Altera o status da transação
        if (transactions[index].status === 'Pendente') {
          transactions[index].status = 'Pago';
        } else {
          transactions[index].status = 'Pendente';
        }
  
        // Atualiza o Local Storage com a transação modificada
        localStorage.setItem('transactions', JSON.stringify(transactions));
  
        // Rechama a função para atualizar a lista de transações na página
        updateTransactionList();
      });
    });
  
    // Adiciona eventos de clique aos botões de exclusão de transação
    const deleteTransactionButtons = document.getElementsByClassName('delete-transaction-button');
    Array.from(deleteTransactionButtons).forEach(button => {
      button.addEventListener('click', function () {
        const index = parseInt(this.getAttribute('data-index'));
  
        // Remove a transação do array de transações
        transactions.splice(index, 1);
  
        // Atualiza o Local Storage sem a transação removida
        localStorage.setItem('transactions', JSON.stringify(transactions));
  
        // Rechama a função para atualizar a lista de transações na página
        updateTransactionList();
      });
    });
  
    // Adiciona um evento de clique ao botão de limpar todas as transações
    const clearTransactionsButton = document.getElementById('clear-transactions-button');
    clearTransactionsButton.addEventListener('click', function () {
      // Limpa as transações do Local Storage
      localStorage.removeItem('transactions');
      // Atualiza a lista de transações na página para refletir a remoção
      updateTransactionList();
    });
  }


  // Ao carregar a página, atualiza a lista de transações
  updateTransactionList();
});
