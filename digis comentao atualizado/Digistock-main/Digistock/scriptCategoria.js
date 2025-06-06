// Define a URL base da API para as operações relacionadas às categorias
const API_URL = 'http://localhost:3000/api/categorias';

/**
 * Função para carregar as categorias cadastradas e exibi-las em uma tabela.
 * A função realiza uma requisição GET para a API, obtém o JSON da resposta,
 * e popula a tabela com os dados das categorias.
 */
async function carregarCategorias() {
    try {
        // Faz a requisição GET para a API de categorias
        const response = await fetch(API_URL, { method: 'GET' });
        if (!response.ok)
            throw new Error('Erro ao carregar categorias');
        
        // Converte a resposta para JSON
        const categorias = await response.json();
        // Seleciona o corpo da tabela onde as categorias serão exibidas
        const tabelaBody = document.querySelector('#tabela-categorias tbody');
        // Limpa o conteúdo atual da tabela
        tabelaBody.innerHTML = '';

        // Para cada categoria, cria uma nova linha na tabela com botões de editar e excluir
        categorias.forEach(categoria => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${categoria.nome_categoria}</td>
                <td>
                    <button class="btn-edit btn-action" onclick="editarCategoria(${categoria.id}, '${categoria.nome_categoria}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete btn-action" onclick="excluirCategoria(${categoria.id})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </td>
            `;
            // Adiciona a nova linha à tabela
            tabelaBody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar categorias:', error.message);
    }
}

/**
 * Função para adicionar uma nova categoria.
 * Valida que o nome foi informado, verifica se já existe uma categoria com o mesmo nome,
 * e se não existir, envia uma requisição POST para cadastrá-la.
 */
async function adicionarCategoria() {
    // Obtém o valor do campo de entrada e remove espaços em branco extras
    const categoriaNome = document.getElementById('categoria-nome').value.trim();

    if (!categoriaNome) {
        alert("Por favor, insira um nome para a categoria.");
        return;
    }

    try {
        // Busca as categorias existentes para verificar duplicidade
        const response = await fetch(API_URL);
        if (!response.ok)
            throw new Error('Erro ao verificar categorias existentes');

        const categorias = await response.json();
        // Verifica se já existe uma categoria com o mesmo nome (ignorando diferença de caixa)
        const categoriaExistente = categorias.some(categoria => 
            categoria.nome_categoria.toLowerCase() === categoriaNome.toLowerCase()
        );
        if (categoriaExistente) {
            alert(`A categoria "${categoriaNome}" já existe! Escolha outro nome.`);
            return;
        }

        // Se não existir duplicata, envia requisição POST para adicionar a nova categoria
        const addResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome_categoria: categoriaNome })
        });

        if (!addResponse.ok)
            throw new Error('Erro ao adicionar categoria');

        alert(`Categoria "${categoriaNome}" adicionada com sucesso!`);

        // Oculta o formulário e limpa o campo de entrada
        document.getElementById('form-categoria').style.display = 'none';
        document.getElementById('categoria-nome').value = '';
        // Recarrega a lista de categorias para atualizar a tabela
        carregarCategorias();
    } catch (error) {
        console.error('Erro ao adicionar categoria:', error.message);
    }
}

/**
 * Função para iniciar o processo de edição de uma categoria.
 * Preenche o formulário com os dados atuais, altera o título do formulário e
 * configura o botão de salvar para atualizar a categoria.
 *
 * @param {number} id - ID da categoria a ser editada.
 * @param {string} nome - Nome atual da categoria.
 */
function editarCategoria(id, nome) {
    // Preenche o campo de entrada com o nome atual da categoria
    document.getElementById('categoria-nome').value = nome;
    // Muda o título do formulário para indicar que é uma edição
    document.getElementById('form-title').textContent = 'Editar Categoria';

    // Ajusta o botão de salvar para atualizar em vez de adicionar
    const btnSalvar = document.querySelector('.btn-save');
    btnSalvar.innerHTML = '<i class="fas fa-save"></i> Atualizar';
    btnSalvar.onclick = () => {
        const novoNome = document.getElementById('categoria-nome').value.trim();
        // Se o nome foi alterado, pede confirmação ao usuário
        if (novoNome !== nome) {  
            const confirmar = confirm(`Tem certeza que deseja alterar a categoria de "${nome}" para "${novoNome}"?`);
            if (!confirmar) return;
        }
        // Chama a função para atualizar a categoria
        atualizarCategoria(id);
    };

    // Exibe o formulário e define o foco no campo de entrada
    document.getElementById('form-categoria').style.display = 'block';
    document.getElementById('categoria-nome').focus();
}

/**
 * Função para atualizar uma categoria.
 * Envia uma requisição PUT com os dados atualizados para a API.
 *
 * @param {number} id - ID da categoria a ser atualizada.
 */
async function atualizarCategoria(id) {
    const nome = document.getElementById('categoria-nome').value.trim();
    if (!nome) {
        alert('Por favor, insira o nome da categoria.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome_categoria: nome })
        });
        if (!response.ok)
            throw new Error('Erro ao atualizar categoria');

        // Após atualizar, limpa o formulário e recarrega as categorias
        limparFormulario();
        carregarCategorias();
    } catch (error) {
        console.error(error.message);
    }

    // Restaura o botão de salvar para adicionar categoria posteriormente
    const btnSalvar = document.querySelector('.btn-save');
    btnSalvar.innerHTML = 'Salvar';
    btnSalvar.onclick = adicionarCategoria;
}

/**
 * Função para excluir uma categoria.
 * Solicita confirmação ao usuário e, se confirmada, envia uma requisição DELETE para a API.
 *
 * @param {number} id - ID da categoria a ser excluída.
 */
async function excluirCategoria(id) {
    const confirmar = confirm("Tem certeza que deseja excluir esta categoria?");
    if (!confirmar) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok)
            throw new Error('Erro ao excluir categoria');

        alert('Categoria excluída com sucesso!');
        carregarCategorias();
    } catch (error) {
        console.error('Erro ao excluir categoria:', error.message);
    }
}

/**
 * Função para limpar o formulário.
 * Limpa o campo de entrada e restaura o estado padrão do botão de salvar.
 */
function limparFormulario() {
    document.getElementById('categoria-nome').value = '';
    const btnSalvar = document.querySelector('.btn-save');
    btnSalvar.innerHTML = 'Salvar';
    btnSalvar.onclick = adicionarCategoria;
}

// Após o carregamento completo da página, inicia o carregamento das categorias
document.addEventListener('DOMContentLoaded', carregarCategorias);
