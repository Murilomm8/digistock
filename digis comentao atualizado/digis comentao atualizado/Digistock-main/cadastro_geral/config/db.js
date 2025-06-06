// Importa o módulo mysql2 com suporte a Promises.
// Isso permite que as operações de conexão e consulta no MySQL sejam realizadas de forma assíncrona,
// melhorando a performance e a legibilidade do código por meio do async/await.
const mysql = require('mysql2/promise'); 

// Cria um "pool" de conexões com o banco de dados MySQL.
// Um pool é uma coleção gerenciada de conexões que podem ser reutilizadas sempre que uma operação no BD
// for executada, evitando a sobrecarga de criar e destruir conexões repetidamente.
const db = mysql.createPool({ 
    host: 'localhost',             // Endereço do servidor do banco de dados (neste caso, o mesmo servidor local).
    user: 'root',                  // Nome do usuário usado para acessar o banco. Geralmente, "root" é o padrão.
    password: '',                  // Senha do usuário do banco.
    database: 'bd_digistock',      // Nome do banco de dados que será utilizado pela aplicação.
    waitForConnections: true,      // Habilita a espera por conexões quando o número máximo estiver sendo utilizado.
    connectionLimit: 10,           // Define o número máximo de conexões simultâneas que o pool pode manter aberto.
    queueLimit: 0                  // Define o limite da fila de requisições aguardando uma conexão. 
                                   // O valor 0 indica que não há limite (ou seja, a fila aceita um número indefinido de requisições).
});

// Exporta a instância do pool para ser utilizada em outros módulos do projeto.
// Dessa maneira, outros arquivos podem simplesmente importar este módulo e executar operações no banco de dados
// sem a necessidade de reconfigurar ou reconectar.
module.exports = db;
