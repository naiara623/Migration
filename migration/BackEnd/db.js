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
      const { senhauser, ...userWithoutPassword } = result.rows[0];
      console.log("Usuário encontrado=====>>>>>>> ", userWithoutPassword);
      
      return userWithoutPassword;
    }
    return null;
  } finally {
    client.release();
  }
}

async function updateUser(email, user) {
  const client = await pool.connect();
  const sql = `
    UPDATE usuarios
    SET nome_usuario = $1,
        email_user = $2,
        estado_cidade = $3,
        nome_rua = $4,
        complemento = $5,
        numero = $6,
        referencia = $7
    WHERE email_user = $8
    RETURNING *;
  `;
  const values = [
    user.nome_usuario,
    user.email_user,
    user.estado_cidade,
    user.nome_rua,
    user.complemento,
    user.numero,
    user.referencia,
    email
  ];

  try {
    const result = await client.query(sql, values);
    return result.rows[0];
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





// Função para buscar todas as categorias
async function selectAllCategories() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM categorias ORDER BY nome_categoria');
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Função para buscar categoria por nome
async function selectCategoryByName(nome_categoria) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM categorias WHERE nome_categoria = $1', [nome_categoria]);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    throw error;
  } finally {
    client.release();
  }
}




// Remover estas funções duplicadas do db.js (elas já existem no frontend)
// const deleteSelectedProducts = async () => { ... };
// const editSelectedProduct = () => { ... };






// db.js - Corrigir TODAS as funções para usar id_produto

// Função para inserir produto (já está correta)
async function insertProduct(product) {
  const client = await pool.connect();
  const sql = `
    INSERT INTO produtos (nome_produto, descricao, valor_produto, id_categoria, estoque, imagem_url, avaliacao_produto, data_criacao)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
    RETURNING *
  `;
  
  const values = [
    product.nome_produto,
    product.descricao,
    product.valor_produto,
    product.id_categoria,
    product.estoque,
    product.image_url,
    product.avaliacao_produto || 0 // valor padrão
  ];

  try {
    const result = await client.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao inserir produto:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Função para buscar todos os produtos
async function selectAllProducts() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT p.*, c.nome_categoria 
      FROM produtos p 
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria 
      ORDER BY p.data_criacao DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Função para buscar produto por ID
async function selectProductById(id) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT p.*, c.nome_categoria 
      FROM produtos p 
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria 
      WHERE p.id_produto = $1
    `, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Função para atualizar produto
async function updateProduct(id, product) {
  const client = await pool.connect();
  
  let sql;
  let values;
  
  if (product.image_url) {
    sql = `
      UPDATE produtos 
      SET nome_produto = $1, descricao = $2, valor_produto = $3, 
          id_categoria = $4, estoque = $5, imagem_url = $6
      WHERE id_produto = $7
      RETURNING *
    `;
    values = [
      product.nome_produto,
      product.descricao,
      product.valor_produto,
      product.id_categoria,
      product.estoque,
      product.image_url,
      id
    ];
  } else {
    sql = `
      UPDATE produtos 
      SET nome_produto = $1, descricao = $2, valor_produto = $3, 
          id_categoria = $4, estoque = $5
      WHERE id_produto = $6
      RETURNING *
    `;
    values = [
      product.nome_produto,
      product.descricao,
      product.valor_produto,
      product.id_categoria,
      product.estoque,
      id
    ];
  }

  try {
    const result = await client.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Função para deletar produto (NOVA - corrigida)
async function deleteProduct(id) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM produtos WHERE id_produto = $1 RETURNING *', 
      [id]
    );
    
    if (result.rowCount === 0) {
      throw new Error('Produto não encontrado');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    throw error;
  } finally {
    client.release();
  }
}

// REMOVER as funções duplicadas do frontend que estavam no db.js
// (manter apenas as funções de banco de dados)

module.exports = {
  pool,
  insertProduct,
  selectAllProducts,
  selectProductById,
  updateProduct,
  deleteProduct, // Adicionar a função corrigida
  selectAllCategories,
  selectCategoryByName,
  insertUser,
  selectUser,
  getUserByEmail,
  updateUser
  // REMOVER: editSelectedProduct, deleteSelectedProducts (são do frontend)
};