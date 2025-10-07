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


// Funções para o carrinho
async function getCarrinhoByUserId(id_usuario) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT c.*, p.nome_produto, p.descricao, p.valor_produto, p.imagem_url, p.estoque
      FROM carrinho c
      INNER JOIN produtos p ON c.id_produto = p.id_produto
      WHERE c.id_usuario = $1
      ORDER BY c.data_adicionado DESC
    `, [id_usuario]);
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function addToCarrinho(carrinhoItem) {
  const client = await pool.connect();
  try {
    // Verifica se o item já existe no carrinho
    const existingItem = await client.query(
      `SELECT * FROM carrinho 
       WHERE id_usuario = $1 AND id_produto = $2 AND tamanho = $3 AND cor = $4`,
      [carrinhoItem.id_usuario, carrinhoItem.id_produto, carrinhoItem.tamanho, carrinhoItem.cor]
    );

    if (existingItem.rows.length > 0) {
      // Atualiza a quantidade se já existir
      const result = await client.query(
        `UPDATE carrinho SET quantidade = quantidade + $1 
         WHERE id_usuario = $2 AND id_produto = $3 AND tamanho = $4 AND cor = $5
         RETURNING *`,
        [carrinhoItem.quantidade, carrinhoItem.id_usuario, carrinhoItem.id_produto, carrinhoItem.tamanho, carrinhoItem.cor]
      );
      return result.rows[0];
    } else {
      // Insere novo item
      const result = await client.query(
        `INSERT INTO carrinho (id_usuario, id_produto, quantidade, tamanho, cor) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [carrinhoItem.id_usuario, carrinhoItem.id_produto, carrinhoItem.quantidade, carrinhoItem.tamanho, carrinhoItem.cor]
      );
      return result.rows[0];
    }
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function updateCarrinhoItem(id_carrinho, quantidade) {
  const client = await pool.connect();
  try {
    if (quantidade <= 0) {
      // Remove o item se a quantidade for 0 ou menos
      await client.query('DELETE FROM carrinho WHERE id_carrinho = $1', [id_carrinho]);
      return { mensagem: 'Item removido do carrinho' };
    } else {
      // Atualiza a quantidade
      const result = await client.query(
        'UPDATE carrinho SET quantidade = $1 WHERE id_carrinho = $2 RETURNING *',
        [quantidade, id_carrinho]
      );
      return result.rows[0];
    }
  } catch (error) {
    console.error('Erro ao atualizar carrinho:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function removeFromCarrinho(id_carrinho) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM carrinho WHERE id_carrinho = $1 RETURNING *',
      [id_carrinho]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao remover do carrinho:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function clearCarrinho(id_usuario) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM carrinho WHERE id_usuario = $1 RETURNING *',
      [id_usuario]
    );
    return result.rows;
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Funções para pedidos
async function createPedido(pedidoData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Cria o pedido
    const pedidoResult = await client.query(
      `INSERT INTO pedidos (id_usuario, total, metodo_pagamento, endereco_entrega) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [pedidoData.id_usuario, pedidoData.total, pedidoData.metodo_pagamento, pedidoData.endereco_entrega]
    );

    const pedido = pedidoResult.rows[0];

    // Adiciona os itens do pedido
    for (const item of pedidoData.itens) {
      await client.query(
        `INSERT INTO pedido_itens (id_pedido, id_produto, quantidade, preco_unitario, tamanho, cor) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [pedido.id_pedido, item.id_produto, item.quantidade, item.preco_unitario, item.tamanho, item.cor]
      );

      // Atualiza o estoque do produto
      await client.query(
        'UPDATE produtos SET estoque = estoque - $1 WHERE id_produto = $2',
        [item.quantidade, item.id_produto]
      );
    }

    // Limpa o carrinho após criar o pedido
    await client.query('DELETE FROM carrinho WHERE id_usuario = $1', [pedidoData.id_usuario]);

    await client.query('COMMIT');
    return pedido;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar pedido:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function getPedidosByUserId(id_usuario) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT p.*, 
             JSON_AGG(
               JSON_BUILD_OBJECT(
                 'nome_produto', prod.nome_produto,
                 'quantidade', pi.quantidade,
                 'preco_unitario', pi.preco_unitario,
                 'tamanho', pi.tamanho,
                 'cor', pi.cor,
                 'imagem_url', prod.imagem_url
               )
             ) as itens
      FROM pedidos p
      LEFT JOIN pedido_itens pi ON p.id_pedido = pi.id_pedido
      LEFT JOIN produtos prod ON pi.id_produto = prod.id_produto
      WHERE p.id_usuario = $1
      GROUP BY p.id_pedido
      ORDER BY p.data_pedido DESC
    `, [id_usuario]);
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  } finally {
    client.release();
  }
}


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


module.exports = {
  pool,
  selectCategoryByName,
  selectAllCategories,
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
  updateUser,
    getCarrinhoByUserId,
  addToCarrinho,
  updateCarrinhoItem,
  removeFromCarrinho,
  clearCarrinho,
  createPedido,
  getPedidosByUserId
  // REMOVER: editSelectedProduct, deleteSelectedProducts (são do frontend)
};