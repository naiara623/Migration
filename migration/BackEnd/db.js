const { Pool } = require("pg");
require("dotenv").config();

// Cria um pool de conexões com o PostgreSQL usando variáveis de ambiente (.env)
const pool = new Pool({
  user: process.env.USER_NAME,
  host: process.env.HOST_NAME,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.PORT_NUMBER,
});

// ==========================================
// 👤 FUNÇÕES DE USUÁRIO
// ==========================================

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
    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      throw new Error("Email já cadastrado");
    }
    throw error;
  } finally {
    client.release();
  }
}

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

// ==========================================
// 📦 FUNÇÕES DE CATEGORIAS
// ==========================================

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

// ==========================================
// 🛍️ FUNÇÕES DE PRODUTOS
// ==========================================

async function insertProduct(produto) {
  console.log("🛠️ Inserindo produto no banco:", produto);
  try {
    const client = await pool.connect();
    const result = await client.query(`
      INSERT INTO produtos 
        (nome_produto, descricao, valor_produto, id_categoria, estoque, imagem_url, idusuarios)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      produto.nome_produto,
      produto.descricao,
      produto.valor_produto,
      produto.id_categoria,
      produto.estoque,
      produto.imagem_url,
      produto.idusuarios
    ]);
    client.release();
    return result.rows[0];
  } catch (error) {
    console.error("❌ Erro no insertProduct:", error);
    throw error;
  }
}

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

async function updateProduct(id, product) {
  const client = await pool.connect();
  
  let sql;
  let values;
  
  if (product.imagem_url) {
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
      product.imagem_url,
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

async function getAllProducts() {
  const client = await pool.connect();
  try {
    const sql = `
      SELECT p.*, c.nome_categoria
      FROM produtos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      ORDER BY p.data_criacao DESC
    `;
    const result = await client.query(sql);
    return result.rows;
  } catch (error) {
    console.error("Erro ao buscar todos os produtos:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function getProductById(id_produto) {
  const client = await pool.connect();
  try {
    const sql = `
      SELECT p.*, c.nome_categoria
      FROM produtos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE p.id_produto = $1
    `;
    const result = await client.query(sql, [id_produto]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Erro ao buscar produto por ID:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function updateProductById(id_produto, product) {
  const client = await pool.connect();
  try {
    let sql, values;
    if (product.imagem_url) {
      sql = `
        UPDATE produtos
        SET nome_produto = $1,
            descricao     = $2,
            valor_produto = $3,
            id_categoria  = $4,
            estoque       = $5,
            imagem_url    = $6
        WHERE id_produto = $7
        RETURNING *
      `;
      values = [
        product.nome_produto,
        product.descricao,
        product.valor_produto,
        product.id_categoria,
        product.estoque,
        product.imagem_url,
        id_produto
      ];
    } else {
      sql = `
        UPDATE produtos
        SET nome_produto = $1,
            descricao     = $2,
            valor_produto = $3,
            id_categoria  = $4,
            estoque       = $5
        WHERE id_produto = $6
        RETURNING *
      `;
      values = [
        product.nome_produto,
        product.descricao,
        product.valor_produto,
        product.id_categoria,
        product.estoque,
        id_produto
      ];
    }

    const result = await client.query(sql, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function deleteProductById(id_produto) {
  const client = await pool.connect();
  try {
    const sql = `
      DELETE FROM produtos
      WHERE id_produto = $1
      RETURNING *
    `;
    const result = await client.query(sql, [id_produto]);
    if (result.rowCount === 0) {
      throw new Error("Produto não encontrado para deleção");
    }
    return result.rows[0];
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    throw error;
  } finally {
    client.release();
  }
}

// ==========================================
// 🛒 FUNÇÕES DO CARRINHO
// ==========================================

async function getCarrinhoByUserId(idusuarios) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT c.*, p.nome_produto, p.descricao, p.valor_produto, p.imagem_url, p.estoque
      FROM carrinho c
      INNER JOIN produtos p ON c.id_produto = p.id_produto
      WHERE c.idusuarios = $1
      ORDER BY c.data_adicionado DESC
    `, [idusuarios]);
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
    console.log('🛒 Adicionando item ao carrinho:', carrinhoItem);
    
    const produtoCheck = await client.query(
      'SELECT * FROM produtos WHERE id_produto = $1',
      [carrinhoItem.id_produto]
    );
    
    if (produtoCheck.rowCount === 0) {
      throw new Error('Produto não encontrado');
    }

    const existingItem = await client.query(
      `SELECT * FROM carrinho 
       WHERE idusuarios = $1 AND id_produto = $2 AND tamanho = $3 AND cor = $4`,
      [carrinhoItem.idusuarios, carrinhoItem.id_produto, carrinhoItem.tamanho, carrinhoItem.cor]
    );

    if (existingItem.rows.length > 0) {
      const result = await client.query(
        `UPDATE carrinho SET quantidade = quantidade + $1 
         WHERE idusuarios = $2 AND id_produto = $3 AND tamanho = $4 AND cor = $5
         RETURNING *`,
        [carrinhoItem.quantidade, carrinhoItem.idusuarios, carrinhoItem.id_produto, carrinhoItem.tamanho, carrinhoItem.cor]
      );
      return result.rows[0];
    } else {
      const result = await client.query(
        `INSERT INTO carrinho (idusuarios, id_produto, quantidade, tamanho, cor, configuracao) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [carrinhoItem.idusuarios, carrinhoItem.id_produto, carrinhoItem.quantidade, carrinhoItem.tamanho, carrinhoItem.cor, carrinhoItem.configuracao || {}]
      );
      return result.rows[0];
    }
  } catch (error) {
    console.error('❌ Erro ao adicionar ao carrinho:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function updateCarrinhoItem(id_carrinho, quantidade) {
  const client = await pool.connect();
  try {
    if (quantidade <= 0) {
      await client.query('DELETE FROM carrinho WHERE id_carrinho = $1', [id_carrinho]);
      return { mensagem: 'Item removido do carrinho' };
    } else {
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

async function clearCarrinho(idusuarios) {
  const query = 'DELETE FROM carrinho WHERE idusuarios = $1';
  await pool.query(query, [idusuarios]);
}

async function getCarrinhoItemsByUserId(idusuarios) {
  const client = await pool.connect();
  try {
    const sql = `
      SELECT c.*, p.nome_produto, p.descricao, p.valor_produto, p.imagem_url, p.estoque
      FROM carrinho c
      INNER JOIN produtos p ON c.id_produto = p.id_produto
      WHERE c.idusuarios = $1
      ORDER BY c.data_adicionado DESC
    `;
    const result = await client.query(sql, [idusuarios]);
    return result.rows;
  } catch (error) {
    console.error("Erro ao buscar itens do carrinho:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function addOrUpdateCarrinhoItem({ idusuarios, id_produto, quantidade, tamanho, cor, configuracao = {} }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existingSql = `
      SELECT * FROM carrinho
      WHERE idusuarios = $1
        AND id_produto = $2
        AND tamanho    = $3
        AND cor        = $4
    `;
    const existing = await client.query(existingSql, [idusuarios, id_produto, tamanho, cor]);

    if (existing.rows.length > 0) {
      const updateSql = `
        UPDATE carrinho
        SET quantidade = quantidade + $1,
            configuracao = $2
        WHERE idusuarios = $3
          AND id_produto = $4
          AND tamanho    = $5
          AND cor        = $6
        RETURNING *
      `;
      const updateResult = await client.query(updateSql, [quantidade, configuracao, idusuarios, id_produto, tamanho, cor]);
      await client.query('COMMIT');
      return updateResult.rows[0];
    } else {
      const insertSql = `
        INSERT INTO carrinho (idusuarios, id_produto, quantidade, tamanho, cor, configuracao)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const insertResult = await client.query(insertSql, [idusuarios, id_produto, quantidade, tamanho, cor, configuracao]);
      await client.query('COMMIT');
      return insertResult.rows[0];
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Erro ao adicionar ou atualizar item no carrinho:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function updateCarrinhoItemQuantity(id_carrinho, quantidade) {
  const client = await pool.connect();
  try {
    if (quantidade <= 0) {
      const deleteSql = `
        DELETE FROM carrinho
        WHERE id_carrinho = $1
        RETURNING *
      `;
      const deleteResult = await client.query(deleteSql, [id_carrinho]);
      if (deleteResult.rowCount === 0) {
        throw new Error("Item de carrinho não encontrado para remoção");
      }
      return { mensagem: "Item removido do carrinho", item: deleteResult.rows[0] };
    } else {
      const updateSql = `
        UPDATE carrinho
        SET quantidade = $1
        WHERE id_carrinho = $2
        RETURNING *
      `;
      const updateResult = await client.query(updateSql, [quantidade, id_carrinho]);
      if (updateResult.rowCount === 0) {
        throw new Error("Item de carrinho não encontrado para atualização");
      }
      return updateResult.rows[0];
    }
  } catch (error) {
    console.error("Erro ao atualizar quantidade do item no carrinho:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function removeCarrinhoItem(id_carrinho) {
  const client = await pool.connect();
  try {
    const sql = `
      DELETE FROM carrinho
      WHERE id_carrinho = $1
      RETURNING *
    `;
    const result = await client.query(sql, [id_carrinho]);
    if (result.rowCount === 0) {
      throw new Error("Item de carrinho não encontrado para remoção");
    }
    return result.rows[0];
  } catch (error) {
    console.error("Erro ao remover item do carrinho:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function clearCarrinhoByUserId(idusuarios) {
  const client = await pool.connect();
  try {
    const sql = `
      DELETE FROM carrinho
      WHERE idusuarios = $1
      RETURNING *
    `;
    const result = await client.query(sql, [idusuarios]);
    return result.rows;
  } catch (error) {
    console.error("Erro ao limpar carrinho:", error);
    throw error;
  } finally {
    client.release();
  }
}

// ==========================================
// 📋 FUNÇÕES DE PEDIDOS
// ==========================================

async function createPedido(pedidoData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const pedidoResult = await client.query(
      `INSERT INTO pedidos (idusuarios, total, metodo_pagamento, endereco_entrega) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [pedidoData.idusuarios, pedidoData.total, pedidoData.metodo_pagamento, pedidoData.endereco_entrega]
    );

    const pedido = pedidoResult.rows[0];

    for (const item of pedidoData.itens) {
      await client.query(
        `INSERT INTO pedido_itens (id_pedido, id_produto, quantidade, preco_unitario, tamanho, cor, configuracao) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [pedido.id_pedido, item.id_produto, item.quantidade, item.preco_unitario, item.tamanho, item.cor, item.configuracao || {}]
      );

      await client.query(
        'UPDATE produtos SET estoque = estoque - $1 WHERE id_produto = $2',
        [item.quantidade, item.id_produto]
      );
    }

    await client.query('DELETE FROM carrinho WHERE idusuarios = $1', [pedidoData.idusuarios]);

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

async function getPedidosByUserId(idusuarios) {
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
                 'imagem_url', prod.imagem_url,
                 'configuracao', pi.configuracao
               )
             ) as itens
      FROM pedidos p
      LEFT JOIN pedido_itens pi ON p.id_pedido = pi.id_pedido
      LEFT JOIN produtos prod ON pi.id_produto = prod.id_produto
      WHERE p.idusuarios = $1
      GROUP BY p.id_pedido
      ORDER BY p.data_pedido DESC
    `, [idusuarios]);
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function createPedidoWithItems({ idusuarios, total, metodo_pagamento, endereco_entrega, itens }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const pedidoSql = `
      INSERT INTO pedidos (idusuarios, total, metodo_pagamento, endereco_entrega, status_geral)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const pedidoRes = await client.query(pedidoSql, [idusuarios, total, metodo_pagamento, endereco_entrega, 'PROCESSANDO']);
    const pedido = pedidoRes.rows[0];

    const itemInsertSql = `
      INSERT INTO pedido_itens (id_pedido, id_produto, quantidade, preco_unitario, tamanho, cor, configuracao, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const estoqueUpdateSql = `
      UPDATE produtos
      SET estoque = estoque - $1
      WHERE id_produto = $2
    `;

    for (const item of itens) {
      await client.query(itemInsertSql, [
        pedido.id_pedido,
        item.id_produto,
        item.quantidade,
        item.preco_unitario,
        item.tamanho,
        item.cor,
        item.configuracao || {},
        'PENDENTE'
      ]);
      await client.query(estoqueUpdateSql, [item.quantidade, item.id_produto]);
    }

    const clearCarrinhoSql = `
      DELETE FROM carrinho
      WHERE idusuarios = $1
    `;
    await client.query(clearCarrinhoSql, [idusuarios]);

    await client.query('COMMIT');
    return pedido;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Erro ao criar pedido:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function updateEnderecoEntrega(id_pedido, endereco_entrega) {
  const client = await pool.connect();
  try {
    const sql = `
      UPDATE pedidos
      SET endereco_entrega = $1
      WHERE id_pedido = $2
      RETURNING *
    `;
    const result = await client.query(sql, [endereco_entrega, id_pedido]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Erro ao atualizar endereço de entrega do pedido:", error);
    throw error;
  } finally {
    client.release();
  }
}

// ==========================================
// 🏭 FUNÇÕES DE PRODUÇÃO (NOVAS)
// ==========================================

async function createPedidoComRastreamento(pedidoData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const pedidoResult = await client.query(
      `INSERT INTO pedidos (idusuarios, total, metodo_pagamento, endereco_entrega, status_geral) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [pedidoData.idusuarios, pedidoData.total, pedidoData.metodo_pagamento, pedidoData.endereco_entrega, 'PROCESSANDO']
    );

    const pedido = pedidoResult.rows[0];

    for (const item of pedidoData.itens) {
      await client.query(
        `INSERT INTO pedido_itens (id_pedido, id_produto, quantidade, preco_unitario, tamanho, cor, configuracao, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [pedido.id_pedido, item.id_produto, item.quantidade, item.preco_unitario, item.tamanho, item.cor, item.configuracao || {}, 'PENDENTE']
      );

      await client.query(
        'UPDATE produtos SET estoque = estoque - $1 WHERE id_produto = $2',
        [item.quantidade, item.id_produto]
      );
    }

    await client.query('DELETE FROM carrinho WHERE idusuarios = $1', [pedidoData.idusuarios]);

    await client.query('COMMIT');
    return pedido;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar pedido com rastreamento:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function registrarItemProducao(dadosItem) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO producao_itens 
       (id_pedido, id_produto, item_index, item_unit, item_id_maquina, order_id, status_maquina, slot_expedicao) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        dadosItem.id_pedido,
        dadosItem.id_produto,
        dadosItem.item_index,
        dadosItem.item_unit,
        dadosItem.item_id_maquina,
        dadosItem.order_id,
        'PENDENTE',
        dadosItem.slot_expedicao || `SLOT-${Math.floor(Math.random() * 20) + 1}`
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao registrar item de produção:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function atualizarStatusProducao(id_producao, novosDados) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE producao_itens 
       SET status_maquina = $1, estagio_maquina = $2, progresso_maquina = $3, 
           slot_expedicao = $4, atualizado_em = NOW()
       WHERE id_producao = $5 
       RETURNING *`,
      [
        novosDados.status_maquina,
        novosDados.estagio_maquina,
        novosDados.progresso_maquina,
        novosDados.slot_expedicao,
        id_producao
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao atualizar status de produção:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function getStatusDetalhadoPedido(id_pedido) {
  const client = await pool.connect();
  try {
    console.log(`🔍 [DB] Buscando status detalhado para pedido: ${id_pedido}`);
    
    // Primeiro, verificar se o pedido existe
    const pedidoCheck = await client.query(
      'SELECT * FROM pedidos WHERE id_pedido = $1',
      [id_pedido]
    );
    
    if (pedidoCheck.rows.length === 0) {
      throw new Error('Pedido não encontrado');
    }

    // Query simplificada para evitar problemas de JOIN
    const result = await client.query(`
      SELECT 
        p.id_pedido,
        p.idusuarios,
        p.total,
        p.status_geral,
        p.data_pedido,
        
        pi.id_item,
        pi.id_produto,
        pi.quantidade,
        pi.preco_unitario,
        pi.tamanho,
        pi.cor,
        
        prod.nome_produto,
        prod.imagem_url
      
      FROM pedidos p
      LEFT JOIN pedido_itens pi ON p.id_pedido = pi.id_pedido
      LEFT JOIN produtos prod ON pi.id_produto = prod.id_produto
      WHERE p.id_pedido = $1
      ORDER BY pi.id_item
    `, [id_pedido]);
    
    console.log(`✅ [DB] ${result.rows.length} registros encontrados para pedido ${id_pedido}`);
    
    return result.rows;
  } catch (error) {
    console.error('❌ [DB] Erro ao buscar status detalhado do pedido:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function verificarPedidoCompleto(id_pedido) {
  const client = await pool.connect();
  try {
    console.log(`🔍 [DB] Verificando se pedido ${id_pedido} está completo`);
    
    // Verificar itens de produção se a tabela existir
    const producaoCheck = await client.query(`
      SELECT COUNT(*) as total_itens
      FROM information_schema.tables 
      WHERE table_name = 'producao_itens'
    `);
    
    let total_itens = 0;
    let itens_prontos = 0;
    
    if (producaoCheck.rows[0].total_itens > 0) {
      // Tabela existe, contar itens de produção
      const result = await client.query(`
        SELECT 
          COUNT(*) as total_itens,
          SUM(CASE WHEN status_maquina = 'COMPLETED' THEN 1 ELSE 0 END) as itens_prontos
        FROM producao_itens 
        WHERE id_pedido = $1
      `, [id_pedido]);
      
      total_itens = parseInt(result.rows[0].total_itens) || 0;
      itens_prontos = parseInt(result.rows[0].itens_prontos) || 0;
    } else {
      // Tabela não existe, usar itens do pedido como base
      const result = await client.query(`
        SELECT COUNT(*) as total_itens
        FROM pedido_itens 
        WHERE id_pedido = $1
      `, [id_pedido]);
      
      total_itens = parseInt(result.rows[0].total_itens) || 0;
      itens_prontos = 0; // Sem produção, considerar nenhum pronto
    }
    
    const completo = total_itens > 0 && total_itens === itens_prontos;
    
    console.log(`✅ [DB] Pedido ${id_pedido}: ${itens_prontos}/${total_itens} itens prontos, completo: ${completo}`);
    
    return { 
      completo, 
      total_itens, 
      itens_prontos 
    };
  } catch (error) {
    console.error('❌ [DB] Erro ao verificar pedido completo:', error);
    // Em caso de erro, retornar valores padrão
    return { 
      completo: false, 
      total_itens: 0, 
      itens_prontos: 0 
    };
  } finally {
    client.release();
  }
}

// ==========================================
// 📦 EXPORTAÇÕES
// ==========================================

module.exports = {
  pool,
  // Usuários
  insertUser,
  selectUser,
  updateUser,
  getUserByEmail,
  
  // Categorias
  selectAllCategories,
  selectCategoryByName,
  
  // Produtos
  insertProduct,
  selectAllProducts,
  selectProductById,
  updateProduct,
  updateProductById,
  deleteProduct,
  deleteProductById,
  getAllProducts,
  getProductById,
  
  // Carrinho
  getCarrinhoByUserId,
  addToCarrinho,
  updateCarrinhoItem,
  removeFromCarrinho,
  clearCarrinho,
  getCarrinhoItemsByUserId,
  addOrUpdateCarrinhoItem,
  updateCarrinhoItemQuantity,
  removeCarrinhoItem,
  clearCarrinhoByUserId,
  
  // Pedidos
  createPedido,
  getPedidosByUserId,
  createPedidoWithItems,
  updateEnderecoEntrega,
  
  // Produção (Novas)
  createPedidoComRastreamento,
  registrarItemProducao,
  atualizarStatusProducao,
  getStatusDetalhadoPedido,
  verificarPedidoCompleto
};