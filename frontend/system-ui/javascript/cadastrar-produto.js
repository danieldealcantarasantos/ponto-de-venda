document.addEventListener("DOMContentLoaded", () => {
  main();
});

async function main() {
  const apiUrl = "https://sheetdb.io/api/v1/jknvrfra3a3hd";
  const localStorageKey = "produtosCadastrados";
  const novosProdutosKey = "novosProdutos";
  const form = document.getElementById("produto-form");
  const categoriaSelect = document.getElementById('categoriaProduto');
const subcategoriaSelect = document.getElementById('subcategoriaProduto');

categoriaSelect.addEventListener('input', function() {
  const valor = categoriaSelect.value.trim().toLowerCase();
  const campoNovaCategoria = document.getElementById('nova-categoria-container');
  campoNovaCategoria.style.display = valor === 'adicionar categoria' ? 'block' : 'none';
});

subcategoriaSelect.addEventListener('input', function() {
  const valor = subcategoriaSelect.value.trim().toLowerCase();
  const campoNovaSubcategoria = document.getElementById('nova-subcategoria-container');
  campoNovaSubcategoria.style.display = valor === 'adicionar subcategoria' ? 'block' : 'none';
});
  const codigoBarrasInput = document.getElementById("codigoBarras");
  const descricaoInput = document.getElementById("descricao");
  const precoVendaInput = document.getElementById("precoVendaVarejo");
  
  let dadosProdutos = [];
  
  // Carrega dados da API ou do localStorage
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    dadosProdutos = data;
    localStorage.setItem(localStorageKey, JSON.stringify(data));
  } catch (error) {
    console.error("❌️ Erro ao buscar da API. Usando localStorage:", error);
    const localData = localStorage.getItem(localStorageKey);
    if (localData) {
      dadosProdutos = JSON.parse(localData);
    }
  }
  
  // Preenche datalists
  const categorias = [...new Set(dadosProdutos.map(item => item["Categoria do Produto"]).filter(Boolean))];
  const subcategorias = [...new Set(dadosProdutos.map(item => item["Subcategoria do Produto"]).filter(Boolean))];
  preencherDatalist("listaCategorias", categorias);
  preencherDatalist("listaSubcategorias", subcategorias);
  
  await carregarOpcoes();
  
  document.getElementById("enviarNovosProdutos").addEventListener("click", async () => {
    const novosProdutos = JSON.parse(localStorage.getItem(novosProdutosKey)) || [];
    
    if (novosProdutos.length === 0) {
      alert("️❕️ Não há novos produtos para enviar.");
      return;
    }
    
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: novosProdutos }),
      });
      
      if (response.ok) {
        alert("☑️ Novos produtos cadastrados no banco de dados com sucesso!");
        const produtosCadastrados = JSON.parse(localStorage.getItem(localStorageKey)) || [];
        const produtosAtualizados = produtosCadastrados.concat(novosProdutos);
        localStorage.setItem(localStorageKey, JSON.stringify(produtosAtualizados));
        localStorage.removeItem(novosProdutosKey);
      } else {
        alert("❌️ Erro ao enviar novos produtos.");
      }
    } catch (error) {
      console.error("❌️ Erro ao enviar novos produtos:", error);
    }
  });
  
  function preencherDatalist(id, items) {
    const datalist = document.getElementById(id);
    datalist.innerHTML = "";
    items.forEach(item => {
      const option = document.createElement("option");
      option.value = item;
      datalist.appendChild(option);
    });
  }
  
  const novaCategoriaInput = document.createElement("input");
  novaCategoriaInput.type = "text";
  novaCategoriaInput.id = "novaCategoria";
  novaCategoriaInput.placeholder = "Digite a nova categoria";
  novaCategoriaInput.style.display = "none";
  
  const novaSubcategoriaInput = document.createElement("input");
  novaSubcategoriaInput.type = "text";
  novaSubcategoriaInput.id = "novaSubcategoria";
  novaSubcategoriaInput.placeholder = "Digite a nova subcategoria";
  novaSubcategoriaInput.style.display = "none";
  
  categoriaSelect.parentNode.appendChild(novaCategoriaInput);
  subcategoriaSelect.parentNode.appendChild(novaSubcategoriaInput);
  
  categoriaSelect.addEventListener("change", () => {
    novaCategoriaInput.style.display = categoriaSelect.value === "nova" ? "block" : "none";
  });
  
  subcategoriaSelect.addEventListener("change", () => {
    novaSubcategoriaInput.style.display = subcategoriaSelect.value === "nova" ? "block" : "none";
  });
  
  codigoBarrasInput.setAttribute("maxlength", "13");
  codigoBarrasInput.setAttribute("inputmode", "numeric");
  codigoBarrasInput.setAttribute("pattern", "\\d{13}");
  
  
  async function carregarOpcoes() {
    const data = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    
    const categorias = [...new Set(data.map(item => item["Categoria do Produto"]).filter(Boolean))];
    const subcategorias = [...new Set(data.map(item => item["Subcategoria do Produto"]).filter(Boolean))];
    
    categoriaSelect.innerHTML = "<option value=''>Selecione uma categoria</option>";
    categorias.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categoriaSelect.appendChild(option);
    });
    categoriaSelect.innerHTML += "<option value='nova'>+ Nova categoria</option>";
    
    subcategoriaSelect.innerHTML = "<option value=''>Selecione uma subcategoria</option>";
    subcategorias.forEach(sub => {
      const option = document.createElement("option");
      option.value = sub;
      option.textContent = sub;
      subcategoriaSelect.appendChild(option);
    });
    subcategoriaSelect.innerHTML += "<option value='nova'>+ Nova subcategoria</option>";
  }
  
  await carregarOpcoes();
  
  codigoBarrasInput.addEventListener("input", async () => {
    const codigo = codigoBarrasInput.value.trim();
    
    const existente = document.getElementById("produto-existente");
    const container = document.getElementById("produtoExistenteContainer");
    
    if (codigo.length === 13 && /^\d{13}$/.test(codigo)) {
      const produtosLocal = JSON.parse(localStorage.getItem(localStorageKey)) || [];
      const produto = produtosLocal.find(p => p["Código de Barras"] === codigo);
      
      if (produto) {
        // Mostra aviso
        if (!existente) {
          const aviso = document.createElement("div");
          aviso.id = "produto-existente";
          aviso.textContent = "⚠️ Produto já cadastrado com esse código de barras!";
          aviso.style.color = "red";
          aviso.style.marginTop = "5px";
          codigoBarrasInput.parentNode.appendChild(aviso);
        }
        
        container.innerHTML = `
          <table border="1" style="margin-top: 10px; border-collapse: collapse;">
            <thead style="background-color: #f2f2f2;">
              <tr>
                <th>Código de Barras</th>
                <th>Descrição</th>
                <th>Preço Venda</th>
                <th>Categoria</th>
                <th>Subcategoria</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${produto["Código de Barras"]}</td>
                <td>${produto["Descrição"]}</td>
                <td>${produto["Preço Venda Varejo"]}</td>
                <td>${produto["Categoria do Produto"]}</td>
                <td>${produto["Subcategoria do Produto"]}</td>
              </tr>
            </tbody>
          </table>
        `;
      } else {
        if (existente) existente.remove();
        container.innerHTML = "";
      }
    } else {
      if (existente) existente.remove();
      container.innerHTML = "";
    }
  });
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const codigo = codigoBarrasInput.value.trim();
    const descricao = descricaoInput.value.trim().toUpperCase();
  const precoVenda = precoVendaInput.value.trim().replace(".", ",");
    const categoria = categoriaSelect.value === "nova" ? novaCategoriaInput.value.trim() : categoriaSelect.value.trim();
    const subcategoria = subcategoriaSelect.value === "nova" ? novaSubcategoriaInput.value.trim() : subcategoriaSelect.value.trim();
    
    const produtosLocal = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    const produtoExistente = produtosLocal.find(p => p["Código de Barras"] === codigo);
    
    if (produtoExistente) {
      alert("⚠️ Produto já cadastrado com esse código de barras!");
      return; // Impede o envio
    }
    
    const dataCadastro = new Date().toLocaleDateString("pt-BR"); // Ex: 01/06/2025
    
    const novoProduto = {
      "Código de Barras": codigo,
"Tipo de Produto": "Produto",
"Descrição": descricao,
"Preço de Custo": 0,
"Preço Venda Varejo": precoVenda,
"Preço Venda Atacado": 0,
"Quantidade Mínima Atacado": 0,
"Unidade": "Unidade",
"Ativo": "Sim",
"Categoria do Produto": categoria,
"Subcategoria do Produto": subcategoria,
"Movimenta Estoque": "Não",
"Estoque mínimo": 0,
"Quantidade em Estoque": 0,
"Categoria PDV": categoria,
"Botão PDV": descricao,
"Categoria na Loja Virtual": categoria,
"Subcategoria na Loja Virtual": subcategoria,
"Nome na Loja Virtual": "",
"Preço De": 0,
"Preço Por": 0,
"Altura (cm)": 0,
"Largura (cm)": 0,
"Profundidade (cm)": 0,
"Peso (Kg)": 0,
"Descrição do Produto": "",
"Garantia": "",
"Itens Inclusos": "",
"Especificações": "",
    };
    
    // Armazena localmente
    const novosProdutos = JSON.parse(localStorage.getItem(novosProdutosKey)) || [];
    novosProdutos.push(novoProduto);
    localStorage.setItem(novosProdutosKey, JSON.stringify(novosProdutos));
    
    // Atualiza o localStorage principal
    produtosLocal.push(novoProduto);
    localStorage.setItem(localStorageKey, JSON.stringify(produtosLocal));
    
    // Limpa o formulário ou mostra sucesso
    form.reset();
    alert("✅ Produto colocado na fila para envio. Não se esqueça de clicar em “Enviar novos produtos”.");
  });
}