const { Pool } = require("pg");
// const bcrypt = require("bcrypt"); // removido porque não vamos usar
require("dotenv").config();

// Cria um pool de conexões com o PostgreSQL usando variáveis de ambiente (.env)
const pool = new Pool({
  user: process.env.USER_NAME,
  host: process.env.HOST_NAME,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.PORT_NUMBER,
});

// Insere um usuário no banco (sem criptografar a senha)
async function insertUser(user) {
  const client = await pool.connect();

  const sql = `
    INSERT INTO usuarios 
    (nome_usuario, email_user, senhauser) 
    VALUES ($1, $2, $3)
    RETURNING *
  `;
 const values = [
  user.nome_usuario,
  user.email_user,
  user.senhauser
];


  try {
    const result = await client.query(sql, values);
    return result.rows[0]; // retorna o usuário recém-criado
  } catch (error) {
    if (error.code === "23505") { // erro de chave duplicada (email já existe)
      throw new Error("Email já cadastrado");
    }
    throw error;
  } finally {
    client.release(); // libera a conexão
  }
}

// Busca usuário por e-mail e senha (sem bcrypt)
async function selectUser(email, senha) {
  const sql = "SELECT * FROM usuarios WHERE email = $1 AND senha = $2";
  const client = await pool.connect();

  try {
    const result = await client.query(sql, [email, senha]);
    if (result.rows.length > 0) {
      // Remove a senha do retorno por segurança
      const { senha, ...userWithoutPassword } = result.rows[0];
      console.log("Usuário encontrado=====>>>>>>> ", userWithoutPassword);
      return userWithoutPassword;
    }
    return null; // não achou usuário
  } finally {
    client.release();
  }
}


// Retorna dados do usuário (sem senha)
async function getUserByEmail(email) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT idusuarios, nome_usuario, email_user FROM usuarios WHERE email = $1',
      [email]
    );
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    return null;
  } finally {
    client.release();
  }
}



module.exports = {
  pool,              // conexão com o banco
  insertUser,        // cadastra usuário
  selectUser,        // login
  getUserByEmail,    // pega usuário por email
//   updateUser,        // edita usuário
//   deleteUser,        // exclui usuário e posts
//   inserirComentario, // salva comentário
//   listarComentarios  // lista comentários
};
