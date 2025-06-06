// Importa as variáveis de ambiente definidas no arquivo .env (localizado um nível acima)
require('dotenv').config({ path: '../.env' });

// Importa os módulos necessários
const express = require('express');
const cors = require('cors'); // Middleware para permitir CORS
const jwt = require("jsonwebtoken");

// Cria uma instância da aplicação Express
const app = express();

// Importa os arquivos de rotas para organizar a API
const produtosRoutes = require('./routes/produtosRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const fornecedorRoutes = require('./routes/fornecedorRoutes');
const vendaRoutes = require('./routes/vendaRoutes');
const entradaRoutes = require('./routes/entradaRoutes');
const avisosRoutes = require('./routes/avisosRoutes');
const authRoutes = require("./routes/authRoutes");

// Importa a conexão com o banco de dados para testar a conexão e para a rota de últimas vendas
const db = require('./config/db');

/**
 * Middleware de autenticação JWT.
 * Este middleware verifica se o token JWT enviado no cabeçalho Authorization é válido.
 * Se válido, ele adiciona os dados decodificados do usuário à requisição (req.user) e
 * permite que a requisição prossiga com a função next().
 */
function autenticarJWT(req, res, next) {
    // Extrai o token do cabeçalho (espera o formato "Bearer <token>")
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Verificando token no backend:", token);

    // Se não houver token, retorna erro 403 (Acesso negado)
    if (!token) {
        return res.status(403).json({ error: "Acesso negado! Usuário não autenticado." });
    }

    // Verifica o token usando o segredo JWT definido em .env
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Token inválido ou expirado." });
        }
        // Se o token for válido, adiciona os dados do usuário à requisição e prossegue
        req.user = decoded;
        next();
    });
}

// Aplica o middleware de autenticação a todas as rotas cujo caminho inicie com "/api/protegido"
// Dessa forma, somente usuários autenticados poderão acessá-las.
app.use("/api/protegido", autenticarJWT);

// Configuração do CORS: define quais origens, métodos e cabeçalhos são permitidos
const corsOptions = {
  origin: ["http://127.0.0.1:5500", "http://127.0.0.1:5501"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
};

app.use(cors(corsOptions));
app.use(express.json()); // Habilita o parser para JSON no corpo das requisições

// Define as rotas da API utilizando os routers importados
app.use('/api', produtosRoutes);
app.use('/api', categoriaRoutes);
app.use('/api', fornecedorRoutes);
app.use('/api/venda', vendaRoutes);
app.use('/api', entradaRoutes);
app.use('/api/avisos', avisosRoutes);
app.use("/api/auth", authRoutes);

// ------------------------------
// Rota para listar as últimas vendas
// Essa rota é separada para verificar especificamente as 10 últimas vendas registradas
// conforme o modelo e a estrutura do banco.
app.get('/api/vendas/ultimas', async (req, res) => {
  try {
    const [resultado] = await db.query('SELECT * FROM vendas ORDER BY data_venda DESC LIMIT 10');
    console.log('Endpoint /api/vendas/ultimas acessado.');
    return res.status(200).json({ vendas: resultado });
  } catch (error) {
    console.error("Erro ao consultar as últimas vendas:", error.message);
    return res.status(500).json({ error: "Erro ao consultar as últimas vendas." });
  }
});

// Define a porta em que o servidor irá rodar, usando a variável PORT do ambiente ou 3000 como padrão
const PORT = process.env.PORT || 3000;

// Inicializa o servidor na porta definida e testa a conexão com o banco de dados
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  try {
    // Obtém uma conexão do pool para testar a conexão com o banco de dados
    const connection = await db.getConnection();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    connection.release(); // Libera a conexão imediatamente após o teste
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error.message);
  }
});
