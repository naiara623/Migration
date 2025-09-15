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
  (nome_usuario, email_user, senhauser, cep, estado_cidade, nome_rua, complemento, numero, referencia) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING *
`;
const values = [
  user.nome_usuario,
  user.email_user,
  user.senhauser,
  user.cep, 
  user.estado_cidade,
  user.nome_rua,
  user.complemento,
  user.numero,
  user.referencia
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


// Busca usuário por e-mail e compara a senha (login) sem bcrypt
async function selectUser(email_user, senhauser) {
  const sql = "SELECT * FROM usuarios WHERE email_user = $1 AND senhauser = $2";
  const client = await pool.connect();

  try {
    const result = await client.query(sql, [email_user, senhauser]);
    if (result.rows.length > 0) {
      const { senha, ...userWithoutPassword } = result.rows[0];
      console.log("Usuário encontrado=====>>>>>>> ", userWithoutPassword);
      
      return userWithoutPassword;
    }
    return null;
  } finally {
    client.release();
  }
}



// Retorna dados do usuário (sem senha)
async function getUserByEmail(email_user) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT idusuarios, nome_usuario, email_user FROM usuarios WHERE email_user = $1',
      [email_user]
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
