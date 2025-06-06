// Importa o Express para a criação das rotas da aplicação.
const express = require('express');
// Cria um objeto Router para agrupar as rotas referentes ao fornecedor.
const router = express.Router();

// Importa o controller de fornecedores, responsável por processar a lógica de negócio.
const fornecedorController = require('../controllers/fornecedorController');

// Rota GET para listar todos os fornecedores.
// Quando essa rota for chamada, o método listarFornecedores do controller será executado.
router.get('/fornecedores', fornecedorController.listarFornecedores); 

// Rota GET para buscar um fornecedor pelo ID, passado como parâmetro na URL.
// O método buscarFornecedorPorId é responsável por procurar e retornar os dados do fornecedor.
router.get('/fornecedores/:id', fornecedorController.buscarFornecedorPorId);

// Rota POST para cadastrar um novo fornecedor.
// Espera que os dados do fornecedor sejam enviados no corpo da requisição.
router.post('/fornecedores', fornecedorController.cadastrarFornecedor);

// Rota PUT para atualizar informações de um fornecedor existente, identificado pelo ID na URL.
// O método atualizarFornecedor trata a lógica de validação e atualização dos dados.
router.put('/fornecedores/:id', fornecedorController.atualizarFornecedor);

// Rota DELETE para excluir um fornecedor com base no seu ID passado na URL.
// O método excluirFornecedor lida com a remoção do registro no banco de dados.
router.delete('/fornecedores/:id', fornecedorController.excluirFornecedor);

// Exporta o router para que as rotas definidas possam ser utilizadas na aplicação principal.
module.exports = router;
