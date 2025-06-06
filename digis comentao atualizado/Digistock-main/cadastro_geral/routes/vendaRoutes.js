// routes/vendaRoutes.js

// Importa o framework Express para definir as rotas de venda
const express = require("express");
// Cria um objeto Router para gerenciar os endpoints relacionados às vendas
const router = express.Router();
// Importa o model de Venda, responsável pela lógica de processamento das vendas
const Venda = require("../models/venda");

// 🔹 Rota para buscar um produto pelo código de barras
router.get("/api/produtos/codigo_barras/:codigo_barras", async (req, res) => {
  try {
    const { codigo_barras } = req.params;
    console.log(`📌 Recebendo requisição para código de barras: ${codigo_barras}`);

    // Busca informações do produto no banco de dados
    const produto = await Venda.buscarPorCodigoBarras(codigo_barras);

    // Se o produto não for encontrado, retorna um erro 404
    if (!produto) {
      return res.status(404).json({ 
        success: false, 
        message: `❌ Código de barras ${codigo_barras} não encontrado no banco de dados!`
      });
    }

    // Retorna os dados do produto encontrado
    res.status(200).json({ 
      success: true, 
      produto_id: produto.produto_id, 
      produto_nome: produto.produto_nome, 
      fornecedor_id: produto.fornecedor_id 
    });
  } catch (error) {
    console.error("❌ Erro ao buscar produto pelo código de barras:", error);
    res.status(500).json({ 
      success: false, 
      message: "❌ Erro interno ao buscar produto. Verifique os dados." 
    });
  }
});

// 🔹 Rota para registrar uma venda
router.post("/", async (req, res) => {
  try {
    console.log(`📌 Dados recebidos na venda:`, req.body);

    // Chama o método de cadastro de venda no model
    const vendaRegistrada = await Venda.cadastrar(req.body);

    // Se a venda não for registrada corretamente, retorna erro 400
    if (!vendaRegistrada || !vendaRegistrada.vendaId) {
      return res.status(400).json({ 
        success: false, 
        message: "❌ Erro ao registrar a venda!" 
      });
    }

    // Retorna um status 201 indicando sucesso na venda
    res.status(201).json({ 
      success: true, 
      message: "✅ Venda registrada com sucesso!", 
      vendaId: vendaRegistrada.vendaId 
    });
  } catch (error) {
    console.error("❌ Erro ao registrar venda:", error);
    res.status(500).json({ 
      success: false, 
      message: "❌ Erro interno ao registrar venda. Verifique os dados." 
    });
  }
});

// 🔹 Rota para listar as últimas vendas
router.get("/ultimas", async (req, res) => {
  try {
    // Chama a função que lista as últimas vendas
    const vendas = await Venda.listarUltimas();
    
    // Se não houver vendas registradas, retorna erro 404
    if (!vendas || vendas.length === 0) {
      return res.status(404).json({ success: false, message: "Nenhuma venda encontrada." });
    }

    console.log("📌 Endpoint /ultimas acessado.");
    // Retorna as vendas encontradas com status 200
    res.status(200).json({ success: true, vendas });
  } catch (error) {
    console.error("❌ Erro ao listar as últimas vendas:", error);
    res.status(500).json({ success: false, message: "Erro interno ao listar as últimas vendas." });
  }
});

// Exporta o router para que possa ser integrado na aplicação principal
module.exports = router;
