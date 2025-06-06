// routes/avisosRoutes.js

// Importa o Express para criação de rotas e a conexão com o banco de dados, se necessário.
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Avisos estáticos definidos em um objeto. Em uma aplicação real, esses dados podem ser provenientes de um banco de dados.
const avisos = {
  sistema: ["Atualização v2.1 disponível! Reinicie o sistema para aplicar."],
  estoque: ["Produtos com estoque crítico: Mouse Sem Fio (3 unidades)."],
  geral: ["Manutenção programada para 25/10 às 22h."]
};

// Endpoint para retornar os produtos com estoque abaixo do mínimo.
// Essa rota foi posicionada antes de outras rotas de categoria para evitar conflitos de path.
router.get('/produtos-bajos', async (req, res) => {
  try {
    // Consulta SQL para buscar produtos cujo estoque atual é menor que o estoque mínimo.
    const sql = `
      SELECT 
        p.id, 
        p.nome, 
        p.codigo_barras, 
        p.quantidade, 
        p.estoque_min,
        COALESCE(c.nome_categoria, 'Sem categoria') AS categoria,
        COALESCE(f.nome, 'Sem fornecedor') AS fornecedor
      FROM produtos_tb p
      LEFT JOIN categoria_tb c ON p.categoria_id = c.id
      LEFT JOIN fornecedor_tb f ON p.fornecedor_id = f.id
      WHERE p.quantidade < p.estoque_min
      ORDER BY p.nome ASC
    `;
    const [produtos] = await db.query(sql);
    
    // Caso não haja produtos a serem reportados, retorna status 404.
    if (produtos.length === 0) {
      return res.status(404).json({ error: "Nenhum produto abaixo do estoque mínimo encontrado." });
    }
    
    // Retorna os resultados encontrados.
    res.json(produtos);
  } catch (error) {
    console.error("Nenhum produto abaixo do estoque mínimo encontrado.", error);
    res.status(500).json({ error: "Erro interno ao buscar produtos." });
  }
});

// GET /api/avisos
// Retorna todos os avisos estáticos cadastrados.
router.get('/', (req, res) => {
  res.json(avisos);
});

// GET /api/avisos/:categoria
// Retorna os avisos de uma categoria específica.
// Exemplo: /api/avisos/sistema retornará os avisos da categoria "sistema".
router.get('/:categoria', (req, res) => {
  const categoria = req.params.categoria;
  if (avisos.hasOwnProperty(categoria)) {
    return res.json({ categoria, avisos: avisos[categoria] });
  }
  return res.status(404).json({ error: "Categoria de aviso não encontrada." });
});

// POST /api/avisos
// Atualiza (redefine) todos os avisos estáticos com base no JSON recebido.
// Esse endpoint espera as categorias (sistema, estoque, geral) e redefine seus respectivos arrays.
router.post('/', (req, res) => {
  const { sistema, estoque, geral } = req.body;
  if (sistema) avisos.sistema = Array.isArray(sistema) ? sistema : [sistema];
  if (estoque) avisos.estoque = Array.isArray(estoque) ? estoque : [estoque];
  if (geral) avisos.geral = Array.isArray(geral) ? geral : [geral];
  res.json({ message: "Avisos atualizados com sucesso", avisos });
});

// PUT /api/avisos/:categoria
// Atualiza os avisos de uma categoria específica.
// Esse endpoint espera receber, no corpo da requisição, um array na propriedade "avisos".
router.put('/:categoria', (req, res) => {
  const categoria = req.params.categoria;
  if (!avisos.hasOwnProperty(categoria)) {
    return res.status(404).json({ error: "Categoria de aviso não encontrada." });
  }
  const { avisos: novosAvisos } = req.body;
  if (!Array.isArray(novosAvisos)) {
    return res.status(400).json({ error: "Os avisos devem ser enviados em um array." });
  }
  avisos[categoria] = novosAvisos;
  res.json({ message: `Avisos da categoria ${categoria} atualizados.`, avisos });
});

// DELETE /api/avisos/:categoria
// Remove os avisos de uma categoria (ou seja, esvazia o array de avisos para essa categoria).
router.delete('/:categoria', (req, res) => {
  const categoria = req.params.categoria;
  if (!avisos.hasOwnProperty(categoria)) {
    return res.status(404).json({ error: "Categoria de aviso não encontrada." });
  }
  avisos[categoria] = [];
  res.json({ message: `Avisos da categoria ${categoria} removidos.`, avisos });
});

module.exports = router;
