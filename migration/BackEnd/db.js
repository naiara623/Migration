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

    // Para cada item, criar registro de produção
    for (let index = 0; index < pedidoData.itens.length; index++) {
      const item = pedidoData.itens[index];
      
      // CORREÇÃO: Inserir item do pedido e obter id_pedidos
      const pedidoItemResult = await client.query(
        `INSERT INTO pedido_itens 
         (id_pedido, id_produto, quantidade, preco_unitario, tamanho, cor, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id_pedido`,
        [
          pedido.id_pedido,
          item.id_produto,
          item.quantidade,
          item.preco_unitario,
          item.tamanho || '',
          item.cor || '',
          'PENDENTE'
        ]
      );

      const id_pedido = pedidoItemResult.rows[0].id_pedido;

      // CORREÇÃO: Criar registros de produção para cada unidade do item
      for (let unit = 1; unit <= item.quantidade; unit++) {
        await client.query(
          `INSERT INTO producao_itens 
           (id_pedido, id_produto, item_index, item_unit, 
            status_maquina, estagio_maquina, progresso_maquina, slot_expedicao) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            id_pedido,
            item.id_produto,
            index + 1, // item_index começa em 1
            unit, // item_unit para cada unidade
            'PENDENTE',
            'AGUARDANDO',
            0,
            `SLOT-${Math.floor(Math.random() * 20) + 1}`
          ]
        );
      }

      // Atualizar estoque
      await client.query(
        'UPDATE produtos SET estoque = estoque - $1 WHERE id_produto = $2',
        [item.quantidade, item.id_produto]
      );
    }

    // Limpar carrinho
    await clearCarrinho(pedidoData.idusuarios);

    await client.query('COMMIT');
    return pedido;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao criar pedido com rastreamento:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function registrarItemProducao(dadosItem) {
  const client = await pool.connect();
  try {
    // CORREÇÃO: Usar estrutura de campos correta baseada na tabela real
    const result = await client.query(
      `INSERT INTO producao_itens 
       (id_pedido, id_produto, item_index, item_unit, item_id_maquina, order_id, 
        status_maquina, estagio_maquina, progresso_maquina, slot_expedicao) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        dadosItem.id_pedido,
        dadosItem.id_produto,
        dadosItem.item_index || 0,
        dadosItem.item_unit || 1,
        dadosItem.item_id_maquina || `ITEM-${Date.now()}`,
        dadosItem.order_id || `ORDER-${Date.now()}`,
        dadosItem.status_maquina || 'PENDENTE',
        dadosItem.estagio_maquina || 'AGUARDANDO',
        dadosItem.progresso_maquina || 0,
        dadosItem.slot_expedicao || `SLOT-${Math.floor(Math.random() * 20) + 1}`
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('❌ Erro ao registrar item de produção:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function atualizarStatusProducao(id_producao, novosDados) {
  const client = await pool.connect();
  try {
    // CORREÇÃO: Usar campos corretos da tabela
    const result = await client.query(
      `UPDATE producao_itens 
       SET status_maquina = $1, 
           estagio_maquina = $2, 
           progresso_maquina = $3,
           slot_expedicao = COALESCE($4, slot_expedicao),
           atualizado_em = NOW()
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
    console.error('❌ Erro ao atualizar status de produção:', error);
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
        
        pi.id_pedido,
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
      ORDER BY pi.id_pedido
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
    
    // CORREÇÃO: Usar campos corretos da tabela producao_itens
    const result = await client.query(`
      SELECT 
        COUNT(DISTINCT pi.id_pedido) as total_itens,
        SUM(CASE WHEN pr.status_maquina = 'COMPLETED' THEN 1 ELSE 0 END) as itens_prontos
      FROM pedido_itens pi
      LEFT JOIN producao_itens pr ON pi.id_pedido = pr.id_pedido
      WHERE pi.id_pedido = $1
    `, [id_pedido]);
    
    const total_itens = parseInt(result.rows[0].total_itens) || 0;
    const itens_prontos = parseInt(result.rows[0].itens_prontos) || 0;
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
    // CORREÇÃO: Usar campos corretos da tabela
    const result = await client.query(
      `SELECT * FROM producao_itens 
       WHERE id_pedido = $1 
       ORDER BY id_producao DESC`,
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

// db.js - adicione estas funções na seção de funções do usuário

// Funções de Favoritos
async function getFavoritosByUserId(idusuarios) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT f.*, p.nome_produto, p.descricao, p.valor_produto, p.imagem_url, p.estoque
      FROM favoritos_usuario f
      INNER JOIN produtos p ON f.id_produto = p.id_produto
      WHERE f.idusuarios = $1
      ORDER BY f.id_favoritos DESC
    `, [idusuarios]);
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function addToFavoritos(idusuarios, id_produto) {
  const client = await pool.connect();
  try {
    // Verificar se já está favoritado
    const check = await client.query(
      'SELECT * FROM favoritos_usuario WHERE idusuarios = $1 AND id_produto = $2',
      [idusuarios, id_produto]
    );
    
    if (check.rows.length > 0) {
      return { message: 'Produto já está nos favoritos_usuario', favorito: check.rows[0] };
    }
    
    // Adicionar aos favoritos
    const result = await client.query(
      `INSERT INTO favoritos_usuario (idusuarios, id_produto, favoritado) 
       VALUES ($1, $2, NOW()) 
       RETURNING *`,
      [idusuarios, id_produto]
    );
    
    return { message: 'Produto adicionado aos favoritos', favorito: result.rows[0] };
  } catch (error) {
    console.error('Erro ao adicionar aos favoritos:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function removeFromFavoritos(idusuarios, id_produto) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM favoritos_usuario WHERE idusuarios = $1 AND id_produto = $2 RETURNING *',
      [idusuarios, id_produto]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Produto não encontrado nos favoritos');
    }
    
    return { message: 'Produto removido dos favoritos', favorito: result.rows[0] };
  } catch (error) {
    console.error('Erro ao remover dos favoritos:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function isFavorito(idusuarios, id_produto) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM favoritos_usuario WHERE idusuarios = $1 AND id_produto = $2',
      [idusuarios, id_produto]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function getTotalFavoritos(idusuarios) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT COUNT(*) as total FROM favoritos_usuario WHERE idusuarios = $1',
      [idusuarios]
    );
    return parseInt(result.rows[0].total);
  } catch (error) {
    console.error('Erro ao contar favoritos:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Função para buscar dados completos do usuário para pagamento
async function getDadosUsuarioParaPagamento(idusuarios) {
  const client = await pool.connect();
  try {
    console.log('💳 [DB] Buscando dados completos do usuário para pagamento:', idusuarios);
    
    // Buscar dados básicos do usuário
    const usuarioQuery = await client.query(
      `SELECT idusuarios, nome_usuario, email_user, numero 
       FROM usuarios WHERE idusuarios = $1`,
      [idusuarios]
    );
    
    if (usuarioQuery.rows.length === 0) {
      throw new Error('Usuário não encontrado');
    }
    
    const usuario = usuarioQuery.rows[0];
    
    // Buscar endereço do usuário
    const enderecoQuery = await client.query(
      `SELECT cep, estado, complemento, numero as numero_endereco, cidade, bairro 
       FROM endereco WHERE idusuarios = $1`,
      [idusuarios]
    );
    
    const endereco = enderecoQuery.rows[0] || null;
    
    console.log('✅ [DB] Dados encontrados:', { 
      usuario: usuario.nome_usuario,
      temEndereco: !!endereco 
    });
    
    return {
      usuario: {
        idusuarios: usuario.idusuarios,
        nome_usuario: usuario.nome_usuario,
        email_user: usuario.email_user,
        numero: usuario.numero
      },
      endereco: endereco
    };
    
  } catch (error) {
    console.error('❌ [DB] Erro ao buscar dados para pagamento:', error);
    throw error;
  } finally {
    client.release();
  }
}



// ==========================================
// 🛒 FUNÇÕES DO CARRINHO (CORRIGIDAS)
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
    console.error('❌ Erro ao buscar carrinho:', error);
    throw error;
  } finally {
    client.release();
  }
}


// ATUALIZAÇÃO CORRIGIDA - usando id_carinho (singular)
async function updateCarrinhoItem(id_carinho, quantidade) {
  const client = await pool.connect();
  try {
    if (quantidade <= 0) {
      await client.query('DELETE FROM carrinho WHERE id_carinho = $1', [id_carinho]);
      return { mensagem: 'Item removido do carrinho' };
    } else {
      const result = await client.query(
        'UPDATE carrinho SET quantidade = $1 WHERE id_carinho = $2 RETURNING *',
        [quantidade, id_carinho]
      );
      return result.rows[0];
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar carrinho:', error);
    throw error;
  } finally {
    client.release();
  }
}

// REMOÇÃO CORRIGIDA - usando id_carinho (singular)
async function removeFromCarrinho(id_carinho) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM carrinho WHERE id_carinho = $1 RETURNING *',
      [id_carinho]
    );
    return result.rows[0];
  } catch (error) {
    console.error('❌ Erro ao remover do carrinho:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function clearCarrinho(idusuarios) {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM carrinho WHERE idusuarios = $1', [idusuarios]);
  } catch (error) {
    console.error('❌ Erro ao limpar carrinho:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ==========================================
// 🛒 FUNÇÕES DO CARRINHO (COMPLETAS)
// ==========================================

// Função para adicionar item ao carrinho (FALTANTE - ADICIONE ESTA FUNÇÃO)
async function addToCarrinho(carrinhoData) {
  const client = await pool.connect();
  try {
    const { idusuarios, id_produto, quantidade, tamanho = '', cor = '' } = carrinhoData;
    
    console.log('🛒 [DB] Adicionando ao carrinho:', carrinhoData);
    
    // Primeiro verificar se já existe no carrinho
    const checkResult = await client.query(
      `SELECT id_carrinho, quantidade FROM carrinho 
       WHERE idusuarios = $1 AND id_produto = $2 AND tamanho = $3 AND cor = $4`,
      [idusuarios, id_produto, tamanho, cor]
    );
    
    if (checkResult.rows.length > 0) {
      // Atualizar quantidade
      const existingItem = checkResult.rows[0];
      const newQuantidade = existingItem.quantidade + (quantidade || 1);
      
      const result = await client.query(
        `UPDATE carrinho 
         SET quantidade = $1, data_adicionado = NOW()
         WHERE id_carrinho = $2 
         RETURNING *`,
        [newQuantidade, existingItem.id_carrinho]
      );
      
      return { 
        mensagem: 'Quantidade atualizada no carrinho', 
        item: result.rows[0] 
      };
    } else {
      // Inserir novo item
      const result = await client.query(
        `INSERT INTO carrinho 
         (idusuarios, id_produto, quantidade, tamanho, cor, data_adicionado) 
         VALUES ($1, $2, $3, $4, $5, NOW()) 
         RETURNING *`,
        [idusuarios, id_produto, quantidade || 1, tamanho, cor]
      );
      
      return { 
        mensagem: 'Produto adicionado ao carrinho', 
        item: result.rows[0] 
      };
    }
  } catch (error) {
    console.error('❌ [DB] Erro ao adicionar ao carrinho:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ==========================================
// 💳 FUNÇÕES DE PAGAMENTO (NOVAS)
// ==========================================

async function calcularTotalCarrinho(idusuarios) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        SUM(p.valor_produto * c.quantidade) as total_produtos,
        COUNT(*) as total_itens,
        SUM(c.quantidade) as quantidade_total
      FROM carrinho c
      INNER JOIN produtos p ON c.id_produto = p.id_produto
      WHERE c.idusuarios = $1
    `, [idusuarios]);
    
    return {
      total_produtos: parseFloat(result.rows[0].total_produtos) || 0,
      total_itens: parseInt(result.rows[0].total_itens) || 0,
      quantidade_total: parseInt(result.rows[0].quantidade_total) || 0
    };
  } catch (error) {
    console.error('❌ Erro ao calcular total do carrinho:', error);
    return { total_produtos: 0, total_itens: 0, quantidade_total: 0 };
  } finally {
    client.release();
  }
}

async function criarPedidoCompleto(pedidoData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('📦 [DB] Criando pedido completo:', pedidoData);

    // 1. Criar pedido com estrutura correta
    const pedidoResult = await client.query(
      `INSERT INTO pedidos 
       (idusuarios, total, metodo_pagamento, endereco_entrega, status_geral) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        pedidoData.idusuarios,
        pedidoData.total,
        pedidoData.metodo_pagamento,
        pedidoData.endereco_entrega,
        'PENDENTE'
      ]
    );

    const pedido = pedidoResult.rows[0];
    console.log('✅ [DB] Pedido criado:', pedido.id_pedido);

    // 2. Obter itens do carrinho
    const carrinhoItens = await client.query(`
      SELECT c.*, p.valor_produto, p.nome_produto, p.estoque
      FROM carrinho c
      INNER JOIN produtos p ON c.id_produto = p.id_produto
      WHERE c.idusuarios = $1
    `, [pedidoData.idusuarios]);

    console.log(`📦 [DB] ${carrinhoItens.rows.length} itens no carrinho`);

    // 3. Inserir itens do pedido
    for (const item of carrinhoItens.rows) {
      // Verificar estoque
      if (item.estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para ${item.nome_produto}`);
      }

      await client.query(
        `INSERT INTO pedido_itens 
         (id_pedido, id_produto, quantidade, preco_unitario, tamanho, cor, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          pedido.id_pedido,
          item.id_produto,
          item.quantidade,
          item.valor_produto,
          item.tamanho || '',
          item.cor || '',
          'PENDENTE'
        ]
      );

      // Atualizar estoque
      await client.query(
        'UPDATE produtos SET estoque = estoque - $1 WHERE id_produto = $2',
        [item.quantidade, item.id_produto]
      );
    }

    // 4. Limpar carrinho
    await client.query(
      'DELETE FROM carrinho WHERE idusuarios = $1',
      [pedidoData.idusuarios]
    );

    await client.query('COMMIT');

    return {
      pedido,
      total_itens: carrinhoItens.rows.length
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ [DB] Erro ao criar pedido:', error);
    throw error;
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
getDadosUsuarioParaPagamento,
addToCarrinho,
calcularTotalCarrinho,
criarPedidoCompleto,
  // addOrUpdateCarrinhoItem,
  // updateCarrinhoItemQuantity,
  // removeCarrinhoItem,
  // createPedidoWithItems,
  // updateEnderecoEntrega,
  // Produção
    getFavoritosByUserId,
  addToFavoritos,
  removeFromFavoritos,
  isFavorito,
  getTotalFavoritos,
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