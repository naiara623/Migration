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
// 👤 FUNÇÕES DE USUÁRIO (APENAS AS USADAS)
// ==========================================

async function insertUser(user) {
  const client = await pool.connect();

  const sql = `
    INSERT INTO usuarios 
    (nome_usuario, email_user, senhauser, numero) 
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [
    user.nome_usuario,
    user.email_user,
    user.senhauser,
    user.numero
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
// 🛍️ FUNÇÕES DE PRODUTOS (APENAS AS USADAS)
// ==========================================

async function insertProduct(produto) {
  console.log("🛠️ Inserindo produto no banco:", produto);
  try {
    const client = await pool.connect();
    const result = await client.query(`
      INSERT INTO produtos 
        (nome_produto, descricao, valor_produto, id_categoria, estoque, imagem_url, id_adm)
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
      produto.id_adm  // <-- AGORA USA id_adm
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

// getProductById é um alias para selectProductById (para manter compatibilidade)
const getProductById = selectProductById;

async function updateProductById(id_produto, product, adminId) {
  const client = await pool.connect();
  try {
    // Verificar se o produto pertence ao administrador
    const checkResult = await client.query(
      'SELECT id_adm FROM produtos WHERE id_produto = $1',
      [id_produto]
    );
    
    if (checkResult.rows.length === 0) {
      throw new Error('Produto não encontrado');
    }
    
    if (checkResult.rows[0].id_adm !== adminId) {
      throw new Error('Produto não pertence a este administrador');
    }
    
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
// 🛒 FUNÇÕES DO CARRINHO (APENAS AS USADAS)
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

// ==========================================
// 🏭 FUNÇÕES DE PRODUÇÃO (APENAS AS USADAS)
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
    return { 
      completo: false, 
      total_itens: 0, 
      itens_prontos: 0 
    };
  } finally {
    client.release();
  }
}

async function getStatusProducaoByPedido(id_pedido) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM producao_itens WHERE id_pedido = $1 ORDER BY item_index, item_unit',
      [id_pedido]
    );
    return result.rows;
  } catch (error) {
    console.error('❌ Erro ao buscar status de produção:', error);
    return [];
  } finally {
    client.release();
  }
}

// ==========================================
// 🏠 FUNÇÕES DE ENDEREÇO (APENAS AS USADAS)
// ==========================================
// db.js - adicione estas funções

// Inserir um novo endereço
// Inserir um novo endereço
// Atualize a função insertEndereco no db.js
async function insertEndereco(enderecoData) {
  console.log('📝 [DB] Inserindo/atualizando endereço:', enderecoData);
  
  const client = await pool.connect();
  try {
    const { cep, estado, complemento, numero, cidade, bairro, idusuarios } = enderecoData;
    
    // Verificar se o usuário já tem um endereço cadastrado
    const existingAddress = await client.query(
      'SELECT id_endereco FROM endereco WHERE idusuarios = $1',
      [idusuarios]
    );
    
    console.log(`🔍 [DB] Endereço existente? ${existingAddress.rows.length > 0}`);
    
    if (existingAddress.rows.length > 0) {
      // Atualizar endereço existente
      const result = await client.query(
        `UPDATE endereco 
         SET cep = $1, 
             estado = $2, 
             complemento = $3, 
             numero = $4, 
             cidade = $5, 
             bairro = $6
         WHERE idusuarios = $7
         RETURNING *`,
        [cep, estado, complemento, numero, cidade, bairro, idusuarios]
      );
      
      console.log('✅ [DB] Endereço atualizado:', result.rows[0]);
      return result.rows[0];
    } else {
      // Inserir novo endereço
      const result = await client.query(
        `INSERT INTO endereco 
         (cep, estado, complemento, numero, cidade, bairro, idusuarios) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [cep, estado, complemento, numero, cidade, bairro, idusuarios]
      );
      
      console.log('✅ [DB] Endereço criado:', result.rows[0]);
      return result.rows[0];
    }
  } catch (error) {
    console.error('❌ [DB] ERRO ao salvar endereço:', error);
    console.error('❌ [DB] Detalhes do erro:', {
      code: error.code,
      message: error.message,
      detail: error.detail,
      constraint: error.constraint
    });
    throw error;
  } finally {
    client.release();
  }
}

// Obter endereço por ID do usuário
async function getEnderecoByUserId(idusuarios) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM endereco WHERE idusuarios = $1`,
      [idusuarios]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Atualizar endereço
async function updateEndereco(id_endereco, enderecoData) {
  const client = await pool.connect();
  try {
    const { cep, estado, complemento, numero, cidade, bairro } = enderecoData;
    
    const result = await client.query(
      `UPDATE endereco 
       SET cep = $1, 
           estado = $2, 
           complemento = $3, 
           numero = $4, 
           cidade = $5, 
           bairro = $6,
       WHERE id_endereco = $7
       RETURNING *`,
      [cep, estado, complemento, numero, cidade, bairro, id_endereco]
    );
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Deletar endereço
async function deleteEndereco(id_endereco) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM endereco WHERE id_endereco = $1 RETURNING *',
      [id_endereco]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}




// ==========================================
// 📦 EXPORTAÇÕES (APENAS AS FUNÇÕES REALMENTE USADAS)
// ==========================================

module.exports = {
  pool,
  selectCategoryByName,
  selectAllCategories,
  insertProduct,
  selectAllProducts,
  updateProductById,
  deleteProductById,
  getProductById,
  insertUser,
  selectUser,
  // Nota: updateUser, getUserByEmail não são usadas
  getCarrinhoByUserId,
  // Nota: addToCarrinho não é usada (é substituída pela rota POST /api/carrinho)
  updateCarrinhoItem,
  removeFromCarrinho,
  clearCarrinho,
  // Nota: createPedido não é usada (usa-se createPedidoComRastreamento)
  selectProductById,
  // Nota: as funções abaixo não são usadas:
  // getPedidosByUserId,
  // clearCarrinhoByUserId,
  // getCarrinhoItemsByUserId,
  // addOrUpdateCarrinhoItem,
  // updateCarrinhoItemQuantity,
  // removeCarrinhoItem,
  // createPedidoWithItems,
  // updateEnderecoEntrega,
  // Produção
  createPedidoComRastreamento,
  registrarItemProducao,
  atualizarStatusProducao,
  getStatusDetalhadoPedido,
  verificarPedidoCompleto,
  getStatusProducaoByPedido,
  // Endereços
  insertEndereco,
  deleteEndereco,
  getEnderecoByUserId,
  updateEndereco
};