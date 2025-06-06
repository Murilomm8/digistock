// models/venda.js

// Importa a conexão com o banco de dados configurada em ../config/db
const db = require('../config/db');

class Venda {
  //  Método para buscar produto pelo código de barras
  static async buscarPorCodigoBarras(codigo_barras) {
    try {
      console.log(`Buscando código de barras no banco: ${codigo_barras}`);
      // Define a query para buscar informações do produto (ID, nome, fornecedor, quantidade)
      const sql = `
        SELECT id AS produto_id, nome AS produto_nome, fornecedor_id, quantidade
        FROM produtos_tb 
        WHERE codigo_barras = ?
        LIMIT 1
      `;
      const [result] = await db.query(sql, [codigo_barras]);
      console.log(" Resultado da consulta SQL:", result);
      // Se não encontrar nenhum registro, retorna mensagem de falha
      if (!result || result.length === 0) {
        console.log(` Código ${codigo_barras} não encontrado no banco!`);
        return { success: false, message: ` Código de barras ${codigo_barras} não está cadastrado!` };
      }
      console.log(` Produto encontrado: ${result[0].produto_nome}, ID: ${result[0].produto_id}`);
      // Retorna os dados do produto encontrado encapsulados em um objeto de sucesso
      return { 
        success: true, 
        produto_id: result[0].produto_id, 
        produto_nome: result[0].produto_nome, 
        fornecedor_id: result[0].fornecedor_id,
        quantidade: result[0].quantidade
      };
    } catch (error) {
      console.error(" Erro ao buscar produto pelo código de barras:", error);
      return { success: false, message: " Erro ao buscar produto. Verifique os dados." };
    }
  }

  // 🔹 Método para atualizar o estoque do produto (permanece inalterado)
  static async atualizarEstoque(produto_id, quantidadeVendida, connection) {
    console.log(` Atualizando estoque do produto ${produto_id}, quantidade vendida: ${quantidadeVendida}`);
    // Atualiza o estoque, apenas se o estoque atual for suficiente (WHERE quantidade >= ?)
    const sql = "UPDATE produtos_tb SET quantidade = quantidade - ? WHERE id = ? AND quantidade >= ?";
    const [result] = await connection.query(sql, [quantidadeVendida, produto_id, quantidadeVendida]);
    if (result.affectedRows === 0) {
      console.log(` Estoque insuficiente para o produto ID ${produto_id}!`);
      // Se nenhuma linha for afetada, significa que o estoque não era suficiente – lança erro para interromper a transação
      throw new Error(` Estoque insuficiente para o produto ID ${produto_id}!`);
    }
    console.log(` Estoque atualizado com sucesso para o produto ID ${produto_id}`);
    return { success: true };
  }

  // 🔹 Método para cadastrar uma venda com vários produtos utilizando transação
  static async cadastrar(venda) {
    let connection;
    try {
      console.log(" Dados recebidos na requisição de venda:", venda);
      const { total, produto_id, payment_methods, quantidade } = venda;
      if (!total || !produto_id || !payment_methods || !quantidade) {
        throw new Error(" Todos os campos são obrigatórios: total, produto_id, payment_methods, quantidade.");
      }

      // Obtém uma conexão do pool para iniciar a transação
      connection = await db.getConnection();
      await connection.beginTransaction();

      // Cria um array para armazenar os produtos processados na venda
      const produtosVenda = [];
      for (let index = 0; index < produto_id.length; index++) {
        const codigo = produto_id[index];
        const qtd = Number(quantidade[index]);
        // Busca as informações do produto usando o código de barras
        const produtoInfoResponse = await Venda.buscarPorCodigoBarras(codigo);
        if (!produtoInfoResponse.success || !produtoInfoResponse.produto_id) {
          // Se o produto não for encontrado, faz rollback da transação e lança erro
          await connection.rollback();
          throw new Error(` Produto com código ${codigo} não encontrado.`);
        }
        // Verifica se o estoque disponível é suficiente para a quantidade desejada
        if (produtoInfoResponse.quantidade < qtd) {
          await connection.rollback();
          throw new Error(` Estoque insuficiente para "${produtoInfoResponse.produto_nome}" (ID ${produtoInfoResponse.produto_id}). Disponível: ${produtoInfoResponse.quantidade}, Tentativa de venda: ${qtd}`);
        }
        // Armazena os dados do produto vendido no array
        produtosVenda.push({
          id: produtoInfoResponse.produto_id,
          nome: produtoInfoResponse.produto_nome,
          quantidade: qtd
        });
      }
      console.log(" Produtos antes da inserção:", produtosVenda);

      // Usa os dados do primeiro produto como referência para os campos simplificados (produto_id, quantidade)
      const resumoProduto = produtosVenda[0];

      // Query para inserir os dados da venda no banco, incluindo a totalização, método de pagamento e os produtos vendidos em JSON
      const sqlVenda = `
        INSERT INTO venda_tb (total, produto_id, quantidade, payment_methods, produtos_vendidos, data_venda)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      const [resultVenda] = await connection.query(sqlVenda, [
        total,
        resumoProduto.id,
        resumoProduto.quantidade,
        payment_methods,
        JSON.stringify(produtosVenda)
      ]);
      console.log(" Venda registrada com sucesso, ID:", resultVenda.insertId);

      // Atualiza o estoque de cada produto vendido dentro da transação
      for (const produto of produtosVenda) {
        await Venda.atualizarEstoque(produto.id, produto.quantidade, connection);
      }

      // Faz commit da transação somente se tudo ocorrer sem erros
      await connection.commit();
      return { 
        success: true, 
        vendaId: resultVenda.insertId, 
        message: " Venda registrada com sucesso!" 
      };
    } catch (error) {
      // Em caso de erro, realiza rollback da transação para manter a integridade dos dados
      if (connection) await connection.rollback();
      console.error(" Erro ao registrar venda:", error);
      return { success: false, message: "Não foi possível registrar a venda. Verifique o estoque ou tente novamente." };
    } finally {
      // Libera a conexão para o pool, garantindo que não ocorram vazamentos de conexão
      if (connection) connection.release();
    }
  }

  // 🔹 Método para listar todas as vendas
  static async listarTodas() {
    try {
      const sql = "SELECT * FROM venda_tb ORDER BY data_venda DESC";
      const [rows] = await db.query(sql);
      return rows;
    } catch (error) {
      console.error(" Erro ao buscar vendas:", error);
      throw error;
    }
  }

  // 🔹 Método para listar as últimas 10 vendas
  static async listarUltimas() {
    try {
      const sql = "SELECT * FROM venda_tb ORDER BY data_venda DESC LIMIT 10";
      const [rows] = await db.query(sql);
      return rows;
    } catch (error) {
      console.error(" Erro ao listar últimas vendas:", error);
      throw error;
    }
  }

  // 🔹 Método para buscar uma venda específica pelo ID
  static async buscarPorId(id) {
    try {
      const sql = "SELECT * FROM venda_tb WHERE id = ?";
      const [rows] = await db.query(sql, [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error(" Erro ao buscar venda por ID:", error);
      throw error;
    }
  }
}

module.exports = Venda;
