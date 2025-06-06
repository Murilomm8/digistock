document.addEventListener("DOMContentLoaded", () => {
    const botaoAdicionar = document.querySelector(".btn-add");
    const botaoCancelar = document.querySelector(".btn-cancel");

    const limparFormulario = () => {
        localStorage.removeItem("produtoEditando"); // Remove o ID salvo no localStorage
        document.getElementById("produto-nome").value = "";
        document.getElementById("produto-codigo").value = "";
        document.getElementById("produto-estoque-minimo").value = "";
        document.getElementById("produto-quantidade").value = "";
        document.getElementById("produto-preco").value = "";
        document.getElementById("produto-categoria").selectedIndex = 0;
        document.getElementById("produto-fornecedor").selectedIndex = 0;
        document.querySelector(".btn-save").textContent = "Cadastrar";
    };

    if (botaoAdicionar) {
        botaoAdicionar.addEventListener("click", limparFormulario);
    }

    if (botaoCancelar) {
        botaoCancelar.addEventListener("click", () => {
            limparFormulario();
            window.location.href = "ListasProdutos.html";
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const codigoBarrasInput = document.getElementById("produto-codigo");

    if (codigoBarrasInput) {
        codigoBarrasInput.addEventListener("input", (event) => {
            event.target.value = event.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos

            if (event.target.value.length > 13) {
                event.target.value = event.target.value.slice(0, 13); // Limita a 13 dígitos
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const precoInput = document.getElementById("produto-preco");

    if (precoInput) {
        precoInput.addEventListener("input", (event) => {
            let valor = event.target.value.replace(/[^0-9.]/g, ""); // Permite apenas números e ponto

            // Limita o número total de caracteres para evitar infinitos
            if (valor.length > 10) { // Ajuste o número máximo conforme necessário
                valor = valor.slice(0, 10);
            }

            event.target.value = valor;
        });
    }
});
document.addEventListener("DOMContentLoaded", async () => {
    const produtoId = localStorage.getItem("produtoEditando");

    if (!produtoId) {
        console.log("Nenhum produto em edição. Página carregada normalmente.");
        return; // Se não houver ID, evita erro e não executa a busca do produto
    }

    try {
        console.log("Carregando dados do produto para edição, ID:", produtoId);

        const response = await fetch(`http://localhost:3000/api/produtos/${produtoId}`);
        if (!response.ok) {
            throw new Error(`Erro ao carregar produto. Código HTTP: ${response.status}`);
        }

        const produto = await response.json();
        console.log("Produto carregado:", produto);

        // Aguarde a lista de categorias e fornecedores ser carregada antes de definir valores
        await carregarCategorias();
        await carregarFornecedores();

        document.getElementById("produto-nome").value = produto.nome;
        document.getElementById("produto-codigo").value = produto.codigo_barras;
        document.getElementById("produto-estoque-minimo").value = produto.estoque_min;
        document.getElementById("produto-quantidade").value = produto.quantidade;
        document.getElementById("produto-preco").value = produto.preco;

        // Agora que categorias e fornecedores estão prontos, atribuímos os valores corretamente
        const categoriaSelect = document.getElementById("produto-categoria");
        const fornecedorSelect = document.getElementById("produto-fornecedor");

        if (categoriaSelect && fornecedorSelect) {
            categoriaSelect.value = produto.categoria_id;
            fornecedorSelect.value = produto.fornecedor_id;
        }

        document.querySelector(".btn-save").textContent = "Atualizar";

    } catch (error) {
        console.error("Erro ao carregar produto:", error);
    }
});

const carregarCategorias = async () => {
    const selectCategoria = document.getElementById("produto-categoria");
    if (!selectCategoria) return;

    try {
        const response = await fetch("http://localhost:3000/api/categorias");
        const categorias = await response.json();

        selectCategoria.innerHTML = '<option value="" selected disabled>Selecione uma categoria</option>'; // Mantém opção inicial vazia

        categorias.forEach(categoria => {
            const option = document.createElement("option");
            option.value = categoria.id;
            option.textContent = categoria.nome_categoria;
            selectCategoria.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
    }
};

const carregarFornecedores = async () => {
    const selectFornecedor = document.getElementById("produto-fornecedor");
    if (!selectFornecedor) return;

    try {
        const response = await fetch("http://localhost:3000/api/fornecedores");
        const fornecedores = await response.json();

        selectFornecedor.innerHTML = '<option value="" selected disabled>Selecione um fornecedor</option>'; // Mantém opção inicial vazia

        fornecedores.forEach(fornecedor => {
            const option = document.createElement("option");
            option.value = fornecedor.id;
            option.textContent = fornecedor.nome;
            selectFornecedor.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar fornecedores:", error);
    }
};

// Função de salvar produto
const salvarProduto = async () => {
    const produtoId = localStorage.getItem("produtoEditando"); // Verifica se o produto está sendo editado

    const produto = {
        nome: document.getElementById("produto-nome")?.value.trim(),
        codigo_barras: document.getElementById("produto-codigo")?.value.trim(),
        categoria_id: document.getElementById("produto-categoria")?.value,
        fornecedor_id: document.getElementById("produto-fornecedor")?.value,
        estoque_min: document.getElementById("produto-estoque-minimo")?.value,
        quantidade: document.getElementById("produto-quantidade")?.value,
        preco: document.getElementById("produto-preco")?.value.trim()
    };

    // Verifica se os campos obrigatórios estão preenchidos
    if (!produto.nome || !produto.codigo_barras || !produto.categoria_id || !produto.estoque_min || !produto.preco) {
        alert("Nome, Código de Barras, Categoria, Estoque Mínimo e Preço são obrigatórios!");
        return;
    }

    // Valida o código de barras no front antes de enviar
    if (produto.codigo_barras.length !== 13) {
        alert("O Código de Barras deve conter exatamente 13 números.");
        return;
    }

    try {
        // Se houver um produto sendo editado, faz uma requisição PUT. Caso contrário, usa POST para cadastrar.
        const url = produtoId ? `http://localhost:3000/api/produtos/${produtoId}` : "http://localhost:3000/api/produtos";
        const method = produtoId ? "PUT" : "POST"; // Diferencia entre atualização e cadastro

        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(produto)
        });

        const result = await response.json();

        if (result.erro) {
            alert(result.erro); // Exibe mensagem de erro do back-end
            return;
        }

        alert(produtoId ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!");

        localStorage.removeItem("produtoEditando"); // Remove o ID após edição bem-sucedida
        window.location.href = "ListasProdutos.html"; // Retorna para a lista de produtos
    } catch (error) {
        console.error("Erro ao salvar produto:", error);
    }
};

// Carregar lista de produtos
const carregarProdutos = async () => {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    
    if (!tabelaBody) {
        console.warn("Elemento da tabela de produtos não encontrado. Certifique-se de que `ListasProdutos.html` tem um `<tbody>` dentro da tabela.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/produtos");
        if (!response.ok) throw new Error("Erro ao carregar produtos");
        
        const produtos = await response.json();
        console.log("Produtos carregados:", produtos); // Depuração

        tabelaBody.innerHTML = ""; // Limpa a tabela antes de adicionar novos produtos

        produtos.forEach(produto => {
            const row = tabelaBody.insertRow();
            row.innerHTML = `
                <td>${produto.nome}</td>
                <td>${produto.codigo_barras}</td>
                <td>${produto.categoria || "Sem categoria"}</td>
                <td>${produto.fornecedor || "Sem fornecedor"}</td>
                <td>${produto.estoque_min}</td>
                <td>${produto.quantidade}</td>
                <td>R$ ${Number(produto.preco).toFixed(2)}</td>
                <td>
                    <button class="btn-edit btn-action" onclick="editarProduto(${produto.id})">Editar</button>
                    <button class="btn-delete btn-action" onclick="excluirProduto(${produto.id})">Excluir</button>
                </td>
            `;
        });
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    }
};
window.editarProduto = async (id) => {
    console.log("Redirecionando para edição do produto com ID:", id);

    // Armazena o ID do produto no localStorage
    localStorage.setItem("produtoEditando", id);

    // Redireciona para `Produtos.html` para edição
    window.location.href = "Produtos.html";
};

// Garante que o script só roda quando o DOM estiver completamente carregado
document.addEventListener("DOMContentLoaded", () => {
    carregarCategorias();
    carregarFornecedores();
    carregarProdutos();
});

// Excluir produto
const excluirProduto = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
        const response = await fetch(`http://localhost:3000/api/produtos/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("Erro ao excluir produto");
        alert("Produto excluído com sucesso!");
        carregarProdutos();
    } catch (error) {
        console.error("Erro ao excluir produto:", error);
    }
};

// Garante que o botão "Salvar" funcione corretamente
document.addEventListener("DOMContentLoaded", () => {
    const botaoSalvar = document.querySelector(".btn-save");
    if (botaoSalvar) {
        botaoSalvar.addEventListener("click", salvarProduto);
    }
});