// Importa a conexão com o banco de dados definida no arquivo db.js.
// Isso permite realizar consultas utilizando o pool de conexões configurado.
const db = require('../config/db');

// Função para criar uma nova categoria
// Recebe uma requisição (req) e uma resposta (res) como argumentos.
const createCategoria = async (req, res) => {
    // Extrai o nome da categoria do corpo da requisição (espera-se que isso venha do cliente).
    const { nome_categoria } = req.body;

    try {
        // Define a consulta SQL para inserir o nome da categoria na tabela "categoria_tb".
        // O "?" atua como um placeholder que será substituído pelo valor de "nome_categoria".
        const sql = 'INSERT INTO categoria_tb (nome_categoria) VALUES (?)';
        
        // Executa a consulta de forma assíncrona e aguarda o resultado.
        // O método query retorna um array, onde o primeiro elemento (result) contém as informações da operação.
        const [result] = await db.query(sql, [nome_categoria]);

        // Em caso de sucesso, retorna um status 201 (Created) e um JSON com o ID gerado e o nome da categoria.
        res.status(201).json({ id: result.insertId, nome_categoria });
    } catch (error) {
        // Em caso de erro, exibe a mensagem de erro no console e retorna um status 500 (Erro interno do servidor).
        console.error('Erro ao cadastrar categoria:', error.message);
        res.status(500).json({ erro: 'Erro ao cadastrar categoria' });
    }
};

// Função para listar todas as categorias
const getCategorias = async (req, res) => {
    try {
        // Define a consulta SQL para selecionar todos os registros da tabela "categoria_tb".
        const sql = 'SELECT * FROM categoria_tb';
        
        // Executa a consulta e aguarda o array de categorias.
        const [categorias] = await db.query(sql);

        // Retorna as categorias encontradas com status 200 (OK) em formato JSON.
        res.status(200).json(categorias);
    } catch (error) {
        // Em caso de erro, exibe a mensagem no console e retorna status 500 com a mensagem de erro.
        console.error('Erro ao listar categorias:', error.message);
        res.status(500).json({ erro: 'Erro ao listar categorias' });
    }
};

// Função para atualizar uma categoria existente
const updateCategoria = async (req, res) => {
    // Extrai o ID da categoria a ser atualizada dos parâmetros da rota e o novo nome do corpo da requisição.
    const { id } = req.params;
    const { nome_categoria } = req.body;

    try {
        // Define a consulta SQL para atualizar o nome da categoria baseado no ID fornecido.
        const sql = 'UPDATE categoria_tb SET nome_categoria = ? WHERE id = ?';
        
        // Executa a consulta e aguarda a operação de atualização.
        await db.query(sql, [nome_categoria, id]);

        // Retorna uma mensagem de sucesso com status 200 (OK).
        res.status(200).json({ mensagem: "Categoria atualizada com sucesso" });
    } catch (error) {
        // Em caso de erro, exibe a mensagem e retorna status 500 com a mensagem de erro.
        console.error("Erro ao atualizar categoria:", error.message);
        res.status(500).json({ erro: "Erro ao atualizar categoria" });
    }
};

// Função para excluir uma categoria
const deleteCategoria = async (req, res) => {
    // Extrai o ID da categoria a ser excluída dos parâmetros da rota.
    const { id } = req.params;

    try {
        // Define a consulta SQL para deletar a categoria baseada no ID.
        const sql = 'DELETE FROM categoria_tb WHERE id = ?';
        
        // Executa a consulta para deletar o registro.
        await db.query(sql, [id]);

        // Em caso de sucesso, retorna uma mensagem de confirmação com status 200 (OK).
        res.status(200).json({ mensagem: "Categoria deletada com sucesso" });
    } catch (error) {
        // Em caso de erro, imprime a mensagem no console e retorna um status 500 com a mensagem de erro.
        console.error("Erro ao excluir categoria:", error.message);
        res.status(500).json({ erro: "Erro ao excluir categoria" });
    }
};

// Exporta todas as funções para que possam ser utilizadas em outras partes da aplicação.
module.exports = { createCategoria, getCategorias, updateCategoria, deleteCategoria };
