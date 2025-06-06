// Importa a conexão com o banco de dados configurada em db.js
const db = require('../config/db');
// Importa a função de validação para o objeto fornecedor
const { fornecedorValidation } = require('../utils/validation');

// Função para listar todos os fornecedores cadastrados, ordenando pelo nome em ordem crescente
const listarFornecedores = async (req, res) => {
    try {
        // Query SQL para recuperar todos os registros da tabela "fornecedor_tb", ordenados por nome
        const sql = 'SELECT * FROM fornecedor_tb ORDER BY nome ASC';
        // Executa a query de forma assíncrona. Note que removemos o uso de .promise() pois estamos usando sempre a API com Promises
        const [fornecedores] = await db.query(sql);
        // Retorna um status 200 (OK) com os fornecedores em formato JSON
        res.status(200).json(fornecedores);
    } catch (error) {
        // Caso ocorra algum erro, loga a mensagem e retorna status 500 (Erro interno do servidor)
        console.error("Erro ao listar fornecedores:", error);
        res.status(500).json({ erro: "Erro ao listar fornecedores" });
    }
};

// Função para buscar um fornecedor específico pelo id fornecido como parâmetro na rota
const buscarFornecedorPorId = async (req, res) => {
    const { id } = req.params;

    try {
        // Query SQL para buscar o fornecedor com o id informado
        const sql = 'SELECT * FROM fornecedor_tb WHERE id = ?';
        const [fornecedor] = await db.query(sql, [id]);

        // Se o array retornado estiver vazio, significa que não foi encontrado nenhum fornecedor com esse id
        if (fornecedor.length === 0) {
            return res.status(404).json({ erro: "Fornecedor não encontrado" });
        }

        // Caso encontrado, retorna o primeiro (e único) registro
        res.status(200).json(fornecedor[0]);
    } catch (error) {
        console.error("Erro ao buscar fornecedor:", error);
        res.status(500).json({ erro: "Erro ao buscar fornecedor" });
    }
};

// Função para cadastrar um novo fornecedor
const cadastrarFornecedor = async (req, res) => {
    // Validação dos dados enviados pelo cliente utilizando a função fornecedorValidation
    const { error } = fornecedorValidation(req.body);
    if (error)
        return res.status(400).json({ erro: error.details[0].message });

    // Extrai os campos necessários do corpo da requisição
    const { nome, telefone, email, endereco, cep, bairro, cidade } = req.body;

    try {
        // Query SQL para inserir um novo fornecedor na tabela
        const sql = `
            INSERT INTO fornecedor_tb (nome, telefone, email, endereco, cep, bairro, cidade)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        // Executa a query inserindo os valores, utilizando trim() para remover espaços desnecessários
        const [result] = await db.query(sql, [
            nome.trim(),
            telefone.trim(),
            email.trim(),
            endereco.trim(),
            cep.trim(),
            bairro.trim(),
            cidade.trim()
        ]);

        // Retorna status 201 (Criado) com o novo id gerado e o nome do fornecedor
        res.status(201).json({ id: result.insertId, nome });
    } catch (error) {
        console.error("Erro ao cadastrar fornecedor:", error);
        res.status(500).json({ erro: "Erro ao cadastrar fornecedor" });
    }
};

// Função para atualizar os dados de um fornecedor existente
const atualizarFornecedor = async (req, res) => {
    const { id } = req.params;
    // Valida os dados do corpo da requisição
    const { error } = fornecedorValidation(req.body);
    if (error)
        return res.status(400).json({ erro: error.details[0].message });

    // Extrai os dados a serem atualizados
    const { nome, telefone, email, endereco, cep, bairro, cidade } = req.body;

    try {
        // Query para verificar se o fornecedor com o id informado existe
        const checkSql = 'SELECT id FROM fornecedor_tb WHERE id = ?';
        const [fornecedor] = await db.query(checkSql, [id]);

        // Se não encontrar nenhum registro, retorna erro 404
        if (fornecedor.length === 0) {
            return res.status(404).json({ erro: "Fornecedor não encontrado" });
        }

        // Query SQL para atualizar os dados do fornecedor
        const updateSql = `
            UPDATE fornecedor_tb
            SET nome = ?, telefone = ?, email = ?, endereco = ?, cep = ?, bairro = ?, cidade = ?
            WHERE id = ?
        `;
        // Executa a query atualizando os valores e utiliza trim() para limpar os inputs
        await db.query(updateSql, [
            nome.trim(),
            telefone.trim(),
            email.trim(),
            endereco.trim(),
            cep.trim(),
            bairro.trim(),
            cidade.trim(),
            id
        ]);

        // Retorna mensagem de sucesso com status 200 (OK)
        res.status(200).json({ mensagem: "Fornecedor atualizado com sucesso" });
    } catch (error) {
        console.error("Erro ao atualizar fornecedor:", error);
        res.status(500).json({ erro: "Erro ao atualizar fornecedor" });
    }
};

// Função para excluir um fornecedor específico com base no id passado pela URL
const excluirFornecedor = async (req, res) => {
    const { id } = req.params;

    try {
        // Verifica se o fornecedor existe antes de tentar excluí-lo
        const checkSql = 'SELECT id FROM fornecedor_tb WHERE id = ?';
        const [fornecedor] = await db.query(checkSql, [id]);

        // Se nenhum registro for encontrado, retorna erro 404
        if (fornecedor.length === 0) {
            return res.status(404).json({ erro: "Fornecedor não encontrado" });
        }

        // Query SQL para excluir o fornecedor com o id especificado
        const deleteSql = 'DELETE FROM fornecedor_tb WHERE id = ?';
        await db.query(deleteSql, [id]);

        // Retorna status 200 com mensagem de sucesso
        res.status(200).json({ mensagem: "Fornecedor excluído com sucesso" });
    } catch (error) {
        console.error("Erro ao excluir fornecedor:", error);
        res.status(500).json({ erro: "Erro ao excluir fornecedor" });
    }
};

// Exporta todas as funções para serem utilizadas em outras partes da aplicação (por exemplo, nas rotas)
module.exports = {
    listarFornecedores,
    buscarFornecedorPorId,
    cadastrarFornecedor,
    atualizarFornecedor,
    excluirFornecedor
};
