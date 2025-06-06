// Importa o framework Express para criar as rotas da aplicação
const express = require('express');
// Cria um objeto Router para agrupar as rotas relacionadas aos produtos
const router = express.Router();

// Importa as funções do controller de produtos para manipular as operações sobre os produtos
const { 
  listarProdutos, 
  criarProduto, 
  excluirProduto, 
  atualizarProduto, 
  buscarProduto, 
  buscarProdutoPorCodigo,
  listarProdutosAbaixoEstoque  // Função nova para listar produtos abaixo do estoque mínimo
} = require('../controllers/produtosController');

// Rota GET para listar todos os produtos cadastrados.
// Quando essa rota for chamada, o método listarProdutos do controller é acionado.
router.get('/produtos', listarProdutos);

// Rota GET para buscar um produto específico com base no ID passado na URL.
// O método buscarProduto irá executar a lógica para recuperar os dados do produto.
router.get('/produtos/:id', buscarProduto);

// Rota GET para listar produtos que estão abaixo do estoque mínimo.
// O método listarProdutosAbaixoEstoque será executado para filtrar os produtos que precisam de reposição.
router.get('/produtos/baixostoque', listarProdutosAbaixoEstoque); // Nova rota adicionada

// Rota POST para cadastrar um novo produto.
// Espera que os dados do produto sejam enviados no corpo da requisição e processados pelo método criarProduto.
router.post('/produtos', criarProduto);

// Rota PUT para atualizar as informações de um produto existente, identificado pelo ID.
// O método atualizarProduto será acionado para processar a atualização.
router.put('/produtos/:id', atualizarProduto);

// Rota DELETE para excluir um produto com base no seu ID.
// O método excluirProduto é responsável por realizar essa operação no banco de dados.
router.delete('/produtos/:id', excluirProduto);

// Rota GET para buscar um produto pelo código de barras.
// O método buscarProdutoPorCodigo será acionado para recuperar as informações do produto.
router.get('/produtos/codigo_barras/:codigo_barras', buscarProdutoPorCodigo);

// Exporta o router para ser utilizado na aplicação principal, normalmente em app.js ou server.js.
module.exports = router;
