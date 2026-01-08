document.addEventListener("DOMContentLoaded", () => {
  main();
});

async function main() {
  const apiUrl = "https://sheetdb.io/api/v1/el5c93ushcmhe";
  const localStorageKey = "produtosCadastrados";
  const novosProdutosKey = "novosProdutos";
  const produtosAtualizadosKey = "produtosAtualizados";
  const categoriasKey = "Categorias";
  const subcategoriasKey = "Subcategorias";
  const codigosKey = "CodigosDeBarras";
  const ultimaAtualizacaoKey = "ultimaAtualizacaoProdutos";

  const form = document.getElementById("produto-form");
  const categoriaSelect = document.getElementById('categoriaProduto');
  const subcategoriaSelect = document.getElementById('subcategoriaProduto');
  const codigoBarrasInput = document.getElementById("codigoBarras");
  const descricaoInput = document.getElementById("descricao");
  const precoVendaInput = document.getElementById("precoVendaVarejo");

  // Mostrar inputs extras ao escolher "Adicionar"
  categoriaSelect.addEventListener('input', () => {
    const valor = categoriaSelect.value.trim().toLowerCase();
    document.getElementById('nova-categoria-container').style.display = valor === 'adicionar categoria' ? 'block' : 'none';
  });

  subcategoriaSelect.addEventListener('input', () => {
    const valor = subcategoriaSelect.value.trim().toLowerCase();
    document.getElementById('nova-subcategoria-container').style.display = valor === 'adicionar subcategoria' ? 'block' : 'none';
  });

  // Carrega produtos da API ou localStorage para economia de requisições
  async function carregarProdutosAPIouLocal() {
    const ultimaAtt = parseInt(localStorage.getItem(ultimaAtualizacaoKey) || "0");
    const agora = Date.now();
    const passouTempo = (agora - ultimaAtt) > (30 * 60 * 1000); // 30 minutos

    if (!localStorage.getItem(localStorageKey) || passouTempo) {
      try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        localStorage.setItem(localStorageKey, JSON.stringify(data));
        localStorage.setItem(ultimaAtualizacaoKey, agora);
        atualizarListasLocais(data);
        return data;
      } catch (error) {
        console.error("Erro ao buscar da API, usando localStorage:", error);
        const localData = localStorage.getItem(localStorageKey);
        if (localData) return JSON.parse(localData);
        return [];
      }
    } else {
      const localData = localStorage.getItem(localStorageKey);
      if (localData) return JSON.parse(localData);
      return [];
    }
  }

  // Atualiza listas locais (categorias, subcategorias, códigos)
  function atualizarListasLocais(produtos) {
    const codigos = [...new Set(produtos.map(p => p["Código de Barras"]).filter(Boolean))];
    const categorias = [...new Set(produtos.map(p => p["Categoria do Produto"]).filter(Boolean))];
    const subcategorias = [...new Set(produtos.map(p => p["Subcategoria do Produto"]).filter(Boolean))];

    localStorage.setItem(codigosKey, JSON.stringify(codigos));
    localStorage.setItem(categoriasKey, JSON.stringify(categorias));
    localStorage.setItem(subcategoriasKey, JSON.stringify(subcategorias));
  }

  // Preenche datalist para sugestões
  function preencherDatalist(id, items) {
    const datalist = document.getElementById(id);
    datalist.innerHTML = "";
    items.forEach(item => {
      const option = document.createElement("option");
      option.value = item;
      datalist.appendChild(option);
    });
  }

  // Carrega opções nos selects e nas listas de sugestões
  async function carregarOpcoes() {
    const categorias = JSON.parse(localStorage.getItem(categoriasKey)) || [];
    const subcategorias = JSON.parse(localStorage.getItem(subcategoriasKey)) || [];

    categoriaSelect.innerHTML = "<option value=''>Selecione uma categoria</option>";
    categorias.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categoriaSelect.appendChild(option);
    });

    subcategoriaSelect.innerHTML = "<option value=''>Selecione uma subcategoria</option>";
    subcategorias.forEach(sub => {
      const option = document.createElement("option");
      option.value = sub;
      option.textContent = sub;
      subcategoriaSelect.appendChild(option);
    });

    criarSugestoes("categoriaProduto", "sugestoesCategoria", [...categorias, "Adicionar Categoria"]);
    criarSugestoes("subcategoriaProduto", "sugestoesSubcategoria", [...subcategorias, "Adicionar Subcategoria"]);
  }

  // Cria sugestões customizadas para inputs
  function criarSugestoes(inputId, sugestoesId, lista) {
  const input = document.getElementById(inputId);
  const ul = document.getElementById(sugestoesId);
  const wrapper = input.parentNode;
  
  input.addEventListener("input", () => {
    const valor = input.value.toLowerCase().trim();
    ul.innerHTML = "";
    
    let filtradas;
    
    // Palavra-chave para mostrar todas
    if (valor === "todas") {
      filtradas = lista;
    } else {
      filtradas = lista.filter(item => item.toLowerCase().includes(valor));
    }
    
    if (filtradas.length === 0) {
      ul.style.display = "none";
      return;
    }
    
    filtradas.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      
      if (item.toLowerCase().includes("adicionar")) {
        li.style.fontWeight = "bold";
        li.style.color = "#007BFF";
      }
      
      li.addEventListener("click", () => {
        input.value = item;
        ul.style.display = "none";
        
        if (item.toLowerCase() === "adicionar categoria") {
          const novaCategoria = document.getElementById('novaCategoria');
          document.getElementById('nova-categoria-container').style.display = 'block';
          setTimeout(() => novaCategoria.focus(), 100);
        } else if (item.toLowerCase() === "adicionar subcategoria") {
          const novaSubcategoria = document.getElementById('novaSubcategoria');
          document.getElementById('nova-subcategoria-container').style.display = 'block';
          setTimeout(() => novaSubcategoria.focus(), 100);
        }
      });
      
      ul.appendChild(li);
    });
    
    ul.style.display = "block";
  });
  
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) {
      ul.style.display = "none";
    }
  });
}

  // Notificações toast
  function notificarToast(icon, title, position = 'top', timer = 3000) {
    Swal.fire({
      toast: true,
      icon,
      title,
      position,
      timer,
      showConfirmButton: false,
      timerProgressBar: true,
    });
  }

  // Notificações popup
  function notificarPopup(icon, title, text) {
    Swal.fire({
      icon,
      title,
      text,
      showConfirmButton: true,
    });
  }

  function limparAvisos() {
    const avisoAntigo = document.getElementById("produto-existente");
    if (avisoAntigo) avisoAntigo.remove();
  }

  // Carrega produtos inicialmente
  let dadosProdutos = await carregarProdutosAPIouLocal();
  atualizarListasLocais(dadosProdutos);

  const categorias = JSON.parse(localStorage.getItem(categoriasKey)) || [];
  const subcategorias = JSON.parse(localStorage.getItem(subcategoriasKey)) || [];
  preencherDatalist("listaCategorias", categorias);
  preencherDatalist("listaSubcategorias", subcategorias);

  await carregarOpcoes();

  // Configurações input código de barras
  codigoBarrasInput.setAttribute("maxlength", "13");
  codigoBarrasInput.setAttribute("inputmode", "numeric");
  codigoBarrasInput.setAttribute("pattern", "\\d{13}");

  codigoBarrasInput.addEventListener("input", () => {
    const codigo = codigoBarrasInput.value.trim();
    const codigosExistentes = JSON.parse(localStorage.getItem(codigosKey)) || [];
    const produtoExiste = codigosExistentes.includes(codigo);

    limparAvisos();

    const botaoCadastrar = document.getElementById("botaoCadastrar");
    const botaoAtualizar = document.getElementById("botaoAtualizar");

    if (codigo.length === 13 && /^\d{13}$/.test(codigo)) {
      if (produtoExiste) {
        notificarToast('info', 'Este produto já foi cadastrado!');

        const produtosLocal = JSON.parse(localStorage.getItem(localStorageKey)) || [];
        const produto = produtosLocal.find(p => p["Código de Barras"] === codigo);

        if (produto) {
          descricaoInput.value = produto["Descrição"];
          precoVendaInput.value = produto["Preço Venda Varejo"].replace(",", ".");
          categoriaSelect.value = produto["Categoria do Produto"];
          subcategoriaSelect.value = produto["Subcategoria do Produto"];

          botaoCadastrar.style.display = "none";
          botaoAtualizar.style.display = "inline-block";

          const container = document.getElementById("produtoExistenteContainer");
          container.innerHTML = `
  <style>
    .tabela-wrapper {
      max-width: 100%;
      overflow-x: auto;
      margin-top: 15px;
    }

    .tabela-produto {
      width: 100%;
      min-width: 600px;
      border-collapse: collapse;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      font-family: Arial, sans-serif;
      border: 2px solid #ddd;
    }

    .tabela-produto thead {
      background-color: #007BFF;
      color: white;
      border-bottom: 2px solid #ddd;

    }

    .tabela-produto th, .tabela-produto td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    .tabela-produto tbody tr:hover {
      background-color: #f1f9ff;
    }

    .tabela-produto td:first-child {
      font-weight: bold;
      color: #333;
    }
  </style>

  <div class="tabela-wrapper">
    <table class="tabela-produto">
      <thead>
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
  </div>
`;
        } else {
          botaoCadastrar.style.display = "inline-block";
          botaoAtualizar.style.display = "none";
          document.getElementById("produtoExistenteContainer").innerHTML = "";
          descricaoInput.value = "";
          precoVendaInput.value = "";
          categoriaSelect.value = "";
          subcategoriaSelect.value = "";
        }
      } else {
        notificarToast('success', 'Produto ainda não cadastrado.');

        botaoCadastrar.style.display = "inline-block";
        botaoAtualizar.style.display = "none";
        document.getElementById("produtoExistenteContainer").innerHTML = "";

        descricaoInput.value = "";
        precoVendaInput.value = "";
        categoriaSelect.value = "";
        subcategoriaSelect.value = "";
      }
    } else {
      botaoCadastrar.style.display = "inline-block";
      botaoAtualizar.style.display = "none";
      document.getElementById("produtoExistenteContainer").innerHTML = "";
    }
  });

  // Enviar novo produto (cadastrar)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const codigo = codigoBarrasInput.value.trim();
    const descricao = descricaoInput.value.trim().toUpperCase();
    const precoVenda = precoVendaInput.value.trim().replace(".", ",");
    const categoria = categoriaSelect.value.trim().toLowerCase() === "adicionar categoria"
      ? document.getElementById("novaCategoria").value.trim()
      : categoriaSelect.value.trim();
    const subcategoria = subcategoriaSelect.value.trim().toLowerCase() === "adicionar subcategoria"
      ? document.getElementById("novaSubcategoria").value.trim()
      : subcategoriaSelect.value.trim();

    const produtosLocal = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    const codigosExistentes = JSON.parse(localStorage.getItem(codigosKey)) || [];

    if (codigosExistentes.includes(codigo)) {
      Swal.fire({
        icon: 'warning',
        title: 'Produto já cadastrado',
        text: 'Já existe um produto cadastrado com esse código de barras.',
        timer: 3000,
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return; // Impede o envio
    }

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

    // Atualiza listas locais antes de salvar
    if (!codigosExistentes.includes(codigo)) {
      codigosExistentes.push(codigo);
      localStorage.setItem(codigosKey, JSON.stringify(codigosExistentes));
    }

    let categoriasLocais = JSON.parse(localStorage.getItem(categoriasKey)) || [];
    if (!categoriasLocais.includes(categoria)) {
      categoriasLocais.push(categoria);
      localStorage.setItem(categoriasKey, JSON.stringify(categoriasLocais));
    }

    let subcategoriasLocais = JSON.parse(localStorage.getItem(subcategoriasKey)) || [];
    if (!subcategoriasLocais.includes(subcategoria)) {
      subcategoriasLocais.push(subcategoria);
      localStorage.setItem(subcategoriasKey, JSON.stringify(subcategoriasLocais));
    }

    // Salva produto na lista de novos produtos (para envio posterior)
    const novosProdutos = JSON.parse(localStorage.getItem(novosProdutosKey)) || [];
    novosProdutos.push(novoProduto);
    localStorage.setItem(novosProdutosKey, JSON.stringify(novosProdutos));

    // Atualiza o localStorage principal de produtos
    produtosLocal.push(novoProduto);
    localStorage.setItem(localStorageKey, JSON.stringify(produtosLocal));

    // Feedback visual para usuário
    Swal.fire({
      icon: 'success',
      title: 'Produto salvo',
      text: 'Produto colocado na fila para envio. Não esqueça de clicar em “Enviar novos produtos”.',
      timer: 3000,
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timerProgressBar: true,
    });

    form.reset();
    document.getElementById('nova-categoria-container').style.display = 'none';
    document.getElementById('nova-subcategoria-container').style.display = 'none';

    await carregarOpcoes();
  });

// Botão atualizar produto  
document.getElementById("botaoAtualizar").addEventListener("click", () => {
  const codigo = codigoBarrasInput.value.trim();
  const descricao = descricaoInput.value.trim().toUpperCase();
  const precoVenda = precoVendaInput.value.trim().replace(".", ",");
  const categoria = categoriaSelect.value.trim().toLowerCase() === "adicionar categoria" ?
    document.getElementById("novaCategoria").value.trim() :
    categoriaSelect.value.trim();
  const subcategoria = subcategoriaSelect.value.trim().toLowerCase() === "adicionar subcategoria" ?
    document.getElementById("novaSubcategoria").value.trim() :
    subcategoriaSelect.value.trim();
  
  const produtosLocal = JSON.parse(localStorage.getItem(localStorageKey)) || [];
  const index = produtosLocal.findIndex(p => p["Código de Barras"] === codigo);
  
  if (index !== -1) {
    produtosLocal[index]["Descrição"] = descricao;
    produtosLocal[index]["Preço Venda Varejo"] = precoVenda;
    produtosLocal[index]["Categoria do Produto"] = categoria;
    produtosLocal[index]["Subcategoria do Produto"] = subcategoria;
    
    localStorage.setItem(localStorageKey, JSON.stringify(produtosLocal));
    
    // Atualiza listas locais se categoria/subcategoria forem novas  
    let categoriasLocais = JSON.parse(localStorage.getItem(categoriasKey)) || [];
    if (!categoriasLocais.includes(categoria)) {
      categoriasLocais.push(categoria);
      localStorage.setItem(categoriasKey, JSON.stringify(categoriasLocais));
    }
    
    let subcategoriasLocais = JSON.parse(localStorage.getItem(subcategoriasKey)) || [];
    if (!subcategoriasLocais.includes(subcategoria)) {
      subcategoriasLocais.push(subcategoria);
      localStorage.setItem(subcategoriasKey, JSON.stringify(subcategoriasLocais));
    }
    
    // Atualiza lista de produtos atualizados para envio  
    let produtosAtualizados = JSON.parse(localStorage.getItem(produtosAtualizadosKey)) || [];
    const indexAtualizados = produtosAtualizados.findIndex(p => p["Código de Barras"] === codigo);
    
    if (indexAtualizados !== -1) {
      produtosAtualizados[indexAtualizados] = produtosLocal[index];
    } else {
      produtosAtualizados.push(produtosLocal[index]);
    }
    
    localStorage.setItem(produtosAtualizadosKey, JSON.stringify(produtosAtualizados));
    
    Swal.fire({
      icon: 'success',
      title: 'Produto atualizado',
      text: 'Produto atualizado e salvo para envio!',
      timer: 3000,
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timerProgressBar: true,
    });
    
    // Resetar formulário e UI  
    form.reset();
    document.getElementById("produtoExistenteContainer").innerHTML = "";
    const aviso = document.getElementById("produto-existente");
    if (aviso) aviso.remove();
    document.getElementById("botaoCadastrar").style.display = "inline-block";
    document.getElementById("botaoAtualizar").style.display = "none";
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Produto não encontrado para atualizar.',
      showConfirmButton: true,
    });
  }
});

// Fechar listas de sugestões ao clicar fora  
document.addEventListener("click", (e) => {
  const listas = document.querySelectorAll(".lista-hover");
  listas.forEach(lista => {
    if (!lista.contains(e.target) && !lista.previousElementSibling.contains(e.target)) {
      lista.style.display = "none";
    }
  });
});

// Enviar novos produtos e atualizações para API  
document.getElementById("enviarNovosProdutos").addEventListener("click", async (e) => {
  e.preventDefault();
  
  const botao = e.target;
  botao.disabled = true;
  
  Swal.fire({
    title: "Aguarde",
    text: "Enviando produtos para a planilha...",
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => Swal.showLoading()
  });
  
  const novosSalvos = JSON.parse(localStorage.getItem("novosProdutos")) || [];
  const atualizadosSalvos = JSON.parse(localStorage.getItem("produtosAtualizados")) || [];
  
  // Consulta a planilha para obter códigos já existentes  
  let produtosAPI = [];
  try {
    const res = await fetch(apiUrl);
    produtosAPI = await res.json();
  } catch (err) {
    console.error("Erro ao buscar dados da API:", err);
    Swal.close();
    Swal.fire({ icon: "error", title: "Erro ao buscar planilha", text: "Falha na verificação.", showConfirmButton: true });
    botao.disabled = false;
    return;
  }
  const codigosExistentesNaAPI = produtosAPI.map(p => p["Código de Barras"]);
  
  const produtosParaCriar = [];
  const produtosParaAtualizar = [];
  
  // 1️⃣ Analisando 'novosSalvos': se já existe na API, atualiza; se não, cria (POST)  
  for (const produto of novosSalvos) {
    const codigo = produto["Código de Barras"];
    if (!codigosExistentesNaAPI.includes(codigo)) {
      produtosParaCriar.push(produto); // POST  
    } else {
      produtosParaAtualizar.push(produto); // PUT  
    }
  }
  
  // 2️⃣ Analisando 'atualizadosSalvos': só atualiza se existe na API e ainda não foi marcado acima  
  for (const produto of atualizadosSalvos) {
    const codigo = produto["Código de Barras"];
    const jaMarcado = produtosParaAtualizar.some(p => p["Código de Barras"] === codigo);
    if (codigosExistentesNaAPI.includes(codigo) && !jaMarcado) {
      produtosParaAtualizar.push(produto); // PUT  
    }
  }
  
  // Sem itens para criar ou atualizar?  
  if (produtosParaCriar.length === 0 && produtosParaAtualizar.length === 0) {
    Swal.close();
    Swal.fire({ icon: "info", title: "Nada para enviar", text: "Nenhum produto novo ou atualização pendente.", timer: 2500, toast: true, position: "top", showConfirmButton: false });
    botao.disabled = false;
    return;
  }
  
try {
  // Envio POST (novos produtos)  
  if (produtosParaCriar.length > 0) {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: produtosParaCriar }),
    });
    const txt = await res.text();
    console.log("POST response:", res.status, txt);
    if (!res.ok) throw new Error("Falha ao criar novos produtos");
  }
  
  // Envio PUT (atualizações)  
  for (const produto of produtosParaAtualizar) {
    const codigo = produto["Código de Barras"];
    const res = await fetch(`${apiUrl}/Código de Barras/${codigo}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [produto] }),
    });
    const txt = await res.text();
    console.log(`PUT ${codigo} ->`, res.status, txt);
    if (!res.ok) throw new Error(`Falha ao atualizar produto ${codigo}`);
  }
  
  Swal.close();
  
  // Mostrar quantidades na mensagem de sucesso
  Swal.fire({
    icon: "success",
    title: "Produtos enviados",
    html: `
      <p><strong>${produtosParaCriar.length}</strong> produto(s) novos criado(s).</p>
      <p><strong>${produtosParaAtualizar.length}</strong> produto(s) atualizado(s).</p>
    `,
    timer: 4000,
    toast: true,
    position: "top",
    showConfirmButton: false
  });
    localStorage.removeItem("novosProdutos");
    localStorage.removeItem("produtosAtualizados");
  } catch (error) {
    console.error("Erro no envio:", error);
    Swal.close();
    Swal.fire({ icon: "error", title: "Erro ao enviar", text: error.message || "Falha no envio para a planilha.", showConfirmButton: true });
  } finally {
    botao.disabled = false;
  }
});
}