// Importa o Express para configurar as rotas
const express = require('express');
// Cria um router para agrupar os endpoints relacionados às categorias
const router = express.Router();

// Importa as funções do controller de categorias para manipulação dos dados
const { createCategoria, getCategorias, updateCategoria, deleteCategoria } = require('../controllers/categoriaController');

// Define uma rota GET para listar todas as categorias
router.get('/categorias', getCategorias);

// Define uma rota POST para cadastrar uma nova categoria
router.post('/categorias', createCategoria);

// Define uma rota PUT para atualizar uma categoria existente, identificada pelo parâmetro ":id"
router.put('/categorias/:id', updateCategoria);

// Define uma rota DELETE para excluir uma categoria com base no ID fornecido na URL
router.delete('/categorias/:id', deleteCategoria);

// Exporta o router para que ele possa ser utilizado na aplicação principal (ex.: app.js ou server.js)
module.exports = router;
