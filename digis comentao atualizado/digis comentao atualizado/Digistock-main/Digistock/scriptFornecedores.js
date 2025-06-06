const API_URL = 'http://localhost:3000/api/fornecedores';

// Verifica se o script está sendo carregado corretamente
console.log("Script `scriptFornecedores.js` carregado!");

// Carregar lista de fornecedores na tabela `listasFornecedores.html`
const carregarFornecedores = async () => {
    const tabelaBody = document.querySelector("#tabela-fornecedores tbody");

    if (!tabelaBody) {
        console.warn("Tabela de fornecedores não encontrada. A função foi chamada em uma página sem essa tabela.");
        return; // Interrompe a execução para evitar erros
    }

    try {
        console.log("Carregando fornecedores...");
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Erro ao carregar fornecedores: ${response.status}`);

        const fornecedores = await response.json();
        console.log("Fornecedores carregados:", fornecedores);

        tabelaBody.innerHTML = ""; // Limpa a tabela antes de adicionar novos fornecedores

        fornecedores.forEach(fornecedor => {
            const row = tabelaBody.insertRow();
            row.innerHTML = `
                <td>${fornecedor.nome}</td>
                <td>${fornecedor.telefone}</td>
                <td>${fornecedor.email}</td>
                <td>${fornecedor.endereco || '-'}</td>
                <td>${fornecedor.cep || '-'}</td>
                <td>${fornecedor.bairro || '-'}</td>
                <td>${fornecedor.cidade || '-'}</td>
                <td>
                    <button class="btn-edit btn-action" onclick="editarFornecedor(${fornecedor.id})">Editar</button>
                    <button class="btn-delete btn-action" onclick="excluirFornecedor(${fornecedor.id})">Excluir</button>
                </td>
            `;
        });
    } catch (error) {
        console.error("Erro ao carregar fornecedores:", error.message);
    }
};

// Editar fornecedor
window.editarFornecedor = async (id) => {
    console.log("Redirecionando para edição do fornecedor com ID:", id);
    localStorage.setItem("fornecedorEditando", id);
    window.location.href = "fornecad.html";
};

// Carregar fornecedor para edição
document.addEventListener("DOMContentLoaded", async () => {
    const fornecedorId = localStorage.getItem("fornecedorEditando");

    if (!fornecedorId) {
        console.log("Nenhum fornecedor em edição.");
        return;
    }

    try {
        console.log("Carregando dados do fornecedor, ID:", fornecedorId);

        const response = await fetch(`${API_URL}/${fornecedorId}`);
        if (!response.ok) {
            throw new Error(`Erro ao carregar fornecedor. Código HTTP: ${response.status}`);
        }

        const fornecedor = await response.json();
        console.log("Fornecedor carregado:", fornecedor);

        document.getElementById("nome").value = fornecedor.nome;
        document.getElementById("telefone").value = fornecedor.telefone;
        document.getElementById("email").value = fornecedor.email;
        document.getElementById("endereco").value = fornecedor.endereco;
        document.getElementById("cep").value = fornecedor.cep;
        document.getElementById("bairro").value = fornecedor.bairro;
        document.getElementById("cidade").value = fornecedor.cidade;

        document.querySelector(".btn-save").textContent = "Atualizar";

    } catch (error) {
        console.error("Erro ao carregar fornecedor:", error);
    }
});

const obterDadosFormulario = () => {
    return {
        nome: document.getElementById("nome").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        email: document.getElementById("email").value.trim(),
        endereco: document.getElementById("endereco").value.trim(),
        cep: document.getElementById("cep").value.trim(),
        bairro: document.getElementById("bairro").value.trim(),
        cidade: document.getElementById("cidade").value.trim()
    };
};

const validarFormulario = (fornecedor) => {
    return fornecedor.nome && fornecedor.telefone && fornecedor.email;
};

document.addEventListener("DOMContentLoaded", () => {
    const telefoneInput = document.getElementById("telefone");

    if (telefoneInput) {
        telefoneInput.addEventListener("input", (event) => {
            let valor = event.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos

            // Permite apagar completamente o campo sem travar
            if (valor.length === 0) {
                telefoneInput.value = "";
                return;
            }

            if (valor.length <= 8) {
                // Formata telefone fixo (1234-5678)
                telefoneInput.value = valor.replace(/^(\d{0,4})(\d{0,4})$/, "$1-$2").slice(0, 9);
            } else if (valor.length >= 10 && valor.length <= 11) {
                // Formata celular ((XX) 9XXXX-XXXX)
                telefoneInput.value = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3").slice(0, 15);
            } else {
                telefoneInput.value = valor; // Mantém o valor enquanto está sendo digitado
            }
        });

        // Adiciona um evento para detectar quando o usuário apaga manualmente
        telefoneInput.addEventListener("keydown", (event) => {
            if (event.key === "Backspace" || event.key === "Delete") {
                telefoneInput.value = telefoneInput.value.replace(/\D/g, ""); // Permite apagar corretamente
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("email");
    const mensagemErro = document.createElement("span"); // Cria um elemento para exibir mensagens
    mensagemErro.style.display = "none"; // Oculta por padrão

    if (emailInput) {
        emailInput.parentNode.insertBefore(mensagemErro, emailInput.nextSibling); // Insere a mensagem abaixo do campo

        emailInput.addEventListener("input", (event) => {
            const email = event.target.value.trim();
            const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/; // Permite qualquer provedor seguido de ".com"

            if (!regexEmail.test(email)) {
                // Email inválido: Estiliza o campo em vermelho e exibe mensagem de erro
                emailInput.style.border = "2px solid red";
                mensagemErro.style.color = "red";
                mensagemErro.textContent = "Email inválido! O formato deve ser exemplo@(provedor).com";
                mensagemErro.style.display = "block";
            } else {
                // Email válido: Estiliza o campo em verde e exibe mensagem de sucesso
                emailInput.style.border = "2px solid green";
                mensagemErro.style.color = "green";
                mensagemErro.textContent = "Email válido!";
                mensagemErro.style.display = "block";
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const cepInput = document.getElementById("cep");
    const mensagemErro = document.createElement("span"); // Elemento para mensagens de validação
    mensagemErro.style.display = "none"; // Oculta por padrão

    if (cepInput) {
        cepInput.parentNode.insertBefore(mensagemErro, cepInput.nextSibling); // Insere a mensagem abaixo do campo

        cepInput.addEventListener("input", (event) => {
            let valor = event.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
            if (valor.length > 8) valor = valor.slice(0, 8); // Limita a 8 números

            if (valor.length === 8) {
                valor = valor.replace(/(\d{5})(\d{3})/, "$1-$2"); // Aplica máscara XXXXX-XXX
            }

            event.target.value = valor; // Atualiza o campo com a formatação correta

            // Expressão regular correta para validar CEP
            const regexCEP = /^\d{5}-\d{3}$/;

            if (regexCEP.test(valor)) {
                cepInput.style.border = "2px solid green";
                mensagemErro.style.color = "green";
                mensagemErro.textContent = "CEP válido!";
                mensagemErro.style.display = "block";
            } else {
                cepInput.style.border = "2px solid red";
                mensagemErro.style.color = "red";
                mensagemErro.textContent = "CEP inválido! O formato deve ser XXXXX-XXX.";
                mensagemErro.style.display = "block";
            }
        });

        // Adiciona consulta à API ViaCEP ao perder o foco no campo
        cepInput.addEventListener("blur", async () => {
            let cep = cepInput.value.replace(/\D/g, ""); // 🔹 Remove caracteres não numéricos

            if (!/^\d{8}$/.test(cep)) {
                return; // Não busca se o CEP for inválido
            }

            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();

                if (data.erro) {
                    mensagemErro.style.color = "red";
                    mensagemErro.textContent = "CEP não encontrado!";
                    return;
                }

                // Preenche automaticamente os campos de endereço
                document.getElementById("endereco").value = data.logradouro || "";
                document.getElementById("bairro").value = data.bairro || "";
                document.getElementById("cidade").value = data.localidade || "";
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
                mensagemErro.style.color = "red";
                mensagemErro.textContent = "Erro ao buscar endereço.";
            }
        });
    }
});

// Salvar fornecedor (cadastro ou edição)
const salvarFornecedor = async () => {
    const botaoSalvar = document.querySelector(".btn-save");

    // Desativa temporariamente para impedir cliques múltiplos
    botaoSalvar.disabled = true;

    const fornecedorId = localStorage.getItem("fornecedorEditando");
    const fornecedor = obterDadosFormulario();

    if (!validarFormulario(fornecedor)) {
        alert("Nome, telefone e email são obrigatórios!");
        botaoSalvar.disabled = false; // Reativa o botão se houver erro
        return;
    }

    try {
        console.log("Salvando fornecedor...");
        const url = fornecedorId ? `${API_URL}/${fornecedorId}` : API_URL;
        const method = fornecedorId ? "PUT" : "POST";

        // Adicionando controle para evitar chamadas duplicadas
        if (botaoSalvar.dataset.processing === "true") {
            console.warn("Requisição já em andamento. Cancelando segunda execução.");
            return;
        }
        botaoSalvar.dataset.processing = "true"; // Marca que a requisição está em execução

        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fornecedor)
        });

        const result = await response.json();

        if (result.erro) {
            alert(result.erro);
            botaoSalvar.disabled = false; // Reativa o botão se houver erro
            botaoSalvar.dataset.processing = "false"; // Libera para nova requisição
            return;
        }

        alert(fornecedorId ? "Fornecedor atualizado com sucesso!" : "Fornecedor cadastrado com sucesso!");

        localStorage.removeItem("fornecedorEditando");
        botaoSalvar.dataset.processing = "false"; // Libera para nova requisição
        window.location.href = "listasFornecedores.html"; // Retorna para a lista

    } catch (error) {
        console.error("Erro ao salvar fornecedor:", error);
        botaoSalvar.disabled = false; // Reativa o botão em caso de erro
        botaoSalvar.dataset.processing = "false"; // Libera para nova requisição
    }
};

// Excluir fornecedor
const excluirFornecedor = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este fornecedor?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Erro ao excluir fornecedor");

        alert("Fornecedor excluído com sucesso!");
        location.reload(); // Atualiza a página para refletir a exclusão

    } catch (error) {
        console.error("Erro ao excluir fornecedor:", error);
    }
};

// Garante que o botão "Salvar" funcione corretamente
document.addEventListener("DOMContentLoaded", () => {
    const botaoSalvar = document.querySelector(".btn-save");

    if (botaoSalvar) {
        botaoSalvar.removeEventListener("click", salvarFornecedor); // Remove eventos duplicados
        botaoSalvar.addEventListener("click", salvarFornecedor, { once: true }); // Adiciona um evento único
    }
});

const cancelarEdicaoFornecedor = () => {
    console.log("Cancelando edição e resetando ID...");
    localStorage.removeItem("fornecedorEditando");
    window.location.href = "listasFornecedores.html"; // Redireciona para a lista de fornecedores
};