DigiStock - Sistema de Gerenciamento de Estoque
Sobre o Projeto
O DigiStock é um sistema de gerenciamento de estoque desenvolvido com tecnologias modernas como Node.js, Express, MySQL, JWT e HTML/CSS/JavaScript.
O sistema permite o cadastro, edição e exclusão de produtos, fornecedores e categorias, além do registro de entradas e vendas de forma segura e prática.

Funcionalidades
Autenticação JWT: Login seguro com criptografia de senha.

Gerenciamento de Produtos: Cadastro, edição, listagem e exclusão.

Gerenciamento de Categorias: Criar, editar e excluir categorias de produtos.

Controle de Entradas: Registro e histórico de entradas de produtos.

Gerenciamento de Fornecedores: Controle completo de fornecedores.

Registro de Vendas: Listagem e geração de relatórios.

Proteção de Rotas: Acesso restrito apenas para usuários autenticados.

Segurança: Helmet e Rate Limiting para maior proteção.

Tecnologias Utilizadas
Back-end
Node.js

Express.js

MySQL

JWT (JSON Web Token)

Helmet (Segurança HTTP)

Bcrypt.js (Criptografia de Senhas)

Rate Limiting (Proteção contra força bruta)

Front-end
HTML5

CSS3

JavaScript (Vanilla JS)

Instalação e Configuração
bash
Copiar
Editar
# Clone o repositório
git clone https://github.com/seuusuario/digistock.git
cd digistock

# Instale as dependências
npm install
🔧 Configure o .env
ini
Copiar
Editar
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha
DB_NAME=bd_digistock
JWT_SECRET=sua_chave_secreta
Banco de Dados
Certifique-se de que o MySQL está rodando.

Execute os comandos SQL para criar as tabelas (usuario_tb, produtos_tb, fornecedor_tb, etc.).

▶Inicie o servidor HTTPS
bash
Copiar
Editar
node serverLogin.js
Rotas da API
Autenticação
Método	Rota	Descrição
POST	/register	Cadastro de usuário
POST	/login	Login e geração de token

Produtos
Método	Rota	Descrição
GET	/api/produtos	Listar produtos
POST	/api/produtos	Cadastrar produto
PUT	/api/produtos/:id	Atualizar produto
DELETE	/api/produtos/:id	Remover produto

Fornecedores
Método	Rota	Descrição
GET	/api/fornecedores	Listar fornecedores
POST	/api/fornecedores	Cadastrar fornecedor
PUT	/api/fornecedores/:id	Atualizar fornecedor
DELETE	/api/fornecedores/:id	Remover fornecedor

Entradas
Método	Rota	Descrição
GET	/api/entradas	Listar entradas
POST	/api/entrada	Registrar entrada
PUT	/api/entrada/:id	Editar entrada
DELETE	/api/entrada/:id	Remover entrada

Como Usar
Faça login na rota /login para obter um token JWT.

Utilize o token nas requisições às rotas protegidas:

bash
Copiar
Editar
curl -X GET http://localhost:3000/api/produtos -H "Authorization: Bearer SEU_TOKEN"
Comece a cadastrar produtos, fornecedores e entradas para gerenciar seu estoque!

Segurança Implementada
Senhas criptografadas com bcrypt
Sessões seguras com JWT
Limite de requisições com Rate Limiting
Proteção de cabeçalhos HTTP com Helmet
Conexão segura via HTTPS

Melhorias Futuras
Relatórios de vendas em formato PDF

Filtros avançados para listagens

Notificações de estoque mínimo

App mobile para controle remoto

Contribuição
Quer colaborar com o projeto? É só seguir os passos:

bash
Copiar
Editar
# Faça um fork do repositório
git fork https://github.com/seuusuario/digistock.git

# Crie uma nova branch
git checkout -b minha-feature

# Faça suas alterações e commite
git commit -m "Nova funcionalidade"

# Envie para o repositório
git push origin minha-feature
Depois disso, abra um Pull Request e descreva suas alterações! 
