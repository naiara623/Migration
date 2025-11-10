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

// server.js - adicione estas rotas após as rotas existentes

// ==========================================
// 🏭 ROTAS DE PRODUÇÃO E MONITORAMENTO
// ==========================================

// Rota para criar pedido e enviar para produção
app.post('/api/pedidos/producao', autenticar, async (req, res) => {
    console.log('🏭 Criando pedido com monitoramento de produção:', req.body);

    try {
        const { total, metodo_pagamento, endereco_entrega, itens } = req.body;
        
        if (!Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({ erro: 'Itens do pedido inválidos' });
        }

        // 1. Criar pedido no banco
        const pedido = await createPedidoComRastreamento({ 
            idusuarios: req.session.user.id, 
            total, 
            metodo_pagamento, 
            endereco_entrega, 
            itens 
        });

        // 2. Enviar cada item individualmente para a máquina
        const resultadosProducao = [];
        
        for (let itemIndex = 0; itemIndex < itens.length; itemIndex++) {
            const item = itens[itemIndex];
            const product = await getProductById(item.id_produto);
            
            if (product && item.configuracao) {
                try {
                    // Enviar cada unidade do produto
                    const itemsMaquina = await queueSmart.enviarItemParaMaquina(
                        pedido,
                        product,
                        item.configuracao,
                        itemIndex,
                        item.quantidade
                    );

                    // Registrar cada item na produção
                    for (const itemMaquina of itemsMaquina) {
                        const itemProducao = await registrarItemProducao({
                            id_pedido: pedido.id_pedido,
                            id_produto: item.id_produto,
                            item_index: itemIndex,
                            item_unit: itemMaquina.item_unit,
                            item_id_maquina: itemMaquina.item_id_maquina,
                            order_id: itemMaquina.order_id,
                            slot_expedicao: `SLOT-${Math.floor(Math.random() * 20) + 1}` // Slot aleatório para exemplo
                        });
                        
                        resultadosProducao.push(itemProducao);
                    }

                } catch (error) {
                    console.error(`⚠️ Erro ao enviar item ${itemIndex} para produção:`, error);
                    // Continua com os outros itens mesmo se um falhar
                }
            }
        }

        console.log(`✅ Pedido ${pedido.id_pedido} criado com ${resultadosProducao.length} itens de produção`);

        res.status(201).json({ 
            mensagem: 'Pedido criado e enviado para produção!', 
            pedido,
            itens_producao: resultadosProducao.length,
            detalhes: 'Cada item está sendo produzido individualmente e será monitorado'
        });

    } catch (error) {
        console.error('❌ Erro ao criar pedido de produção:', error);
        res.status(500).json({ 
            erro: 'Erro ao criar pedido', 
            detalhes: error.message 
        });
    }
});

// Rota para receber callbacks da Queue Smart 4.0 (ATUALIZADA)
app.post('/api/smart4-callback', async (req, res) => {
    console.log('🔄 Callback recebido da Queue Smart 4.0:', req.body);

    try {
        const { itemId, status, stage, progress, payload } = req.body;

        // Encontrar o item de produção correspondente
        const client = await pool.connect();
        const itemProducao = await client.query(
            'SELECT * FROM producao_itens WHERE item_id_maquina = $1',
            [itemId]
        );

        if (itemProducao.rows.length === 0) {
            console.error('❌ Item de produção não encontrado para itemId:', itemId);
            return res.status(404).json({ error: 'Item não encontrado' });
        }

        const producaoItem = itemProducao.rows[0];

        // Atualizar status do item de produção
        await atualizarStatusProducao(producaoItem.id_producao, {
            status_maquina: status,
            estagio_maquina: stage,
            progresso_maquina: progress,
            slot_expedicao: producaoItem.slot_expedicao
        });

        console.log(`✅ Item ${itemId} atualizado: ${status} - ${stage} (${progress}%)`);

        // Se o item foi concluído
        if (status === 'COMPLETED') {
            console.log(`🎉 Item ${itemId} concluído! Slot: ${producaoItem.slot_expedicao}`);
            
            // Verificar se todos os itens do pedido estão prontos
            const statusPedido = await verificarPedidoCompleto(producaoItem.id_pedido);
            
            if (statusPedido.completo) {
                console.log(`🎊 PEDIDO ${producaoItem.id_pedido} COMPLETO! Todos os itens prontos.`);
                
                // TODO: Enviar email para o cliente
                // TODO: Notificar usuário
            }
        }

        res.status(200).json({ received: true, updated: true });

    } catch (error) {
        console.error('Erro ao processar callback:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// Rota para obter status detalhado do pedido
app.get('/api/pedidos/:id/status', autenticar, async (req, res) => {
    try {
        const id_pedido = parseInt(req.params.id);
        const statusDetalhado = await getStatusDetalhadoPedido(id_pedido);
        
        // Verificar se o pedido pertence ao usuário
        const pedido = statusDetalhado[0];
        if (!pedido || pedido.idusuarios !== req.session.user.id) {
            return res.status(404).json({ erro: 'Pedido não encontrado' });
        }

        // Agrupar por item do pedido
        const itensAgrupados = {};
        statusDetalhado.forEach(item => {
            if (!itensAgrupados[item.id_pedido_item]) {
                itensAgrupados[item.id_pedido_item] = {
                    ...item,
                    unidades: []
                };
            }
            if (item.id_producao) {
                itensAgrupados[item.id_pedido_item].unidades.push({
                    id_producao: item.id_producao,
                    item_unit: item.item_unit,
                    status_maquina: item.status_maquina,
                    estagio_maquina: item.estagio_maquina,
                    progresso_maquina: item.progresso_maquina,
                    slot_expedicao: item.slot_expedicao,
                    item_id_maquina: item.item_id_maquina,
                    order_id: item.order_id
                });
            }
        });

        const resultado = {
            pedido: {
                id_pedido: pedido.id_pedido,
                status_geral: pedido.status_geral,
                total: pedido.total,
                data_pedido: pedido.data_pedido
            },
            itens: Object.values(itensAgrupados),
            resumo: await verificarPedidoCompleto(id_pedido)
        };

        res.json(resultado);

    } catch (error) {
        console.error('Erro ao buscar status do pedido:', error);
        res.status(500).json({ erro: 'Erro ao buscar status' });
    }
});

// Rota para monitorar produção em tempo real
app.get('/api/producao/monitoramento', autenticar, async (req, res) => {
    try {
        const client = await pool.connect();
        
        // Pedidos em produção do usuário
        const pedidosProducao = await client.query(`
            SELECT DISTINCT p.*,
                   (SELECT COUNT(*) FROM producao_itens WHERE id_pedido = p.id_pedido) as total_itens,
                   (SELECT COUNT(*) FROM producao_itens WHERE id_pedido = p.id_pedido AND status_maquina = 'COMPLETED') as itens_prontos
            FROM pedidos p
            INNER JOIN producao_itens pri ON p.id_pedido = pri.id_pedido
            WHERE p.idusuarios = $1 AND p.status_geral = 'PROCESSANDO'
            ORDER BY p.data_pedido DESC
        `, [req.session.user.id]);

        // Itens em produção
        const itensProducao = await client.query(`
            SELECT pri.*, p.nome_produto, p.imagem_url, pd.id_pedido
            FROM producao_itens pri
            INNER JOIN produtos p ON pri.id_produto = p.id_produto
            INNER JOIN pedidos pd ON pri.id_pedido = pd.id_pedido
            WHERE pd.idusuarios = $1 AND pri.status_maquina != 'COMPLETED'
            ORDER BY pri.criado_em DESC
        `, [req.session.user.id]);

        client.release();

        res.json({
            pedidos_em_producao: pedidosProducao.rows,
            itens_em_producao: itensProducao.rows,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro no monitoramento de produção:', error);
        res.status(500).json({ erro: 'Erro no monitoramento' });
    }
});


//testes

// Teste rápido - adicione temporariamente no server.js
app.get('/api/teste-maquina', async (req, res) => {
    try {
        const status = await queueSmart.statusMaquina();
        res.json({ status: 'Conexão OK', dados: status });
    } catch (error) {
        res.status(500).json({ erro: 'Falha na conexão', detalhes: error.message });
    }
});

// server.js - adicione antes do app.listen()
app.get('/api/teste-conexao-maquina', async (req, res) => {
    try {
        console.log('🧪 Testando conexão com Queue Smart 4.0...');
        
        // Teste 1: Saúde da aplicação
        const health = await queueSmart.request('/saude');
        console.log('✅ Saúde da máquina:', health);

        // Teste 2: Status da fila
        const status = await queueSmart.statusMaquina();
        console.log('✅ Status da fila:', status);

        // Teste 3: Listar itens na fila
        const itens = await queueSmart.request('/fila/itens?limit=5');
        console.log('✅ Itens na fila:', itens.items.length);

        res.json({
            sucesso: true,
            mensagem: 'Conexão com Queue Smart 4.0 estabelecida com sucesso!',
            dados: {
                saúde: health,
                status_fila: status,
                itens_na_fila: itens.items.length
            }
        });

    } catch (error) {
        console.error('❌ Falha no teste de conexão:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Falha na conexão com Queue Smart 4.0',
            detalhes: error.message,
            dica: 'Verifique se a Queue Smart 4.0 está rodando na porta 3000'
        });
    }
});

// server.js - rota para testar envio de pedido
app.post('/api/teste-envio-pedido', autenticar, async (req, res) => {
    try {
        console.log('🧪 Testando envio de pedido para máquina...');

        // Dados de teste
        const pedidoTeste = {
            id_pedido: 999,
            idusuarios: req.session.user.id,
            total: 150.50
        };

        const produtoTeste = {
            id_produto: 1,
            nome_produto: 'Caixa Personalizada Teste'
        };

        const configuracaoTeste = {
            tamanho: 'M',
            corDentro: 'Azul',
            corFora: 'Preto',
            material: 'Nylon',
            estampa: 'Estrelas'
        };

        console.log('📤 Enviando pedido de teste...');
        const resultado = await queueSmart.enviarPedidoParaMaquina(
            pedidoTeste,
            produtoTeste,
            configuracaoTeste
        );

        res.json({
            sucesso: true,
            mensagem: 'Pedido de teste enviado com sucesso!',
            dados: {
                item_id_maquina: resultado.id,
                configuracao_enviada: configuracaoTeste,
                payload_gerado: {
                    orderId: `PED-${pedidoTeste.id_pedido}-${Date.now()}`,
                    andares: 2, // M = 2 andares
                    materialExterno: 'PLASTICO_PRETO',
                    materialInterno: 'PLASTICO_AZUL',
                    tipoMaterial: 'NYLON',
                    padrao: 'PADRAO_ESTRELAS'
                }
            }
        });

    } catch (error) {
        console.error('❌ Falha no envio do pedido teste:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Falha ao enviar pedido para máquina',
            detalhes: error.message
        });
    }
});

// server.js - rota para testar callback manualmente
app.post('/api/teste-callback-manual', async (req, res) => {
    try {
        console.log('🧪 Testando callback manual...');

        // Simula um callback da máquina
        const callbackSimulado = {
            itemId: '12345-test',
            status: 'PROCESSING',
            stage: 'CORTE',
            progress: 25,
            payload: {
                orderId: 'PED-999-123456789',
                pedidoInfo: {
                    id_pedido: 999,
                    id_usuario: 1,
                    total: 150.50
                }
            }
        };

        console.log('📨 Simulando callback:', callbackSimulado);

        // Chama a rota de callback como se fosse a máquina
        const response = await fetch('http://localhost:3001/api/smart4-callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(callbackSimulado)
        });

        const resultado = await response.json();

        res.json({
            sucesso: true,
            mensagem: 'Callback simulado enviado!',
            resposta: resultado
        });

    } catch (error) {
        console.error('❌ Falha no teste de callback:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Falha no teste de callback',
            detalhes: error.message
        });
    }
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log('📊 Rotas disponíveis:');
  console.log('🌐 Públicas: /api/produtos/public, /api/categorias/public, /api/cadastro, /api/login');
  console.log('🔐 Protegidas: /api/produtos, /api/meus-produtos, /api/carrinho, /api/pedidos');
});