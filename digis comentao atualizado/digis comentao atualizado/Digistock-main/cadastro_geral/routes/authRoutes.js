// Importa o framework Express para criar as rotas
const express = require("express");
// Importa o bcrypt para criptografar e comparar senhas
const bcrypt = require("bcryptjs");
// Importa o jsonwebtoken para gerar tokens de autenticação
const jwt = require("jsonwebtoken");
// Importa a conexão com o banco de dados configurada no arquivo db.js
const db = require("../config/db");

// Cria um objeto Router para definir as rotas de autenticação
const router = express.Router();
// Define o segredo para assinatura dos tokens JWT. Se a variável de ambiente não estiver definida,
// usa um segredo default (não recomendado para produção)
const jwtSecret = process.env.JWT_SECRET || "segredo_super_secreto";

/**
 * Rota para cadastro de usuário.
 * Endpoint: POST /register
 *
 * Espera no corpo da requisição:
 * - nome: Nome do usuário.
 * - senha: Senha do usuário.
 *
 * O fluxo inclui:
 * 1. Validação básica para verificar se os campos foram enviados.
 * 2. Criptografia da senha usando bcrypt.
 * 3. Inserção do usuário na tabela usuario_tb.
 * 4. Retorno de uma resposta com status 201 em caso de sucesso ou erro apropriado.
 */
router.post("/register", async (req, res) => {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
        return res.status(400).json({ error: "Nome e senha são obrigatórios." });
    }

    try {
        // Gera um hash da senha com 10 salt rounds
        const hashedPassword = await bcrypt.hash(senha, 10);
        // Insere o novo usuário na tabela do banco com a senha criptografada
        await db.query(
            "INSERT INTO usuario_tb (nome, senha) VALUES (?, ?)", 
            [nome, hashedPassword]
        );
        // Responde com mensagem de sucesso
        res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error.message);
        res.status(500).json({ error: "Erro ao cadastrar usuário." });
    }
});

/**
 * Rota para login de usuário.
 * Endpoint: POST /login
 *
 * Espera no corpo da requisição:
 * - nome: Nome do usuário.
 * - senha: Senha do usuário.
 *
 * O fluxo inclui:
 * 1. Validação dos campos.
 * 2. Busca no banco do usuário pelo nome.
 * 3. Comparação da senha informada com a senha armazenada (hash) usando bcrypt.compare.
 * 4. Geração de um token JWT se a senha estiver correta.
 * 5. Retorno do token para o cliente.
 */
router.post("/login", async (req, res) => {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
        return res.status(400).json({ error: "Nome e senha são obrigatórios." });
    }

    try {
        // Busca o usuário pelo nome
        const [results] = await db.query("SELECT id, senha FROM usuario_tb WHERE nome = ?", [nome]);

        // Se o usuário não for encontrado, retorna erro de autenticação
        if (results.length === 0) {
            return res.status(401).json({ error: "Usuário ou senha incorretos." });
        }

        // Compara a senha informada com o hash armazenado no banco
        const senhaCorreta = await bcrypt.compare(senha, results[0].senha);

        if (senhaCorreta) {
            // Caso a senha esteja correta, gera um token JWT com validade de 2 horas.
            // O payload do token contém o id e o nome do usuário.
            const token = jwt.sign(
                { id: results[0].id, nome },
                process.env.JWT_SECRET,
                { expiresIn: "2h" }
            );

            console.log("Gerando token:", token); // Debug para confirmação no servidor
            return res.status(200).json({ message: "Login bem-sucedido!", token });
        } else {
            // Senha incorreta: retorna erro de autenticação
            return res.status(401).json({ error: "Usuário ou senha incorretos." });
        }
    } catch (error) {
        console.error("Erro ao realizar login:", error.message);
        res.status(500).json({ error: "Erro ao realizar login." });
    }
});

// Exporta o objeto router com as rotas definidas para ser utilizado no arquivo principal da aplicação
module.exports = router;
