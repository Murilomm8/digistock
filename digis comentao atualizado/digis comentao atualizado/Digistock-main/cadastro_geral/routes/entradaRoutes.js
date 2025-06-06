// Importa o Express para configurar as rotas e cria um objeto Router
const express = require('express');
const router = express.Router();

// Importa o controller de entrada, que contém a lógica para cadastrar, listar, editar, 
// excluir e buscar entradas.
const EntradaController = require('../controllers/entradaController');

// Rota POST para cadastrar uma nova entrada de produto.
// Quando essa rota é acessada, a função cadastrar definida em EntradaController é executada.
router.post('/entrada', EntradaController.cadastrar);

// Rota GET para listar todas as entradas cadastradas.
// Essa rota retorna todas as entradas registradas no sistema.
router.get('/entradas', EntradaController.listarTodas);

// Rota PUT para editar uma entrada existente.
// O parâmetro ":id" indica qual entrada deve ser atualizada.
router.put('/entrada/:id', EntradaController.editarEntrada);

// Rota DELETE para excluir uma entrada com base no ID informado na URL.
router.delete('/entrada/:id', EntradaController.excluirEntrada);

// Rota GET para buscar uma entrada específica pelo ID.
// Se a entrada existir, seus dados são retornados.
router.get('/entrada/:id', EntradaController.buscarPorId);

// Rota GET para buscar uma entrada específica utilizando o código de barras do produto.
// O parâmetro ":codigo_barras" é usado para identificar o produto em questão.
router.get('/entrada/codigo_barras/:codigo_barras', EntradaController.buscarPorCodigoBarras);

// Exporta o router para que as rotas definidas aqui possam ser integradas na aplicação principal.
module.exports = router;
