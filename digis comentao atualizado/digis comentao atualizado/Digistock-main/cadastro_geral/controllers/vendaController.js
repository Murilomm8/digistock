// Importa a conexão com o banco de dados configurada em db.js
const db = require('../config/db');

/**
 * Função auxiliar para buscar informações de um produto
 * com base no código de barras.
 * 
 * Retorna um objeto com o ID e o nome do produto, ou null se não encontrado.
 */
const obterProdutoInfo = async (codigoBarras) => {
    try {
        // Log para evidenciar o início da busca pelo produto
        console.log(` Buscando produto no banco para código de barras: ${codigoBarras}`);

        // Query para selecionar o id (renomeado para produto_id) e o nome do produto
        const query = "SELECT id AS produto_id, nome FROM produtos_tb WHERE codigo_barras = ?";
        const [resultado] = await db.query(query, [codigoBarras]);

        // Se o array resultado estiver vazio, não foi encontrado o produto
        if (resultado.length === 0) {
            console.log(` Produto com código ${codigoBarras} não encontrado no banco!`);
            return null;
        }

        // Log indicando o produto encontrado
        console.log(` Produto encontrado: ${resultado[0].nome}`);

        // Retorna o primeiro registro com as informações do produto
        return resultado[0];
    } catch (error) {
        console.error(" Erro ao buscar produto pelo código de barras:", error);
        // Lança o erro para ser tratado pelo chamador
        throw error;
    }
};

/**
 * Objeto Venda contendo métodos para manipulação de vendas
 */
const Venda = {
    /**
     * Método para cadastrar uma venda.
     * 
     * Processa os dados enviados via req.body e realiza as seguintes operações:
     * 1. Validação dos dados enviados (produto_id e quantidade são obrigatórios).
     * 2. Busca as informações de cada produto pelo código de barras utilizando obterProdutoInfo.
     * 3. Verifica o estoque atual de cada produto.
     * 4. Insere as informações da venda na tabela venda_tb, incluindo total, forma de pagamento,
     *    produtos vendidos (armazenados em JSON) e a data da venda (NOW()).
     * 5. Atualiza o estoque dos produtos vendidos, decrementando a quantidade vendida.
     */
    cadastrarVenda: async (req, res) => {
        try {
            // Log inicial com os dados da venda recebidos
            console.log(` Dados recebidos na venda:`, req.body);

            // Desestruturação dos dados enviados
            const { produto_id, quantidade, total, payment_methods } = req.body;

            // Validação mínima dos campos obrigatórios
            if (!produto_id || !quantidade) {
                return res.status(400).json({ 
                    success: false, 
                    message: " Produto e quantidade são obrigatórios!" 
                });
            }

            /**
             * Para cada código de barras presente em produto_id, buscamos as informações do produto
             * e verificamos a quantidade disponível no estoque.
             * 
             * A função Promise.all garante que todas as operações assíncronas sejam concluídas
             * antes de prosseguir.
             */
            const produtosVenda = await Promise.all(produto_id.map(async (codigo, index) => {
                // Busca as informações do produto pelo código de barras fornecido
                const produtoInfo = await obterProdutoInfo(codigo);
                if (!produtoInfo) throw new Error(` Produto com código ${codigo} não encontrado.`);

                // Query para verificar a quantidade disponível no estoque para este produto
                const queryEstoque = "SELECT quantidade FROM produtos_tb WHERE id = ?";
                const [estoqueData] = await db.query(queryEstoque, [produtoInfo.produto_id]);

                // Verifica se a quantidade disponível é menor ou igual a zero
                if (estoqueData[0].quantidade <= 0) {
                    throw new Error(` Produto "${produtoInfo.nome}" está sem estoque e não pode ser vendido.`);
                }

                // Retorna um objeto com o id, nome e a quantidade a ser vendida
                return { 
                    id: produtoInfo.produto_id, 
                    nome: produtoInfo.nome, 
                    quantidade: quantidade[index] 
                };
            }));

            // Query para inserir a venda no banco de dados
            const sqlVenda = `
                INSERT INTO venda_tb (total, payment_methods, produtos_vendidos, data_venda)
                VALUES (?, ?, ?, NOW())
            `;
            // A coluna "produtos_vendidos" armazena os produtos vendidos como string JSON
            const [resultVenda] = await db.query(sqlVenda, [total, payment_methods, JSON.stringify(produtosVenda)]);

            console.log(" Venda registrada com sucesso, ID:", resultVenda.insertId);

            /**
             * Atualiza o estoque de cada produto vendido, decrementando a quantidade vendida.
             * Para cada produto, executa a query de UPDATE na tabela produtos_tb.
             */
            await Promise.all(produtosVenda.map(async (produto) => {
                const atualizarEstoqueQuery = "UPDATE produtos_tb SET quantidade = quantidade - ? WHERE id = ?";
                await db.query(atualizarEstoqueQuery, [produto.quantidade, produto.id]);
            }));

            // Retorna uma resposta de sucesso com o ID da venda inserida
            res.status(201).json({ 
                success: true, 
                message: " Venda registrada com sucesso!", 
                vendaId: resultVenda.insertId 
            });

        } catch (error) {
            console.error(" Erro ao registrar venda:", error);
            res.status(500).json({ 
                success: false, 
                message: " Erro interno ao registrar venda. Verifique os dados." 
            });
        }
    },

    /**
     * Método para listar as últimas 10 vendas.
     * 
     * Executa uma query para buscar os registros mais recentes na tabela venda_tb,
     * ordenando-os pela data da venda em ordem decrescente.
     */
    listarUltimas: async () => {
        try {
            // Consulta que retorna as 10 vendas mais recentes
            const query = "SELECT * FROM venda_tb ORDER BY data_venda DESC LIMIT 10";
            const [resultado] = await db.query(query);
            return resultado;
        } catch (error) {
            console.error(" Erro ao listar as últimas vendas:", error);
            throw error;
        }
    }
};

// Exporta o objeto Venda para utilização dos métodos do controlador em outras partes da aplicação (por exemplo, nas rotas)
module.exports = Venda;
