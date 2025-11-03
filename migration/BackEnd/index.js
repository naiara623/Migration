// Importa as dependências necessárias
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const session = require('express-session');
const app = express();
require("dotenv").config();

const {
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
  updateUser,
  getCarrinhoByUserId,
  addToCarrinho,
  updateCarrinhoItem,
  removeFromCarrinho,
  clearCarrinho,
  createPedido,
  selectProductById,
  getPedidosByUserId,
  clearCarrinhoByUserId,
  getCarrinhoItemsByUserId,
  addOrUpdateCarrinhoItem,
  updateCarrinhoItemQuantity,
  removeCarrinhoItem,
  createPedidoWithItems,
  updateEnderecoEntrega,
  getUserByEmail // ADICIONAR ESTA FUNÇÃO QUE ESTÁ FALTANDO
} = require("./db");
// server.js - adicione no topo com os outros imports
const QueueSmartIntegration = require('./queue-smart-integration');
const queueSmart = new QueueSmartIntegration();
// ==========================================
// 🛠️ CONFIGURAÇÕES DO SERVIDOR
// ==========================================

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(session({
  secret: 'sua_chave_secreta',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    sameSite: 'lax'
  }
}));

// Middleware de debug de sessão
app.use((req, res, next) => {
  console.log('🔐 Sessão atual:', {
    sessionID: req.sessionID,
    user: req.session.user,
    cookies: req.headers.cookie
  });
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

const port = 3001;

// ==========================================
// 🛡️ MIDDLEWARE DE AUTENTICAÇÃO
// ==========================================

function autenticar(req, res, next) {
  console.log('🔐 Middleware de autenticação executando');
  console.log('📋 Sessão no middleware:', req.session);
  console.log('👤 User na sessão:', req.session.user);
  
  if (!req.session.user) {
    console.log('❌ AUTENTICAÇÃO FALHOU: Sem usuário na sessão');
    return res.status(401).json({ 
      erro: 'Não autenticado',
      detalhes: 'Faça login novamente'
    });
  }
  
  if (!req.session.user.id) {
    console.log('❌ AUTENTICAÇÃO FALHOU: Sem ID de usuário na sessão');
    return res.status(401).json({ 
      erro: 'Sessão inválida',
      detalhes: 'ID de usuário não encontrado'
    });
  }
  
  console.log('✅ Autenticação bem-sucedida para usuário:', req.session.user.id);
  next();
}

// ==========================================
// 🌐 ROTAS PÚBLICAS (NÃO PRECISAM DE AUTENTICAÇÃO)
// ==========================================


// Rota pública para obter produtos por categoria
app.get('/api/produtos/public/categoria/:nome_categoria', async (req, res) => {
  const nome_categoria = req.params.nome_categoria;
  
  try {
    console.log(`🌐 Buscando produtos públicos da categoria: ${nome_categoria}`);
    
    const categoria = await selectCategoryByName(nome_categoria);
    if (!categoria) {
      return res.status(404).json({ erro: 'Categoria não encontrada' });
    }

    const client = await pool.connect();
    const result = await client.query(`
      SELECT p.*, c.nome_categoria 
      FROM produtos p 
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria 
      WHERE c.nome_categoria = $1 AND p.estoque > 0
      ORDER BY p.data_criacao DESC
    `, [nome_categoria]);
    
    client.release();
    
    console.log(`✅ ${result.rows.length} produtos encontrados na categoria ${nome_categoria}`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar produtos por categoria:', error);
    res.status(500).json({ erro: 'Erro ao buscar produtos por categoria' });
  }
});


// ✅ Nova rota: buscar produtos por nome ou descrição
app.get('/api/produtos/public/search', async (req, res) => {
  const termo = req.query.q?.trim().toLowerCase();

  if (!termo) {
    return res.status(400).json({ erro: 'Informe um termo de busca válido.' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT p.*, c.nome_categoria
      FROM produtos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE p.estoque > 0
        AND (
          LOWER(p.nome_produto) LIKE $1 OR
          LOWER(p.descricao) LIKE $1
        )
      ORDER BY p.data_criacao DESC
    `, [`%${termo}%`]);

    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error);
    res.status(500).json({ erro: 'Erro ao buscar produtos.' });
  }
});


// Rota pública para obter categorias
app.get('/api/categorias/public', async (req, res) => {
  try {
    console.log('🌐 Buscando categorias públicas');
    const categorias = await selectAllCategories();
    res.json(categorias);
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    res.status(500).json({ erro: 'Erro ao buscar categorias' });
  }
});

// Rota pública para cadastro de usuário
app.post('/api/cadastro', async (req, res) => {
  console.log('req.body:', req.body);
  const { nome_usuario, email_user, senhauser, cep, estado_cidade, nome_rua, complemento, numero, referencia } = req.body;
  try {
    await insertUser({ nome_usuario, email_user, senhauser, cep, estado_cidade, nome_rua, complemento, numero, referencia });
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    if (error.message === 'Email já cadastrado') {
      res.status(409).json({ erro: 'Email já cadastrado' });
    } else {
      res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
    }
  }
});

// Rota pública para login
app.post('/api/login', async (req, res) => {
  const { email_user, senhauser } = req.body;
  try {
    const usuario = await selectUser(email_user, senhauser);
    if (usuario) {
      req.session.user = {
        id: usuario.idusuarios,
        email_user: usuario.email_user
      };
      
      req.session.save((err) => {
        if (err) {
          console.error('Erro ao salvar sessão:', err);
          return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
        console.log("Sessão salva - User ID:", req.session.user.id);
        res.json({ sucesso: true, usuario });
      });
    } else {
      res.status(401).json({ erro: 'Email ou senha incorretos' });
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

// Rota pública para verificar sessão
app.get('/api/check-session', (req, res) => {
  const sessionInfo = {
    autenticado: !!req.session.user,
    sessionID: req.sessionID,
    user: req.session.user
  };
  
  console.log('🔍 Check Session:', sessionInfo);
  res.json(sessionInfo);
});

app.get('/api/check-session-detailed', (req, res) => {
  const sessionInfo = {
    autenticado: !!req.session.user,
    sessionID: req.sessionID,
    user: req.session.user,
    session: req.session
  };
  
  console.log('🔍 Check Session Detailed:', sessionInfo);
  res.json(sessionInfo);
});

// Rota pública para categorias (mantida para compatibilidade)
app.get('/api/categorias', async (req, res) => {
  console.log('Requisição recebida em /api/categorias');
  try {
    const categorias = await selectAllCategories();
    res.json(categorias);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ erro: 'Erro ao buscar categorias' });
  }
});

// ==========================================
// 🔐 ROTAS PROTEGIDAS (PRECISAM DE AUTENTICAÇÃO)
// ==========================================


// 🆕 Rota pública para listar todos os produtos disponíveis
app.get('/api/produtos/public', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT p.*, c.nome_categoria
      FROM produtos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE p.estoque > 0
      ORDER BY p.data_criacao DESC
    `);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar produtos públicos:', error);
    res.status(500).json({ erro: 'Erro ao buscar produtos públicos' });
  }
});




// Rota protegida para obter produtos (apenas para usuários logados)
app.get('/api/produtos', autenticar, async (req, res) => {
  try {
    console.log('🔐 Buscando produtos protegidos para usuário:', req.session.user.id);
    const products = await selectAllProducts();
    res.json(products);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err.message || err);
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
});

// Rota protegida para obter produtos do usuário logado
app.get('/api/meus-produtos', autenticar, async (req, res) => {
  console.log('🔍 INICIANDO /api/meus-produtos');
  console.log('👤 Sessão completa:', req.session);
  console.log('🆔 User ID na sessão:', req.session.user?.id);
  
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT p.*, c.nome_categoria 
      FROM produtos p 
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria 
      WHERE p.idusuarios = $1
      ORDER BY p.data_criacao DESC
    `, [req.session.user.id]);
    
    client.release();
    
    console.log(`✅ Busca concluída: ${result.rows.length} produtos para usuário ${req.session.user.id}`);
    res.json(result.rows);
    
  } catch (error) {
    console.error('💥 ERRO CRÍTICO em /api/meus-produtos:', error);
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
});

// Rota protegida para cadastrar produto
app.post('/api/produtos', autenticar, upload.single('imagem_url'), async (req, res) => {
  console.log("📦 Dados recebidos para cadastro de produto:");
  console.log("body:", req.body);
  console.log("file:", req.file);
  console.log("usuário logado:", req.session.user);

  try {
    const { nome_produto, descricao, valor_produto, categoria, estoque } = req.body;

    const categoriaObj = await selectCategoryByName(categoria);
    if (!categoriaObj) {
      return res.status(400).json({ erro: 'Categoria inválida' });
    }

    const imagem_url = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await insertProduct({
      nome_produto,
      descricao,
      valor_produto: parseFloat(valor_produto),
      id_categoria: categoriaObj.id_categoria,
      estoque: parseInt(estoque) || 0,
      imagem_url,
      idusuarios: req.session.user.id
    });

    res.status(201).json({ 
      mensagem: 'Produto cadastrado com sucesso!',
      product 
    });
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    res.status(500).json({ erro: 'Erro ao cadastrar produto' });
  }
});

// Rota protegida para atualizar produto
app.put('/api/produtos/:id', autenticar, upload.single('imagem_url'), async (req, res) => {
  const id_produto = parseInt(req.params.id, 10);
  if (isNaN(id_produto)) {
    return res.status(400).json({ erro: 'ID de produto inválido' });
  }
  try {
    const { nome_produto, descricao, valor_produto, categoria, estoque } = req.body;
    const categoriaObj = await selectCategoryByName(categoria);
    if (!categoriaObj) {
      return res.status(400).json({ erro: 'Categoria inválida' });
    }
    const updateData = {
      nome_produto,
      descricao,
      valor_produto: parseFloat(valor_produto),
      id_categoria: categoriaObj.id_categoria,
      estoque: parseInt(estoque, 10) || 0
    };
    if (req.file) {
      updateData.imagem_url = `/uploads/${req.file.filename}`;
    }
    const updatedProduct = await updateProductById(id_produto, updateData);
    if (!updatedProduct) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    res.json({ mensagem: 'Produto atualizado com sucesso!', product: updatedProduct });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ erro: 'Erro ao atualizar produto' });
  }
});

// Rota protegida para deletar produto
app.delete('/api/produtos/:id', autenticar, async (req, res) => {
  const id_produto = parseInt(req.params.id, 10);
  if (isNaN(id_produto)) {
    return res.status(400).json({ erro: 'ID de produto inválido' });
  }
  try {
    const existing = await getProductById(id_produto);
    if (!existing) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    if (existing.idusuarios !== req.session.user.id) {
      return res.status(403).json({ erro: 'Você não tem permissão para deletar este produto' });
    }
    const deletedProduct = await deleteProductById(id_produto);
    res.json({ mensagem: 'Produto deletado com sucesso!', product: deletedProduct });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ erro: 'Erro ao deletar produto' });
  }
});

// Rota protegida para obter produto por ID
app.get('/api/produtos/:id', autenticar, async (req, res) => {
  try {
    const id = req.params.id;
    const product = await selectProductById(id);
    if (!product) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ erro: 'Erro ao buscar produto' });
  }
});

// ==========================================
// 🛒 ROTAS DO CARRINHO (PROTEGIDAS)
// ==========================================

app.get('/api/carrinho', autenticar, async (req, res) => {
  try {
    const carrinhoItens = await getCarrinhoByUserId(req.session.user.id);
    res.json(carrinhoItens);
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    res.status(500).json({ erro: 'Erro ao buscar carrinho' });
  }
});
// Atualize a rota POST /api/carrinho para salvar a configuração:

app.post('/api/carrinho', autenticar, async (req, res) => {
    const { id_produto, quantidade = 1, tamanho = '', cor = '', configuracao = {} } = req.body;
    
    console.log('🛒 Recebendo requisição para adicionar ao carrinho:', {
        usuario: req.session.user.id,
        id_produto,
        quantidade,
        tamanho,
        cor,
        configuracao
    });

    try {
        const client = await pool.connect();
        
        // Verificar se item já existe
        const existingItem = await client.query(
            `SELECT * FROM carrinho 
             WHERE idusuarios = $1 AND id_produto = $2 AND tamanho = $3 AND cor = $4`,
            [req.session.user.id, id_produto, tamanho, cor]
        );

        if (existingItem.rows.length > 0) {
            // Atualizar quantidade
            const result = await client.query(
                `UPDATE carrinho SET quantidade = quantidade + $1,
                 configuracao = $2
                 WHERE idusuarios = $3 AND id_produto = $4 AND tamanho = $5 AND cor = $6
                 RETURNING *`,
                [quantidade, configuracao, req.session.user.id, id_produto, tamanho, cor]
            );
            client.release();
            return res.json({ mensagem: 'Item atualizado no carrinho', item: result.rows[0] });
        } else {
            // Inserir novo item
            const result = await client.query(
                `INSERT INTO carrinho (idusuarios, id_produto, quantidade, tamanho, cor, configuracao) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [req.session.user.id, id_produto, quantidade, tamanho, cor, configuracao]
            );
            client.release();
            return res.status(201).json({ 
                mensagem: 'Produto adicionado ao carrinho', 
                item: result.rows[0] 
            });
        }
    } catch (error) {
        console.error('❌ Erro ao adicionar ao carrinho:', error);
        res.status(500).json({ 
            erro: 'Erro ao adicionar ao carrinho',
            detalhes: error.message 
        });
    }
});

app.put('/api/carrinho/:id', autenticar, async (req, res) => {
  try {
    const { quantidade } = req.body;
    const updatedItem = await updateCarrinhoItem(req.params.id, quantidade);
    res.json({ mensagem: 'Carrinho atualizado', item: updatedItem });
  } catch (error) {
    console.error('Erro ao atualizar carrinho:', error);
    res.status(500).json({ erro: 'Erro ao atualizar carrinho' });
  }
});

// 🧹 LIMPAR TODO O CARRINHO
app.delete('/api/carrinho/limpar', autenticar, async (req, res) => {
  try {
    const userId = req.session.user.id;

    // Chama a função que deleta tudo desse usuário
    await clearCarrinho(userId);

    res.json({ mensagem: 'Carrinho limpo com sucesso!' });
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error);
    res.status(500).json({ erro: 'Erro ao limpar carrinho' });
  }
});

// 🗑️ REMOVER ITEM INDIVIDUAL
app.delete('/api/carrinho/:id', autenticar, async (req, res) => {
  try {
    const removedItem = await removeFromCarrinho(req.params.id);
    res.json({ mensagem: 'Item removido do carrinho', item: removedItem });
  } catch (error) {
    console.error('Erro ao remover do carrinho:', error);
    res.status(500).json({ erro: 'Erro ao remover do carrinho' });
  }
});


app.get('/api/carrinho/quantidade', autenticar, async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as quantidade FROM carrinho WHERE idusuarios = $1', [req.session.user.id]);
    res.json({ quantidade: parseInt(result.rows[0].quantidade) });
  } catch (error) {
    console.error('Erro ao buscar quantidade do carrinho:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// ==========================================
// 📦 ROTAS DE PEDIDOS (PROTEGIDAS)
// ==========================================

app.post('/api/pedidos', autenticar, async (req, res) => {
  console.log('📦 Requisição recebida:', req.body);
  console.log('👤 Usuário da sessão:', req.session.user);

  try {
    const { total, metodo_pagamento, endereco_entrega, itens } = req.body;
    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ erro: 'Itens do pedido inválidos' });
    }

    const pedido = await createPedidoWithItems({ 
      idusuarios: req.session.user?.id, 
      total, 
      metodo_pagamento, 
      endereco_entrega, 
      itens 
    });

    res.status(201).json({ mensagem: 'Pedido criado com sucesso!', pedido });
  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error);
    res.status(500).json({ erro: 'Erro ao criar pedido', detalhes: error.message });
  }
});


app.get('/api/pedidos', autenticar, async (req, res) => {
  try {
    const pedidos = await getPedidosByUserId(req.session.user.id);
    res.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ erro: 'Erro ao buscar pedidos' });
  }
});

// ==========================================
// 👤 ROTAS DO USUÁRIO (PROTEGIDAS)
// ==========================================

app.get('/api/usuario-atual', autenticar, async (req, res) => {
  try {
    const usuario = await getUserByEmail(req.session.user.email_user);
    if (usuario) {
      res.json({
        id: usuario.idusuarios,
        nome: usuario.nome_usuario,
        email: usuario.email_user,
        senha: usuario.senhauser,
        estado: usuario.estado_cidade,
        rua: usuario.nome_rua,
        complemento: usuario.complemento,
        numero: usuario.numero,
        referencia: usuario.referencia,
        followers: 245,
        following: 178
      });
    } else {
      res.status(404).json({ erro: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ erro: 'Erro ao buscar usuário' });
  }
});

app.put('/api/usuarios/:email', autenticar, async (req, res) => {
  const { email } = req.params;
  const { nome_usuario, email_user, estado_cidade, nome_rua, complemento, numero, referencia } = req.body;
  try {
    const updatedUser = await updateUser(email_user, { nome_usuario, email_user, estado_cidade, nome_rua, complemento, numero, referencia });
    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ erro: 'Erro ao atualizar usuário' });
  }
});

app.post('/api/logout', autenticar, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao fazer logout:', err);
      return res.status(500).json({ erro: 'Erro ao fazer logout' });
    }
    res.json({ sucesso: true, mensagem: 'Logout realizado com sucesso' });
  });
});

// ==========================================
// 🐛 ROTAS DE DEBUG
// ==========================================

app.get('/api/debug/produtos', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT p.*, u.email_user, u.nome_usuario 
      FROM produtos p 
      LEFT JOIN usuarios u ON p.idusuarios = u.idusuarios 
      ORDER BY p.data_criacao DESC
    `);
    client.release();
    console.log('🐛 DEBUG - Todos os produtos no banco:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro no debug:', error);
    res.status(500).json({ erro: error.message });
  }
});

// ==========================================
// 🚀 INICIALIZAÇÃO DO SERVIDOR
// ==========================================




// E adicione a rota de callback
app.post('/api/smart4-callback', async (req, res) => {
    console.log('🔄 Callback recebido da Queue Smart 4.0:', req.body);

    try {
        const { itemId, status, stage, progress, payload } = req.body;

        // Atualizar status do pedido no banco
        await atualizarStatusPedido(payload.pedidoInfo.id_pedido, {
            status_maquina: status,
            estagio_maquina: stage,
            progresso_maquina: progress,
            item_id_maquina: itemId
        });

        // Se o pedido foi concluído
        if (status === 'COMPLETED') {
            console.log(`✅ Pedido ${payload.pedidoInfo.id_pedido} concluído pela máquina`);
            // Aqui você pode enviar email, notificar usuário, etc.
        }

        // Se houve falha
        if (status === 'FAILED') {
            console.error(`❌ Pedido ${payload.pedidoInfo.id_pedido} falhou na máquina`);
            // Notificar administrador
        }

        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Erro ao processar callback:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// Função para atualizar status do pedido
async function atualizarStatusPedido(id_pedido, dadosAtualizacao) {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            UPDATE pedidos 
            SET status_maquina = $1, 
                estagio_maquina = $2, 
                progresso_maquina = $3,
                item_id_maquina = $4,
                atualizado_em = NOW()
            WHERE id_pedido = $5
            RETURNING *
        `, [
            dadosAtualizacao.status_maquina,
            dadosAtualizacao.estagio_maquina,
            dadosAtualizacao.progresso_maquina,
            dadosAtualizacao.item_id_maquina,
            id_pedido
        ]);
        
        return result.rows[0];
    } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Teste rápido - adicione temporariamente no server.js
app.get('/api/teste-maquina', async (req, res) => {
    try {
        const status = await queueSmart.statusMaquina();
        res.json({ status: 'Conexão OK', dados: status });
    } catch (error) {
        res.status(500).json({ erro: 'Falha na conexão', detalhes: error.message });
    }
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log('📊 Rotas disponíveis:');
  console.log('🌐 Públicas: /api/produtos/public, /api/categorias/public, /api/cadastro, /api/login');
  console.log('🔐 Protegidas: /api/produtos, /api/meus-produtos, /api/carrinho, /api/pedidos');
});