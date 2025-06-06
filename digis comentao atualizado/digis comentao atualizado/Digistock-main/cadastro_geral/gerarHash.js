const bcrypt = require("bcryptjs");

const senha = ""; // Altere para a senha desejada

bcrypt.hash(senha, 10, (err, hash) => {
    if (err) throw err;
    console.log("Hash gerado:", hash);
});