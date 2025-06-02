document.addEventListener("DOMContentLoaded", function() {
  const barcodeInput = document.getElementById("barcode");
  const quantityInput = document.getElementById("quantity");
  const cartTable = document.getElementById("cart-items").getElementsByTagName("tbody")[0];
  const productNameHeader = document.getElementById("product-name");
  const unitPriceInput = document.getElementById("unit-price");
  const totalPriceInput = document.getElementById("total-price");
  const receivedInput = document.getElementById("received");
  const changeInput = document.getElementById("change");
  const subtotalValue = document.querySelector(".subtotal span");
  const discountInput = document.getElementById("discount"); // Campo de desconto
  
  let produtosNoCarrinho = [];
  let desconto = 0; // Inicializa o desconto como 0
  
  // Inicializar valores das inputs com zero (0,00)
  unitPriceInput.value = "0,00";
  totalPriceInput.value = "0,00";
  discountInput.value = "0,00";
  receivedInput.value = "0,00";
  changeInput.value = "0,00";
  subtotalValue.innerText = "R$ 0,00";
  
  barcodeInput.addEventListener("input", function() {
    if (barcodeInput.value.length === 13) { // Código de barras EAN-13
      buscarProduto(barcodeInput.value);
    }
  });
  
  function buscarProduto(codigoBarras) {
    // Simulando um banco de dados local
    const produtos = {
      "7898215151784": { nome: "Creme de Leite Piracanjuba", preco: 3.50 },
      "7899876543210": { nome: "Pacote de Arroz", preco: 6.00 },
      // Adicione outros produtos conforme necessário
    };
    
    const produto = produtos[codigoBarras];
    
    if (produto) {
      adicionarAoCarrinho(produto, codigoBarras);
    } else {
      alert("Produto não encontrado!");
    }
  }
  
  function adicionarAoCarrinho(produto, codigoBarras) {
    const quantidade = parseInt(quantityInput.value);
    const precoUnitario = produto.preco;
    const precoTotal = precoUnitario * quantidade;
    
    // Verifica se o produto já está no carrinho
    const produtoExistente = produtosNoCarrinho.find(item => item.codigoBarras === codigoBarras);
    
    if (produtoExistente) {
      // Se o produto já estiver no carrinho, só atualiza a quantidade e o preço total
      produtoExistente.quantidade += quantidade;
      produtoExistente.precoTotal = produtoExistente.preco * produtoExistente.quantidade;
    } else {
      // Caso contrário, adiciona o produto no carrinho
      produtosNoCarrinho.push({
        codigoBarras: codigoBarras,
        nome: produto.nome,
        quantidade: quantidade,
        preco: precoUnitario,
        precoTotal: precoTotal
      });
    }
    
    // Atualiza o carrinho na tela
    atualizarCarrinho();
    
    // Atualiza o cabeçalho com o nome do último produto adicionado em maiúsculas
    productNameHeader.innerText = produtosNoCarrinho[produtosNoCarrinho.length - 1].nome.toUpperCase();
    
    // Atualiza os preços
    unitPriceInput.value = formatarValor(precoUnitario);
    totalPriceInput.value = formatarValor(precoTotal);
    
    // Atualiza o subtotal
    atualizarSubtotal();
    
    // Limpa o campo de código de barras para o próximo produto
    barcodeInput.value = "";
  }
  
  function atualizarCarrinho() {
    cartTable.innerHTML = ""; // Limpa o carrinho antes de atualizar
    
    produtosNoCarrinho.forEach((produto, index) => {
      const newRow = cartTable.insertRow();
      newRow.innerHTML = `
        <td>${index + 1}</td>
        <td>${produto.codigoBarras}</td>
        <td>${produto.nome.toUpperCase()}</td> <!-- Nome do produto em maiúsculas -->
        <td>${produto.quantidade}</td>
        <td>${formatarValor(produto.preco)}</td>
        <td>${formatarValor(produto.precoTotal)}</td>
      `;
    });
  }
  
  function atualizarSubtotal() {
    let total = 0;
    produtosNoCarrinho.forEach(produto => {
      total += produto.precoTotal;
    });
    
    // Aplica o desconto
    total -= desconto;
    
    // Atualiza o subtotal com o desconto aplicado
    subtotalValue.innerText = formatarValor(total);
    
    // Atualiza o troco se já houver valor recebido
    calcularTroco();
  }
  
  // Função para formatar valores no formato brasileiro (R$ 0,00)
  function formatarValor(valor) {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  }
  
  // Função para calcular o troco
  receivedInput.addEventListener("input", function() {
    calcularTroco();
  });
  
  function calcularTroco() {
    const subtotal = parseFloat(subtotalValue.innerText.replace("R$ ", "").replace(",", "."));
    const recebido = parseFloat(receivedInput.value.replace(",", "."));
    
    if (!isNaN(recebido) && recebido >= subtotal) {
      const troco = recebido - subtotal;
      changeInput.value = formatarValor(troco);
    } else if (!isNaN(recebido) && recebido < subtotal) {
      const troco = subtotal - recebido;
      changeInput.value = `- R$ ${troco.toFixed(2).replace('.', ',')}`;
    } else {
      changeInput.value = "";
    }
  }
  
  // Função para aplicar o desconto
  discountInput.addEventListener("input", function() {
    desconto = parseFloat(discountInput.value.replace(",", ".") || 0); // Converte o valor para número, se não for válido, usa 0
    atualizarSubtotal();
  });
  
  // Formatação para manter o valor no formato 0,00 automaticamente
  [receivedInput, discountInput].forEach(input => {
    input.addEventListener("blur", function() {
      let valor = input.value.replace(",", ".");
      if (!isNaN(valor) && valor !== "") {
        input.value = formatarValor(parseFloat(valor));
      }
    });
  });
  
  // Inicializa os valores ao carregar a página
  function inicializarValores() {
    unitPriceInput.value = "0,00";
    totalPriceInput.value = "0,00";
    subtotalValue.innerText = "R$ 0,00";
  }
  
  inicializarValores();
});