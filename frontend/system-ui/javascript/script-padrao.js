document.addEventListener("DOMContentLoaded", function () {
    const barcodeInput = document.getElementById("barcode");
    const quantityInput = document.getElementById("quantity");
    const cartTable = document.getElementById("cart-items").getElementsByTagName("tbody")[0];
    const productNameHeader = document.getElementById("product-name");
    const unitPriceInput = document.getElementById("unit-price");
    const totalPriceInput = document.getElementById("total-price");
    const receivedInput = document.getElementById("received");
    const changeInput = document.getElementById("change");
    const subtotalValue = document.querySelector(".subtotal span");
    const discountInput = document.getElementById("discount");

    let produtosNoCarrinho = [];
    let desconto = 0;

    unitPriceInput.value = "0,00";
    totalPriceInput.value = "0,00";
    discountInput.value = "0,00";
    changeInput.value = "0,00";
    subtotalValue.innerText = "R$ 0,00";

    barcodeInput.addEventListener("input", function () {
        if (barcodeInput.value.length === 13) {
            buscarProduto(barcodeInput.value);
        }
    });

    function buscarProduto(codigoBarras) {
        fetch(`https://sheetdb.io/api/v1/el4kpaq4ezsdc/search?Código de Barras=${codigoBarras}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const produto = data[0];
                    const nomeProduto = produto["Descrição"];
                    const precoTexto = produto["Preço Venda Varejo"];
                    const precoProduto = parseFloat(precoTexto.replace(',', '.')) || 0;

                    productNameHeader.innerText = nomeProduto.toUpperCase(); // Atualiza nome do produto
                    adicionarAoCarrinho(produto, nomeProduto, precoProduto);
                } else {
                    alert("Produto não encontrado!");
                }
            })
            .catch(error => {
                console.error("Erro ao buscar o produto:", error);
                alert("Erro ao buscar o produto.");
            });
    }

    function adicionarAoCarrinho(produto, nomeProduto, precoProduto) {
        const quantidade = parseInt(quantityInput.value) || 1;
        const precoUnitario = parseFloat(precoProduto);
        const precoTotal = precoUnitario * quantidade;

        const produtoExistente = produtosNoCarrinho.find(item => item.codigoBarras === produto["Código de Barras"]);

        if (produtoExistente) {
            produtoExistente.quantidade += quantidade;
            produtoExistente.precoTotal = produtoExistente.preco * produtoExistente.quantidade;
        } else {
            produtosNoCarrinho.push({
                codigoBarras: produto["Código de Barras"],
                nome: nomeProduto,
                quantidade: quantidade,
                preco: precoUnitario,
                precoTotal: precoTotal
            });
        }

        atualizarCarrinho();
        unitPriceInput.value = formatarValor(precoUnitario);
        totalPriceInput.value = formatarValor(precoTotal);
        atualizarSubtotal();
        barcodeInput.value = "";
    }

    function atualizarCarrinho() {
        cartTable.innerHTML = "";
        produtosNoCarrinho.forEach((produto, index) => {
            const newRow = cartTable.insertRow();
            newRow.innerHTML = `
                <td>${index + 1}</td>
                <td>${produto.codigoBarras}</td>
                <td>${produto.nome.toUpperCase()}</td>
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
        total -= desconto;
        subtotalValue.innerText = formatarValor(total);
        calcularTroco();
    }

    function formatarValor(valor) {
        return `R$ ${valor.toFixed(2).replace('.', ',')}`;
    }

    receivedInput.addEventListener("input", function () {
        calcularTroco();
    });

    function calcularTroco() {
        const subtotal = parseFloat(subtotalValue.innerText.replace("R$ ", "").replace(",", ".")) || 0;
        const recebido = parseFloat(receivedInput.value.replace("R$ ", "").replace(",", ".")) || 0;

        if (!isNaN(recebido)) {
            const troco = recebido - subtotal;
            changeInput.value = troco >= 0
                ? formatarValor(troco)
                : `- R$ ${Math.abs(troco).toFixed(2).replace('.', ',')}`;
        } else {
            changeInput.value = "";
        }
    }

    discountInput.addEventListener("input", function () {
        desconto = parseFloat(discountInput.value.replace(",", ".") || 0);
        atualizarSubtotal();
    });

    [receivedInput, discountInput].forEach(input => {
    input.addEventListener("blur", function () {
        let valor = input.value.replace("R$ ", "").replace(",", ".").trim();

        if (valor === "") return; // Se estiver vazio, não faz nada

        let numero = parseFloat(valor);
        if (!isNaN(numero)) {
            input.value = formatarValor(numero); // Formata corretamente
        }
    });
});
  
    document.addEventListener("keydown", (event) => {
        const inputs = [receivedInput, changeInput];
        const currentIndex = inputs.indexOf(document.activeElement);

        if (event.key === "Enter") {
            event.preventDefault(); // impede pular com enter
        }

        if (event.key === "ArrowDown" && currentIndex !== -1) {
            const nextIndex = (currentIndex + 1) % inputs.length;
            inputs[nextIndex].focus();
            event.preventDefault();
        }

        if (event.key === "ArrowUp" && currentIndex !== -1) {
            const prevIndex = (currentIndex - 1 + inputs.length) % inputs.length;
            inputs[prevIndex].focus();
            event.preventDefault();
        }
    });

    function inicializarValores() {
        unitPriceInput.value = "0,00";
        totalPriceInput.value = "0,00";
        subtotalValue.innerText = "R$ 0,00";
    }

    inicializarValores();
});
