// Importa a conexão com o banco de dados e outros módulos necessários
const db = require('../config/db'); // Certifique-se de que está importando corretamente a conexão
const Entrada = require('../models/entrada'); // Modelo que contém os métodos para manipulação de entrada
const { entradaValidation } = require('../utils/validation'); // Importa a função para validação dos dados da entrada

// Objeto que agrupa todas as funções (endpoints) relacionadas às entradas
const EntradaController = {
    
    // Cadastrar entrada de produto
    // Esta função é responsável por registrar uma nova entrada no estoque
    cadastrar: async (req, res) => {
        try {
            console.log("Dados recebidos para entrada:", req.body);

            //  Validação dos dados utilizando a função entradaValidation.
            // Se houver erro na validação, retorna um erro 400 (Bad Request) com a mensagem detalhada.
            const { error } = entradaValidation(req.body);
            if (error) {
                return res.status(400).json({ error: `Erro na validação: ${error.details[0].message}` });
            }

            // Extraindo os campos necessários do corpo da requisição
            const { produto_id, codigo_barras, fornecedor_id, quantidade, preco_custo } = req.body;

            //  Verifica se o produto existe antes de registrar a entrada.
            // Executa uma query simples que busca o produto pelo seu id na tabela "produtos_tb".
            const produtoCheckSql = "SELECT id FROM produtos_tb WHERE id = ?";
            const [produtoExiste] = await db.query(produtoCheckSql, [produto_id]);

            // Se o array retornado estiver vazio, significa que o produto não foi encontrado.
            if (produtoExiste.length === 0) {
                return res.status(404).json({ error: "Produto não encontrado no banco de dados." });
            }

            //  Registra a entrada no banco chamando o método "cadastrar" do model Entrada.
            // O método deve realizar a inserção dos dados e retornar o id da nova entrada criada.
            const entradaId = await Entrada.cadastrar({ produto_id, codigo_barras, fornecedor_id, quantidade, preco_custo });

            // Retorna uma resposta em JSON confirmando o sucesso na operação
            res.json({ message: "Entrada registrada com sucesso! Estoque atualizado!", entradaId });
        } catch (error) {
            // Caso ocorra qualquer erro, ele é logado no console e uma resposta de erro 500 é enviada
            console.error("Erro ao registrar entrada:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // Listar todas as entradas
    // Esta função busca e retorna todas as entradas registradas
    listarTodas: async (req, res) => {
        try {
            // Chama o método do model que retorna todas as entradas do banco
            const entradas = await Entrada.listarTodas();
            res.json(entradas);
        } catch (error) {
            console.error("Erro ao buscar entradas:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar entrada por ID
    // Retorna os detalhes de uma entrada específica com base no ID enviado na URL
    buscarPorId: async (req, res) => {
        try {
            // Extrai o id da entrada dos parâmetros da rota
            const { id } = req.params;
            // Chama o método do model que retorna a entrada pelo id
            const entrada = await Entrada.buscarPorId(id);

            // Se a entrada não for encontrada, retorna status 404
            if (!entrada) {
                return res.status(404).json({ error: "Entrada não encontrada." });
            }

            // Retorna os dados da entrada, incluindo tratamento de campos ausentes (uso do operador Nullish coalescing)
            res.json({
                id: entrada.id,
                codigo_barras: entrada.codigo_barras,
                produto_id: entrada.produto_id,
                produto_nome: entrada.produto_nome ?? "Produto não encontrado",
                fornecedor_id: entrada.fornecedor_id,
                fornecedor_nome: entrada.fornecedor_nome ?? "Fornecedor não encontrado",
                quantidade: entrada.quantidade,
                preco_custo: entrada.preco_custo,
                data_entrada: entrada.data_entrada
            });
        } catch (error) {
            console.error("Erro ao buscar entrada:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar entrada por código de barras
    // Procura por uma entrada com base no código de barras informado na URL
    buscarPorCodigoBarras: async (req, res) => {
        try {
            // Extrai o código de barras dos parâmetros da rota
            const { codigo_barras } = req.params;
            // Chama o método do model que busca a entrada utilizando o código de barras
            const entrada = await Entrada.buscarPorCodigoBarras(codigo_barras);

            // Se não for encontrada nenhuma entrada com o código informado, retorna status 404
            if (!entrada) {
                return res.status(404).json({ error: "Nenhuma entrada encontrada para esse código de barras." });
            }

            // Retorna os detalhes da entrada encontrada, utilizando fallback para campos não localizados
            res.json({
                id: entrada.id,
                codigo_barras: entrada.codigo_barras,
                produto_id: entrada.produto_id,
                produto_nome: entrada.produto_nome ?? "Produto não encontrado",
                fornecedor_id: entrada.fornecedor_id,
                fornecedor_nome: entrada.fornecedor_nome ?? "Fornecedor não encontrado",
                quantidade: entrada.quantidade,
                preco_custo: entrada.preco_custo,
                data_entrada: entrada.data_entrada
            });
        } catch (error) {
            console.error("Erro ao buscar entrada pelo código de barras:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // Editar entrada de produto
    // Atualiza os dados de uma entrada existente baseado no id informado
    editarEntrada: async (req, res) => {
        try {
            // Extrai o id da entrada a ser editada dos parâmetros da rota
            const { id } = req.params;
            // Chama o método de edição presente no model Entrada, passando o id e os novos dados
            const atualizado = await Entrada.editar(id, req.body);

            // Se a edição ocorrer com sucesso, informa com mensagem de confirmação
            if (atualizado) {
                res.json({ message: "Entrada editada com sucesso!" });
            } else {
                // Se não encontrar a entrada para atualizar, retorna status 404
                res.status(404).json({ error: "Entrada não encontrada." });
            }
        } catch (error) {
            console.error("Erro ao editar entrada:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // Excluir entrada de produto
    // Remove uma entrada com base no id informado na URL
    excluirEntrada: async (req, res) => {
        try {
            // Extrai o id da entrada dos parâmetros da rota
            const { id } = req.params;
            // Chama o método do model que faz a exclusão da entrada no banco de dados
            const deletado = await Entrada.excluir(id);
            if (deletado) {
                res.json({ message: "Entrada excluída com sucesso!" });
            } else {
                // Se a entrada não existir, retorna um erro 404
                res.status(404).json({ error: "Entrada não encontrada." });
            }
        } catch (error) {
            console.error("Erro ao excluir entrada:", error);
            res.status(500).json({ error: error.message });
        }
    }
};

// Exporta o objeto EntradaController para que possa ser utilizado em outras partes da aplicação
module.exports = EntradaController;
