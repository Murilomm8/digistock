// Quando o conteúdo da página for totalmente carregado, a função abaixo será executada.
document.addEventListener("DOMContentLoaded", function () {
    // Recupera o token armazenado no localStorage, que é usado para manter a sessão do usuário
    const token = localStorage.getItem("token");

    console.log("Auth.js carregado! Verificando autenticação...");
    console.log("Token armazenado:", token);

    // Se o token não estiver presente, o usuário não está autenticado
    if (!token) {
        console.warn("Usuário não autenticado! Redirecionando para login...");
        // Redireciona o usuário para a página de login (index.html)
        window.location.href = "index.html";
    }
});
