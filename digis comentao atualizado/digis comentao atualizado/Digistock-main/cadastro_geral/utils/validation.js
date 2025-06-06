// Importa a biblioteca Joi, que é utilizada para criar esquemas de validação de dados.
const Joi = require('joi');

/**
 * Validação dos dados de um produto.
 * Cria um esquema que define:
 * - nome: uma string de até 100 caracteres (obrigatório);
 * - codigo_barras: uma string de até 50 caracteres (obrigatório);
 * - categoria_id: um número inteiro (obrigatório);
 * - fornecedor_id: um número inteiro (obrigatório);
 * - estoque_min: um número inteiro mínimo 0 (obrigatório);
 * - quantidade: um número inteiro mínimo 0 (obrigatório);
 * - preco: um número com até duas casas decimais, mínimo 0 (obrigatório).
 *
 * @param {Object} data - Os dados do produto a serem validados.
 * @returns {Object} - Retorna o resultado da validação.
 */
const productValidation = (data) => {
    const schema = Joi.object({
        nome: Joi.string().max(100).required(),
        codigo_barras: Joi.string().max(50).required(),
        categoria_id: Joi.number().integer().required(),
        fornecedor_id: Joi.number().integer().required(),
        estoque_min: Joi.number().integer().min(0).required(),
        quantidade: Joi.number().integer().min(0).required(),
        preco: Joi.number().precision(2).min(0).required()
    });

    return schema.validate(data);
};

/**
 * Validação dos dados de um fornecedor.
 * O esquema define que:
 * - nome: deve ser uma string de no máximo 100 caracteres (obrigatório);
 * - telefone: deve ser uma string de no máximo 15 caracteres (obrigatório);
 * - email: deve ser um email válido (obrigatório);
 * - endereco: é uma string de no máximo 255 caracteres (obrigatório);
 * - cep: deve ter exatamente 9 caracteres (obrigatório);
 * - bairro: uma string de até 100 caracteres (obrigatório);
 * - cidade: uma string de até 100 caracteres (obrigatório).
 *
 * @param {Object} data - Os dados do fornecedor a serem validados.
 * @returns {Object} - Retorna o resultado da validação.
 */
const fornecedorValidation = (data) => {
    const schema = Joi.object({
        nome: Joi.string().max(100).required(),
        telefone: Joi.string().max(15).required(),
        email: Joi.string().email().required(),
        endereco: Joi.string().max(255).required(),
        cep: Joi.string().length(9).required(),
        bairro: Joi.string().max(100).required(),
        cidade: Joi.string().max(100).required()
    });

    return schema.validate(data);
};

/**
 * Validação dos dados de uma categoria.
 * O esquema exige que:
 * - nome_categoria: seja uma string de até 100 caracteres e seja obrigatório.
 *
 * @param {Object} data - Os dados da categoria a serem validados.
 * @returns {Object} - Retorna o resultado da validação.
 */
const categoriaValidation = (data) => {
    const schema = Joi.object({
        nome_categoria: Joi.string().max(100).required()
    });

    return schema.validate(data);
};

/**
 * Validação dos dados para uma entrada de produto.
 * Definindo que:
 * - produto_id: deve ser um número inteiro (obrigatório);
 * - codigo_barras: uma string de até 50 caracteres (obrigatório);
 * - fornecedor_id: um número inteiro (obrigatório);
 * - quantidade: um número inteiro mínimo de 1 (obrigatório);
 * - preco_custo: um número com precisão de 2 casas decimais, mínimo 0 (obrigatório).
 *
 * @param {Object} data - Os dados da entrada de produto a serem validados.
 * @returns {Object} - Retorna o resultado da validação.
 */
const entradaValidation = (data) => {
    const schema = Joi.object({
        produto_id: Joi.number().integer().required(),
        codigo_barras: Joi.string().max(50).required(),
        fornecedor_id: Joi.number().integer().required(),
        quantidade: Joi.number().integer().min(1).required(),
        preco_custo: Joi.number().precision(2).min(0).required()
    });

    return schema.validate(data);
};

// Exporta todas as funções de validação para serem usadas em outros módulos da aplicação.
module.exports = {
    productValidation, 
    fornecedorValidation, 
    categoriaValidation, 
    entradaValidation
};
