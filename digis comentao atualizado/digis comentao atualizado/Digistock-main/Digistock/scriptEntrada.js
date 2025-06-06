// Evento que dispara a execução assim que o DOM estiver totalmente carregado
document.addEventListener("DOMContentLoaded", () => {
    // Carrega as listas de produtos, fornecedores e entradas assim que a página carregar
    carregarProdutos();
    carregarFornecedores();
    carregarEntradas();

    // Adiciona um listener ao botão que exibe o formulário de entrada
    document.querySelector(".btn-add").addEventListener("click", mostrarFormulario);
    // Adiciona um listener ao botão que oculta o formulário de entrada
    document.querySelector(".btn-cancel").addEventListener("click", esconderFormulario);
});

// Validação do campo "codigo-barras" para permitir apenas dígitos e limitar a 13 caracteres.
// Se o usuário digitar um caractere não numérico, exibe um alerta.
// Se for colado, apenas sanitiza o input sem exibir o alerta.
document.getElementById("codigo-barras").addEventListener("input", (event) => {
    if (event.inputType === "insertText") {
        let valor = event.target.value;

        // Exibe alerta se houver caracteres que não sejam dígitos
        if (/[^0-9]/.test(valor)) {
            alert("❌ Apenas números são permitidos no campo de código de barras!");
        }

        // Remove caracteres não numéricos e limita a 13 dígitos
        valor = valor.replace(/\D/g, '');
        if (valor.length > 13) {
            valor = valor.slice(0, 13);
        }
        event.target.value = valor;
    } else {
        // Em eventos de colagem, sanitiza o valor removendo caracteres não numéricos e limitando a 13 dígitos
        event.target.value = event.target.value.replace(/\D/g, '').slice(0, 13);
    }
});

// Função para exibir o formulário de entrada
function mostrarFormulario() {
    document.getElementById("form-entrada").style.display = "block";
}

// Função para esconder o formulário e limpar todos os seus campos
function esconderFormulario() {
    document.getElementById("codigo-barras").value = "";
    document.getElementById("produto-entrada").innerHTML = '<option value="">Selecione um produto</option>';
    document.getElementById("fornecedor-entrada").innerHTML = '<option value="">Selecione um fornecedor</option>';
    document.getElementById("quantidade-entrada").value = "";
    document.getElementById("preco-custo").value = "";
    document.getElementById("data-entrada").value = "";

    document.getElementById("form-entrada").style.display = "none";
}

// Função para carregar a lista de produtos via requisição GET à API
async function carregarProdutos() {
    try {
        const response = await fetch("http://localhost:3000/api/produtos");
        if (!response.ok) throw new Error("Erro ao buscar produtos.");

        const produtos = await response.json();
        const selectProduto = document.getElementById("produto-entrada");
        // Preenche o dropdown com uma opção padrão
        selectProduto.innerHTML = '<option value="">Selecione um produto</option>';
        // Para cada produto, insere uma opção contendo o ID e o nome
        produtos.forEach(produto => {
            selectProduto.innerHTML += `<option value="${produto.id}">${produto.nome}</option>`;
        });
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    }
}

// Função para carregar a lista de fornecedores via requisição GET à API
async function carregarFornecedores() {
    try {
        const response = await fetch("http://localhost:3000/api/fornecedores");
        if (!response.ok) throw new Error("Erro ao buscar fornecedores.");

        const fornecedores = await response.json();
        const selectFornecedor = document.getElementById("fornecedor-entrada");
        // Define opção padrão para o dropdown
        selectFornecedor.innerHTML = '<option value="">Selecione um fornecedor</option>';
        // Preenche o dropdown com as opções obtidas da API
        fornecedores.forEach(fornecedor => {
            selectFornecedor.innerHTML += `<option value="${fornecedor.id}">${fornecedor.nome}</option>`;
        });
    } catch (error) {
        console.error("Erro ao carregar fornecedores:", error);
    }
}

// Função para registrar uma nova entrada de produto via requisição POST à API
async function registrarEntrada() {
    // Coleta os valores dos campos do formulário referentes à entrada
    const entradaData = {
        codigo_barras: document.getElementById("codigo-barras").value,
        produto_id: document.getElementById("produto-entrada").value,
        fornecedor_id: document.getElementById("fornecedor-entrada").value,
        quantidade: document.getElementById("quantidade-entrada").value,
        preco_custo: document.getElementById("preco-custo").value
    };

    try {
        const response = await fetch("http://localhost:3000/api/entrada", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entradaData)
        });

        if (!response.ok) throw new Error("Erro ao registrar entrada.");

        alert("✅ Entrada registrada com sucesso!");
        esconderFormulario();
        carregarEntradas();
    } catch (error) {
        console.error("Erro ao registrar entrada:", error);
    }
}

// Ao inserir o código de barras, busca os dados correspondentes àquele produto e atualiza os dropdowns
document.getElementById("codigo-barras").addEventListener("input", async (event) => {
    const codigoBarras = event.target.value.trim();
    if (!codigoBarras) return;

    try {
        const response = await fetch(`http://localhost:3000/api/entrada/codigo_barras/${codigoBarras}`);
        if (!response.ok) throw new Error("Produto não encontrado.");
        const produto = await response.json();

        // Preenche os selects para produto e fornecedor com os dados retornados da API
        document.getElementById("produto-entrada").innerHTML = `<option value="${produto.produto_id}" selected>${produto.produto_nome}</option>`;
        document.getElementById("fornecedor-entrada").innerHTML = `<option value="${produto.fornecedor_id}" selected>${produto.fornecedor_nome}</option>`;
    } catch (error) {
        console.error("Erro ao buscar dados pelo código de barras:", error);
    }
});

// Função para carregar a lista de entradas existentes via requisição GET à API
async function carregarEntradas() {
    try {
        const response = await fetch("http://localhost:3000/api/entradas");
        if (!response.ok) throw new Error("Erro ao buscar entradas.");

        const entradas = await response.json();
        const tabela = document.querySelector("#tabela-entradas tbody");
        tabela.innerHTML = "";

        // Se não houver entradas, mostra uma mensagem padrão
        if (entradas.length === 0) {
            tabela.innerHTML = `<tr><td colspan="7" style="text-align:center;">Nenhuma entrada encontrada</td></tr>`;
        } else {
            // Para cada entrada, cria uma linha na tabela com seus dados e botões de ação (Editar/Excluir)
            entradas.forEach(entrada => {
                const precoCusto = parseFloat(entrada.preco_custo) || 0;
                const row = `<tr>
                    <td>${entrada.codigo_barras}</td>
                    <td>${entrada.produto_nome ? entrada.produto_nome : "Produto não encontrado"}</td>
                    <td>${entrada.fornecedor_nome ? entrada.fornecedor_nome : "Fornecedor não encontrado"}</td>
                    <td>${new Date(entrada.data_entrada).toLocaleDateString()}</td>
                    <td>R$ ${precoCusto.toFixed(2)}</td>
                    <td>${entrada.quantidade}</td>
                    <td>
                        <button onclick="editarEntrada(${entrada.id})" class="btn-action btn-edit">Editar</button>
                        <button onclick="excluirEntrada(${entrada.id})" class="btn-action btn-delete">Excluir</button>
                    </td>
                </tr>`;
                tabela.innerHTML += row;
            });
        }
    } catch (error) {
        console.error("Erro ao carregar entradas:", error);
    }
}

// Função para editar uma entrada: carrega os dados da entrada e preenche o formulário para edição
async function editarEntrada(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/entrada/${id}`);
        if (!response.ok) {
            console.error(`Entrada ID ${id} não encontrada.`);
            return;
        }

        const entrada = await response.json();

        // Preenche os campos do formulário com os dados da entrada a ser editada
        document.getElementById("codigo-barras").value = entrada.codigo_barras;
        document.getElementById("quantidade-entrada").value = entrada.quantidade;
        document.getElementById("preco-custo").value = entrada.preco_custo;
        document.getElementById("data-entrada").value = entrada.data_entrada.substring(0, 10);

        // Atualiza os selects para produto e fornecedor com os valores correspondentes à entrada
        document.getElementById("produto-entrada").innerHTML = `<option value="${entrada.produto_id}" selected>${entrada.produto_nome}</option>`;
        document.getElementById("fornecedor-entrada").innerHTML = `<option value="${entrada.fornecedor_id}" selected>${entrada.fornecedor_nome}</option>`;

        // Exibe o formulário de entrada para que o usuário possa editar os dados
        document.getElementById("form-entrada").style.display = "block";
        // Configura o botão de salvar para chamar a função de salvar a edição da entrada
        document.querySelector(".btn-save").setAttribute("onclick", `salvarEdicaoEntrada(${id})`);
    } catch (error) {
        console.error("Erro ao carregar entrada para edição:", error);
    }
}

// Função para salvar a edição de uma entrada, enviando os dados atualizados via requisição PUT à API
async function salvarEdicaoEntrada(id) {
    // Coleta os valores atualizados do formulário
    const entradaData = {
        codigo_barras: document.getElementById("codigo-barras").value,
        produto_id: document.getElementById("produto-entrada").value,
        fornecedor_id: document.getElementById("fornecedor-entrada").value,
        quantidade: document.getElementById("quantidade-entrada").value,
        preco_custo: document.getElementById("preco-custo").value
    };

    try {
        const response = await fetch(`http://localhost:3000/api/entrada/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entradaData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro ao editar entrada: ${errorData.error}`);
        }

        alert("Entrada editada com sucesso!");
        esconderFormulario();
        carregarEntradas();
    } catch (error) {
        console.error("Erro ao editar entrada:", error);
    }
}

// Função para excluir uma entrada via requisição DELETE à API, com confirmação do usuário
async function excluirEntrada(id) {
    const confirmacao = window.confirm("Tem certeza que deseja excluir esta entrada? Esta ação não pode ser desfeita!");
    if (!confirmacao) return;

    try {
        const response = await fetch(`http://localhost:3000/api/entrada/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro ao excluir entrada: ${errorData.error}`);
        }

        alert("Entrada excluída com sucesso!");
        carregarEntradas();
    } catch (error) {
        console.error("Erro ao excluir entrada:", error);
    }
}
