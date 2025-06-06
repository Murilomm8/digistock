// models/entrada.js

// Importa a conexão com o banco de dados configurada em ../config/db
const db = require('../config/db');

const Entrada = {
    // Cadastrar nova entrada e atualizar o estoque do produto
    cadastrar: async ({ produto_id, codigo_barras, fornecedor_id, quantidade, preco_custo }) => {
        try {
            // Insere a nova entrada na tabela `entrada_produto_tb` com a data atual (NOW())
            const sqlEntrada = `
                INSERT INTO entrada_produto_tb (produto_id, codigo_barras, fornecedor_id, quantidade, data_entrada, preco_custo)
                VALUES (?, ?, ?, ?, NOW(), ?)
            `;
            await db.query(sqlEntrada, [produto_id, codigo_barras, fornecedor_id, quantidade, preco_custo]);

            // Atualiza a quantidade do produto no estoque — incrementa a quantidade com a da entrada
            const sqlAtualizarEstoque = `
                UPDATE produtos_tb 
                SET quantidade = quantidade + ?
                WHERE id = ?
            `;
            await db.query(sqlAtualizarEstoque, [quantidade, produto_id]);

            return true;
        } catch (error) {
            console.error("Erro ao registrar entrada e atualizar estoque:", error);
            throw error;
        }
    },

    // Listar todas as entradas cadastradas
    listarTodas: async () => {
        try {
            // Consulta para retornar as entradas unindo com os dados dos produtos e fornecedores
            const sql = `
                SELECT ep.id, ep.codigo_barras, p.nome AS produto_nome, f.nome AS fornecedor_nome, 
                       ep.quantidade, ep.data_entrada, ep.preco_custo 
                FROM entrada_produto_tb ep 
                LEFT JOIN produtos_tb p ON ep.produto_id = p.id  
                LEFT JOIN fornecedor_tb f ON ep.fornecedor_id = f.id 
                ORDER BY ep.data_entrada DESC
            `;
            const [result] = await db.query(sql);
            // Retorna os resultados encontrados ou um array vazio se nenhum registro for encontrado
            return result.length > 0 ? result : [];
        } catch (error) {
            console.error("Erro ao buscar entradas:", error);
            throw error;
        }
    },

    // Buscar uma entrada específica pelo seu ID
    buscarPorId: async (id) => {
        try {
            // Consulta para buscar uma entrada com base no seu ID, incluindo informações de produto e fornecedor
            const sql = `
                SELECT ep.id, ep.codigo_barras, p.id AS produto_id, p.nome AS produto_nome, 
                       f.id AS fornecedor_id, f.nome AS fornecedor_nome, ep.quantidade, 
                       ep.data_entrada, ep.preco_custo 
                FROM entrada_produto_tb ep 
                LEFT JOIN produtos_tb p ON ep.produto_id = p.id  
                LEFT JOIN fornecedor_tb f ON ep.fornecedor_id = f.id 
                WHERE ep.id = ?
            `;
            const [result] = await db.query(sql, [id]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error("Erro ao buscar entrada pelo ID:", error);
            throw error;
        }
    },

    // Buscar entrada por código de barras
    buscarPorCodigoBarras: async (codigo_barras) => {
        try {
            // Consulta para encontrar um produto com o código de barras especificado
            // Retorna informações de identificação e nome tanto do produto quanto do fornecedor
            const sql = `
                SELECT p.id AS produto_id, p.nome AS produto_nome, 
                       f.id AS fornecedor_id, f.nome AS fornecedor_nome  
                FROM produtos_tb p  
                LEFT JOIN fornecedor_tb f ON p.fornecedor_id = f.id  
                WHERE p.codigo_barras = ?
                LIMIT 1
            `;
            const [result] = await db.query(sql, [codigo_barras]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error("Erro ao buscar produto pelo código de barras:", error);
            throw error;
        }
    },

    // Editar entrada sem afetar a quantidade total do produto de forma errônea
    editar: async (id, { produto_id, codigo_barras, fornecedor_id, quantidade, preco_custo }) => {
        try {
            // Busca a entrada original para determinar a quantidade anterior
            const verificarSql = "SELECT produto_id, quantidade FROM entrada_produto_tb WHERE id = ?";
            const [entradaAntiga] = await db.query(verificarSql, [id]);

            if (entradaAntiga.length === 0) {
                throw new Error("Entrada não encontrada para edição.");
            }

            // Armazena a quantidade antiga e o ID do produto (original)
            const quantidadeAntiga = entradaAntiga[0].quantidade;
            const produtoId = entradaAntiga[0].produto_id;

            // Atualiza os dados da entrada na tabela `entrada_produto_tb`
            const sql = `
                UPDATE entrada_produto_tb 
                SET produto_id = ?, codigo_barras = ?, fornecedor_id = ?, quantidade = ?, preco_custo = ?
                WHERE id = ?
            `;
            await db.query(sql, [produto_id, codigo_barras, fornecedor_id, quantidade, preco_custo, id]);

            // Calcula a diferença entre a nova quantidade e a quantidade antiga
            const diferencaQuantidade = quantidade - quantidadeAntiga;

            // Ajusta o estoque do produto: incrementa (se diferença for positiva) ou decrementa (se for negativa)
            const sqlAtualizarEstoque = `
                UPDATE produtos_tb 
                SET quantidade = quantidade + ?
                WHERE id = ?
            `;
            // Usa o ID do produto original para atualizar o estoque
            await db.query(sqlAtualizarEstoque, [diferencaQuantidade, produtoId]);

            return true;
        } catch (error) {
            console.error("Erro ao editar entrada e ajustar estoque:", error);
            throw error;
        }
    },

    // Excluir entrada e remover o valor correspondente do estoque
    excluir: async (id) => {
        try {
            // Busca a entrada a ser excluída para recuperar a quantidade e o ID do produto
            const verificarSql = "SELECT produto_id, quantidade FROM entrada_produto_tb WHERE id = ?";
            const [entrada] = await db.query(verificarSql, [id]);

            if (entrada.length === 0) {
                throw new Error("Entrada não encontrada para exclusão.");
            }

            // Remove a entrada da tabela `entrada_produto_tb`
            const sqlExcluir = "DELETE FROM entrada_produto_tb WHERE id = ?";
            await db.query(sqlExcluir, [id]);

            // Atualiza o estoque do produto: subtrai a quantidade que estava registrada na entrada excluída
            const sqlAtualizarEstoque = `
                UPDATE produtos_tb 
                SET quantidade = quantidade - ?
                WHERE id = ?
            `;
            await db.query(sqlAtualizarEstoque, [entrada[0].quantidade, entrada[0].produto_id]);

            return true;
        } catch (error) {
            console.error("Erro ao excluir entrada e atualizar estoque:", error);
            throw error;
        }
    }
};

module.exports = Entrada;
