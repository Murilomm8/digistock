// Importa o model Produto (caso seja necessário para operações específicas)
// e a conexão com o banco de dados configurada em db.js
const db = require('../config/db');

// Função para listar todos os produtos, incluindo informações de categoria e fornecedor
const listarProdutos = async (req, res) => {
    try {
        // Consulta SQL que recupera os dados dos produtos, 
        // utilizando LEFT JOIN para obter categoria e fornecedor, se disponíveis.
        // COALESCE é usado para fornecer valores padrão caso a categoria ou fornecedor não sejam encontrados.
        const sql = `
            SELECT 
                p.id, 
                p.nome, 
                p.codigo_barras, 
                COALESCE(c.nome_categoria, 'Sem categoria') AS categoria, 
                COALESCE(f.nome, 'Sem fornecedor') AS fornecedor, 
                p.quantidade, 
                p.preco, 
                p.estoque_min
            FROM produtos_tb p
            LEFT JOIN categoria_tb c ON p.categoria_id = c.id
            LEFT JOIN fornecedor_tb f ON p.fornecedor_id = f.id
            ORDER BY p.nome ASC
        `;
        const [produtos] = await db.query(sql);

        // Caso não existam produtos na tabela, responde com 404
        if (produtos.length === 0) {
            return res.status(404).json({ erro: "Nenhum produto encontrado." });
        }

        // Retorna a lista de produtos com status 200 (OK)
        res.status(200).json(produtos);
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        res.status(500).json({ erro: "Erro interno ao buscar produtos." });
    }
};

// Função para listar produtos cujo estoque esteja abaixo do estoque mínimo
const listarProdutosAbaixoEstoque = async (req, res) => {
    try {
        // Consulta semelhante à de listarProdutos, mas com condição que
        // só retorna produtos onde a quantidade é inferior ao estoque mínimo.
        const sql = `
            SELECT 
                p.id, 
                p.nome, 
                p.codigo_barras, 
                COALESCE(c.nome_categoria, 'Sem categoria') AS categoria, 
                COALESCE(f.nome, 'Sem fornecedor') AS fornecedor, 
                p.quantidade, 
                p.preco, 
                p.estoque_min
            FROM produtos_tb p
            LEFT JOIN categoria_tb c ON p.categoria_id = c.id
            LEFT JOIN fornecedor_tb f ON p.fornecedor_id = f.id
            WHERE p.quantidade < p.estoque_min
            ORDER BY p.nome ASC
        `;
        const [produtos] = await db.query(sql);
        
        // Se nenhum produto abaixo do estoque mínimo for encontrado, retorna status 404
        if (produtos.length === 0) {
            return res.status(404).json({ erro: "Nenhum produto abaixo do estoque mínimo encontrado." });
        }
        res.status(200).json(produtos);
    } catch (error) {
        console.error("Erro ao buscar produtos abaixo do estoque mínimo:", error);
        res.status(500).json({ erro: "Erro interno ao buscar produtos abaixo do estoque mínimo." });
    }
};

// Função para criar um novo produto
const criarProduto = async (req, res) => {
    try {
        console.log("📌 Dados recebidos:", req.body);
        // Desestruturação dos dados recebidos no corpo da requisição
        const { nome, codigo_barras, categoria_id, fornecedor_id, quantidade, preco, estoque_min } = req.body;

        // Validação simples: verifica se todos os campos obrigatórios foram informados e não estão vazios.
        // É utilizada a verificação com o optional chaining (?.) e trim() para garantir que não haja espaços em branco
        if (!nome?.trim() || !codigo_barras?.trim() || !categoria_id || !fornecedor_id || !preco || !quantidade || !estoque_min) {
            return res.status(400).json({ erro: "Todos os campos são obrigatórios!" });
        }

        // Verifica se o código de barras já existe na base de dados para evitar duplicidade
        const checkQuery = "SELECT id FROM produtos_tb WHERE codigo_barras = ?";
        const [existente] = await db.query(checkQuery, [codigo_barras]);

        if (existente.length > 0) {
            return res.status(409).json({ erro: `O código de barras '${codigo_barras}' já está cadastrado.` });
        }

        // Query SQL para inserir os dados do novo produto
        const sql = `
            INSERT INTO produtos_tb (nome, codigo_barras, categoria_id, fornecedor_id, quantidade, preco, estoque_min)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [nome.trim(), codigo_barras.trim(), categoria_id, fornecedor_id, quantidade, preco, estoque_min];

        const [result] = await db.query(sql, values);
        console.log("📌 Query executada. Resultado:", result);
        res.status(201).json({ id: result.insertId, nome });
    } catch (error) {
        console.error("❌ Erro ao adicionar produto:", error);
        res.status(500).json({ erro: "Erro interno ao adicionar produto." });
    }
};

// Função para excluir um produto com base no id recebido via URL
const excluirProduto = async (req, res) => {
    try {
        const { id } = req.params;
        // Verifica se o produto existe antes de tentar excluí-lo
        const checkSql = 'SELECT id FROM produtos_tb WHERE id = ?';
        const [produto] = await db.query(checkSql, [id]);

        if (produto.length === 0) {
            return res.status(404).json({ erro: "Produto não encontrado." });
        }

        // Caso exista, excuta a query de deleção
        const deleteSql = 'DELETE FROM produtos_tb WHERE id = ?';
        await db.query(deleteSql, [id]);
        res.status(200).json({ mensagem: "Produto excluído com sucesso!" });
    } catch (error) {
        console.error("Erro ao excluir produto:", error);
        res.status(500).json({ erro: "Erro interno ao excluir produto." });
    }
};

// Função para atualizar um produto existente com os novos dados recebidos
const atualizarProduto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, codigo_barras, categoria_id, fornecedor_id, quantidade, preco, estoque_min } = req.body;

        // Validação para garantir que todos os campos obrigatórios estejam preenchidos
        if (!nome?.trim() || !codigo_barras?.trim() || !categoria_id || !fornecedor_id || !preco || !quantidade || !estoque_min) {
            return res.status(400).json({ erro: "Todos os campos são obrigatórios!" });
        }

        // Query SQL para atualizar os campos do produto com base no id
        const sql = `
            UPDATE produtos_tb 
            SET nome = ?, codigo_barras = ?, categoria_id = ?, fornecedor_id = ?, quantidade = ?, preco = ?, estoque_min = ?
            WHERE id = ?
        `;
        await db.query(sql, [nome.trim(), codigo_barras.trim(), categoria_id, fornecedor_id, quantidade, preco, estoque_min, id]);
        res.status(200).json({ mensagem: "Produto atualizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        res.status(500).json({ erro: "Erro interno ao atualizar produto." });
    }
};

// Função para buscar um produto específico pelo seu ID
const buscarProduto = async (req, res) => {
    try {
        const { id } = req.params;
        // Consulta SQL para recuperar os dados do produto com base no seu id
        const sql = 'SELECT id, nome, codigo_barras, categoria_id, fornecedor_id, quantidade, preco, estoque_min FROM produtos_tb WHERE id = ?';
        const [produto] = await db.query(sql, [id]);

        // Se não for encontrado, retorna status 404
        if (produto.length === 0) {
            return res.status(404).json({ erro: "Produto não encontrado." });
        }

        res.status(200).json(produto[0]);
    } catch (error) {
        console.error("Erro ao buscar produto:", error);
        res.status(500).json({ erro: "Erro interno ao buscar produto." });
    }
};

// Função para buscar um produto com base no código de barras
const buscarProdutoPorCodigo = async (req, res) => {
    try {
        const { codigo_barras } = req.params;
        // Consulta SQL para localizar o produto com o código de barras fornecido
        const sql = 'SELECT id, nome, codigo_barras, categoria_id, fornecedor_id, quantidade, preco, estoque_min FROM produtos_tb WHERE codigo_barras = ?';
        const [produto] = await db.query(sql, [codigo_barras]);

        if (produto.length === 0) {
            return res.status(404).json({ erro: "Produto não encontrado." });
        }

        res.status(200).json(produto[0]);
    } catch (error) {
        console.error("Erro ao buscar produto por código de barras:", error);
        res.status(500).json({ erro: "Erro interno ao buscar produto." });
    }
};

// Exporta todas as funções para utilização em outras partes da aplicação (por exemplo, nas rotas)
module.exports = { 
  listarProdutos, 
  listarProdutosAbaixoEstoque, 
  criarProduto, 
  excluirProduto, 
  atualizarProduto, 
  buscarProduto, 
  buscarProdutoPorCodigo 
};
