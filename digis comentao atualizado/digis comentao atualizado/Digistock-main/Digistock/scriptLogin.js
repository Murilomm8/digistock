// Aguarda que o DOM seja totalmente carregado antes de executar o script
document.addEventListener("DOMContentLoaded", function () {
    // Obtém o formulário de login pelo ID "login-form"
    const loginForm = document.getElementById("login-form");

    // Se o formulário existir na página, adiciona um listener para o evento "submit"
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            // Previne o comportamento padrão do envio do formulário (recarregar a página)
            event.preventDefault();

            // Recupera os valores dos campos de usuário e senha, removendo espaços extras
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();
            const errorMessage = document.getElementById("error-message");

            // Verifica se ambos os campos foram preenchidos
            if (!username || !password) {
                errorMessage.textContent = "Preencha todos os campos.";
                errorMessage.style.display = "block";
                return;
            }

            try {
                // Envia uma requisição POST para a API de autenticação com os dados de login
                const response = await fetch("http://localhost:3000/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome: username, senha: password })
                });

                // Converte a resposta em JSON
                const data = await response.json();

                console.log("Resposta do backend:", data); // Debug para verificar se o token foi enviado pelo backend

                // Se a resposta for bem-sucedida e incluir um token, salva-o no localStorage e redireciona para a página Home
                if (response.ok && data.token) {
                    localStorage.setItem("token", data.token);
                    console.log("Token salvo corretamente no localStorage:", localStorage.getItem("token")); // Confirmação do token salvo
                    window.location.href = "Home.html";
                } else {
                    // Se não, exibe a mensagem de erro (se enviada pela API) ou uma mensagem padrão de credenciais incorretas
                    errorMessage.textContent = data.error || "Usuário ou senha incorretos.";
                    errorMessage.style.display = "block";
                }
            } catch (error) {
                // Caso ocorra erro de conexão com o servidor, exibe uma mensagem apropriada
                errorMessage.textContent = "Erro ao conectar ao servidor.";
                errorMessage.style.display = "block";
            }
        });
    }

    // Lista de páginas protegidas que exigem autenticação para acesso
    const paginasProtegidas = [
        "home.html", "CadastroUsuario.html", "Categorias.html", "Entrada.html",
        "fornecad.html", "listaFornecedores.html", "ListasProdutos.html", "Produtos.html", "Venda.html"
    ];
    // Obtém apenas o nome da página atual (por exemplo, "home.html")
    const caminhoAtual = window.location.pathname.split("/").pop();

    // Verifica se a página atual está configurada como protegida
    if (paginasProtegidas.includes(caminhoAtual)) {
        // Tenta recuperar o token armazenado no localStorage
        const token = localStorage.getItem("token");
        console.log("Verificando autenticação na página:", caminhoAtual);

        // Se não houver token, redireciona o usuário para a página de login (index.html)
        if (!token) {
            console.warn("Acesso negado! Redirecionando para login...");
            window.location.href = "index.html";
        }
    }
});

// Função de logout: Remove o token do localStorage e redireciona para a página de login
function logout() {
    localStorage.removeItem("token"); // Remove o token JWT
    console.log("Logout realizado, token removido."); // Debug para confirmar a remoção
    window.location.href = "index.html"; // Redireciona para a página de login
}
