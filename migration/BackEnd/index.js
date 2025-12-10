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
  getCarrinhoByUserId,
  updateCarrinhoItem,
  removeFromCarrinho,
  clearCarrinho,
  selectProductById,
 
  // Produção (CORRIGIDAS)
  createPedidoComRastreamento,
  registrarItemProducao,
  atualizarStatusProducao,
  getStatusDetalhadoPedido,
  verificarPedidoCompleto,
  getStatusProducaoByPedido,
  // Endereços (NOVAS)
  insertEndereco,
   deleteEndereco,
  getEnderecoByUserId,
  updateEndereco
} = require("./db");

// server.js - adicione no topo com os outros imports
const QueueSmartIntegration = require('./queue-smart-integration');
const queueSmart = new QueueSmartIntegration('http://52.72.137.244:3000');

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
  
  if (!req.session.user.idusuarios) {
    console.log('❌ AUTENTICAÇÃO FALHOU: Sem ID de usuário na sessão');
    return res.status(401).json({ 
      erro: 'Sessão inválida',
      detalhes: 'ID de usuário não encontrado'
    });
  }
  
  console.log('✅ Autenticação bem-sucedida para usuário:', req.session.user.idusuarios);
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

// Rota pública para cadastro de usuário (CORRIGIDA)
app.post('/api/cadastro', async (req, res) => {
  console.log('📝 req.body:', req.body);
  const { nome_usuario, email_user, senhauser, numero } = req.body; // CORRIGIDO: email_user
  
  try {
    const usuario = await insertUser({ 
      nome_usuario, 
      email_user, // CORRIGIDO
      senhauser, 
      numero 
    });
    
    res.status(201).json({ 
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario 
    });
  } catch (error) {
    console.error('❌ Erro ao cadastrar usuário:', error);
    if (error.message === 'Email já cadastrado') {
      res.status(409).json({ erro: 'Email já cadastrado' });
    } else {
      res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
    }
  }
});

// Rota pública para login (CORRIGIDA)
app.post('/api/login', async (req, res) => {
  const { email_user, senhauser } = req.body; // CORRIGIDO: email_user
  
  try {
    const usuario = await selectUser(email_user, senhauser); // CORRIGIDO
    
    if (usuario) {
      req.session.user = {
        idusuarios: usuario.idusuarios,
        email_user: usuario.email_user // CORRIGIDO
      };
      
      req.session.save((err) => {
        if (err) {
          console.error('❌ Erro ao salvar sessão:', err);
          return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
        console.log("✅ Sessão salva - User ID:", req.session.user.idusuarios);
        res.json({ 
          sucesso: true, 
          usuario: {
            idusuarios: usuario.idusuarios,
            nome_usuario: usuario.nome_usuario,
            email_user: usuario.email_user,
            numero: usuario.numero
          }
        });
      });
    } else {
      res.status(401).json({ erro: 'Email ou senha incorretos' });
    }
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

// Rota para obter dados completos do usuário (CORRIGIDA)
app.get('/api/usuario-completo', autenticar, async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query(
            'SELECT idusuarios, nome_usuario, email_user, senhauser, numero FROM usuarios WHERE idusuarios = $1', // CORRIGIDO
            [req.session.user.idusuarios]
        );
        client.release();

        if (result.rows.length > 0) {
            const usuario = result.rows[0];
            res.json({
                idusuarios: usuario.idusuarios,
                nome: usuario.nome_usuario,
                email: usuario.email_user, // CORRIGIDO
                senha: usuario.senhauser,
                numero: usuario.numero
            });
        } else {
            res.status(404).json({ erro: 'Usuário não encontrado' });
        }
    } catch (error) {
        console.error('❌ Erro ao buscar usuário completo:', error);
        res.status(500).json({ erro: 'Erro ao buscar dados do usuário' });
    }
});

// Rota para atualizar usuário (CORRIGIDA)
app.put('/api/usuarios/:email', autenticar, async (req, res) => {
    const { email } = req.params;
    const { nome_usuario, email_user, numero, senhauser } = req.body; // CORRIGIDO
    
    try {
        const client = await pool.connect();
        
        let sql;
        let values;
        
        if (senhauser) {
            // Se senha foi fornecida, atualizar com senha
            sql = `
                UPDATE usuarios
                SET nome_usuario = $1,
                    email_user = $2, -- CORRIGIDO
                    numero = $3,
                    senhauser = $4
                WHERE email_user = $5 -- CORRIGIDO
                RETURNING *;
            `;
            values = [
                nome_usuario,
                email_user, // CORRIGIDO
                numero,
                senhauser,
                email
            ];
        } else {
            // Se senha não foi fornecida, manter senha atual
            sql = `
                UPDATE usuarios
                SET nome_usuario = $1,
                    email_user = $2, -- CORRIGIDO
                    numero = $3
                WHERE email_user = $4 -- CORRIGIDO
                RETURNING *;
            `;
            values = [
                nome_usuario,
                email_user, // CORRIGIDO
                numero,
                email
            ];
        }

        const result = await client.query(sql, values);
        client.release();

        if (result.rows.length > 0) {
            const { senhauser, ...userWithoutPassword } = result.rows[0];
            res.json(userWithoutPassword);
        } else {
            res.status(404).json({ erro: 'Usuário não encontrado' });
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        res.status(500).json({ erro: 'Erro ao atualizar usuário' });
    }
});

// Rota para deletar usuário (CORRIGIDA)
app.delete('/api/usuarios/:email', autenticar, async (req, res) => {
    const { email } = req.params;
    
    try {
        const client = await pool.connect();
        
        // Verificar se o usuário existe e pertence à sessão
        const userCheck = await client.query(
            'SELECT idusuarios FROM usuarios WHERE email_user = $1', // CORRIGIDO
            [email]
        );
        
        if (userCheck.rows.length === 0) {
            client.release();
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        
        if (userCheck.rows[0].idusuarios !== req.session.user.idusuarios) {
            client.release();
            return res.status(403).json({ erro: 'Não autorizado' });
        }
        
        // Deletar usuário
        await client.query('DELETE FROM usuarios WHERE email_user = $1', [email]); // CORRIGIDO
        client.release();
        
        // Destruir sessão
        req.session.destroy();
        
        res.json({ mensagem: 'Usuário deletado com sucesso' });
    } catch (error) {
        console.error('❌ Erro ao deletar usuário:', error);
        res.status(500).json({ erro: 'Erro ao deletar usuário' });
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
  console.log('🌐 Requisição recebida em /api/categorias');
  try {
    const categorias = await selectAllCategories();
    res.json(categorias);
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    res.status(500).json({ erro: 'Erro ao buscar categorias' });
  }
});

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

// ==========================================
// 🏠 ROTAS DE ENDEREÇO (NOVAS)
// ==========================================

// server.js - adicione estas rotas após a rota GET /api/enderecos

// Rota para atualizar endereço
app.put('/api/enderecos/:id', autenticar, async (req, res) => {
  try {
    const id_endereco = parseInt(req.params.id);
    const { cep, estado, complemento, numero, cidade, bairro } = req.body;
    
    // Verificar se o endereço pertence ao usuário
    const client = await pool.connect();
    const enderecoCheck = await client.query(
      'SELECT idusuarios FROM endereco WHERE id_endereco = $1',
      [id_endereco]
    );
    
    if (enderecoCheck.rows.length === 0) {
      client.release();
      return res.status(404).json({ erro: 'Endereço não encontrado' });
    }
    
    if (enderecoCheck.rows[0].idusuarios !== req.session.user.idusuarios) {
      client.release();
      return res.status(403).json({ erro: 'Não autorizado' });
    }
    
    // Atualizar endereço
    const enderecoAtualizado = await updateEndereco(id_endereco, {
      cep,
      estado,
      complemento,
      numero,
      cidade,
      bairro
    });
    
    client.release();
    
    res.json({
      mensagem: 'Endereço atualizado com sucesso!',
      endereco: enderecoAtualizado
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar endereço:', error);
    res.status(500).json({ erro: 'Erro ao atualizar endereço' });
  }
});

// Rota para deletar endereço
app.delete('/api/enderecos/:id', autenticar, async (req, res) => {
  try {
    const id_endereco = parseInt(req.params.id);
    
    // Verificar se o endereço pertence ao usuário
    const client = await pool.connect();
    const enderecoCheck = await client.query(
      'SELECT idusuarios FROM endereco WHERE id_endereco = $1',
      [id_endereco]
    );
    
    if (enderecoCheck.rows.length === 0) {
      client.release();
      return res.status(404).json({ erro: 'Endereço não encontrado' });
    }
    
    if (enderecoCheck.rows[0].idusuarios !== req.session.user.idusuarios) {
      client.release();
      return res.status(403).json({ erro: 'Não autorizado' });
    }
    
    // Deletar endereço
    const enderecoDeletado = await deleteEndereco(id_endereco);
    
    client.release();
    
    res.json({
      mensagem: 'Endereço deletado com sucesso!',
      endereco: enderecoDeletado
    });
  } catch (error) {
    console.error('❌ Erro ao deletar endereço:', error);
    res.status(500).json({ erro: 'Erro ao deletar endereço' });
  }
});

// Rota para criar/atualizar endereço (versão simplificada - POST cria ou atualiza)
app.post('/api/enderecos', autenticar, async (req, res) => {
  try {
    const { cep, estado, complemento, numero, cidade, bairro } = req.body;
    
    const endereco = await insertEndereco({
      cep,
      estado,
      complemento,
      numero,
      cidade,
      bairro,
      idusuarios: req.session.user.idusuarios
    });
    
    res.status(201).json({
      mensagem: 'Endereço salvo com sucesso!',
      endereco
    });
  } catch (error) {
    console.error('❌ Erro ao salvar endereço:', error);
    res.status(500).json({ erro: 'Erro ao salvar endereço' });
  }
});

// Rota para verificar se usuário tem endereço cadastrado
app.get('/api/enderecos/existe', autenticar, async (req, res) => {
  try {
    const endereco = await getEnderecoByUserId(req.session.user.idusuarios);
    
    res.json({
      temEndereco: !!endereco,
      endereco: endereco || null
    });
  } catch (error) {
    console.error('❌ Erro ao verificar endereço:', error);
    res.status(500).json({ erro: 'Erro ao verificar endereço' });
  }
});

// ==========================================
// 🔐 ROTAS PROTEGIDAS (PRECISAM DE AUTENTICAÇÃO)
// ==========================================

// Rota protegida para obter produtos (apenas para usuários logados)
app.get('/api/produtos', autenticar, async (req, res) => {
  try {
    console.log('🔐 Buscando produtos protegidos para usuário:', req.session.user.idusuarios);
    const products = await selectAllProducts();
    res.json(products);
  } catch (err) {
    console.error('❌ Erro ao buscar produtos:', err.message || err);
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
});

// Rota protegida para obter produtos do usuário logado
app.get('/api/meus-produtos', autenticar, async (req, res) => {
  console.log('🔍 INICIANDO /api/meus-produtos');
  console.log('👤 Sessão completa:', req.session);
  console.log('🆔 User ID na sessão:', req.session.user?.idusuarios);
  
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT p.*, c.nome_categoria 
      FROM produtos p 
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria 
      WHERE p.idusuarios = $1
      ORDER BY p.data_criacao DESC
    `, [req.session.user.idusuarios]);
    
    client.release();
    
    console.log(`✅ Busca concluída: ${result.rows.length} produtos para usuário ${req.session.user.idusuarios}`);
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
      idusuarios: req.session.user.idusuarios
    });

    res.status(201).json({ 
      mensagem: 'Produto cadastrado com sucesso!',
      product 
    });
  } catch (error) {
    console.error('❌ Erro ao cadastrar produto:', error);
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
    console.error('❌ Erro ao atualizar produto:', error);
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
    if (existing.idusuarios !== req.session.user.idusuarios) {
      return res.status(403).json({ erro: 'Você não tem permissão para deletar este produto' });
    }
    const deletedProduct = await deleteProductById(id_produto);
    res.json({ mensagem: 'Produto deletado com sucesso!', product: deletedProduct });
  } catch (error) {
    console.error('❌ Erro ao deletar produto:', error);
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
    console.error('❌ Erro ao buscar produto:', error);
    res.status(500).json({ erro: 'Erro ao buscar produto' });
  }
});

// ==========================================
// 🛒 ROTAS DO CARRINHO (PROTEGIDAS)
// ==========================================

app.get('/api/carrinho', autenticar, async (req, res) => {
  try {
    const carrinhoItens = await getCarrinhoByUserId(req.session.user.idusuarios);
    res.json(carrinhoItens);
  } catch (error) {
    console.error('❌ Erro ao buscar carrinho:', error);
    res.status(500).json({ erro: 'Erro ao buscar carrinho' });
  }
});

// Atualize a rota POST /api/carrinho para salvar a configuração:
app.post('/api/carrinho', autenticar, async (req, res) => {
    const { id_produto, quantidade = 1, tamanho = '', cor = '', configuracao = {} } = req.body;
    
    console.log('🛒 Recebendo requisição para adicionar ao carrinho:', {
        usuario: req.session.user.idusuarios,
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
            [req.session.user.idusuarios, id_produto, tamanho, cor]
        );

        if (existingItem.rows.length > 0) {
            // Atualizar quantidade
            const result = await client.query(
                `UPDATE carrinho SET quantidade = quantidade + $1,
                 configuracao = $2
                 WHERE idusuarios = $3 AND id_produto = $4 AND tamanho = $5 AND cor = $6
                 RETURNING *`,
                [quantidade, configuracao, req.session.user.idusuarios, id_produto, tamanho, cor]
            );
            client.release();
            return res.json({ mensagem: 'Item atualizado no carrinho', item: result.rows[0] });
        } else {
            // Inserir novo item
            const result = await client.query(
                `INSERT INTO carrinho (idusuarios, id_produto, quantidade, tamanho, cor, configuracao) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [req.session.user.idusuarios, id_produto, quantidade, tamanho, cor, configuracao]
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
    console.error('❌ Erro ao atualizar carrinho:', error);
    res.status(500).json({ erro: 'Erro ao atualizar carrinho' });
  }
});

// 🧹 LIMPAR TODO O CARRINHO
app.delete('/api/carrinho/limpar', autenticar, async (req, res) => {
  try {
    const userId = req.session.user.idusuarios;

    // Chama a função que deleta tudo desse usuário
    await clearCarrinho(userId);

    res.json({ mensagem: 'Carrinho limpo com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao limpar carrinho:', error);
    res.status(500).json({ erro: 'Erro ao limpar carrinho' });
  }
});

// 🗑️ REMOVER ITEM INDIVIDUAL
app.delete('/api/carrinho/:id', autenticar, async (req, res) => {
  try {
    const removedItem = await removeFromCarrinho(req.params.id);
    res.json({ mensagem: 'Item removido do carrinho', item: removedItem });
  } catch (error) {
    console.error('❌ Erro ao remover do carrinho:', error);
    res.status(500).json({ erro: 'Erro ao remover do carrinho' });
  }
});

app.get('/api/carrinho/quantidade', autenticar, async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as quantidade FROM carrinho WHERE idusuarios = $1', [req.session.user.idusuarios]);
    res.json({ quantidade: parseInt(result.rows[0].quantidade) });
  } catch (error) {
    console.error('❌ Erro ao buscar quantidade do carrinho:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// ==========================================
// 👤 ROTAS DO USUÁRIO (PROTEGIDAS - CORRIGIDAS)
// ==========================================
app.get('/api/usuario-atual', autenticar, async (req, res) => {
  try {
    console.log('🔍 Sessão atual:', req.session.user);

    if (!req.session.user || !req.session.user.idusuarios) {
      return res.status(401).json({ erro: 'Usuário não autenticado' });
    }

    const client = await pool.connect();
    const result = await client.query(
      `SELECT idusuarios, nome_usuario, email_user, senhauser, numero
       FROM usuarios 
       WHERE idusuarios = $1`,
      [req.session.user.idusuarios]
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const usuario = result.rows[0];

    const userData = {
      idusuarios: usuario.idusuarios,
      nome: usuario.nome_usuario,
      email: usuario.email_user,
      senha: usuario.senhauser,
      numero: usuario.numero
      // senha removida por segurança
    };

    console.log('✅ Dados enviados ao front:', userData);
    res.json(userData);

  } catch (error) {
    console.error('❌ Erro ao buscar usuário atual:', error);
    res.status(500).json({
      erro: 'Erro interno ao buscar usuário',
      detalhes: error.message
    });
  }
});


// Rota para atualizar usuário por ID - CORRIGIDA
app.put('/api/usuario-atual/:id', autenticar, async (req, res) => {
  // CORREÇÃO: Usar req.params.id, não req.params.idusuarios
  const userId = parseInt(req.params.id);
  const { nome, email, numero, senha } = req.body;
  
  console.log('📝 Atualizando usuário:', { userId, nome, email, numero });
  
  // Verificar se o usuário da sessão é o mesmo que está sendo atualizado
  if (userId !== req.session.user.idusuarios) {
    console.log('❌ Não autorizado: userId da sessão:', req.session.user.idusuarios, 'userId da requisição:', userId);
    return res.status(403).json({ 
      erro: 'Não autorizado - você só pode editar seu próprio perfil',
      detalhes: `Sessão: ${req.session.user.idusuarios}, Requisição: ${userId}`
    });
  }

  try {
    const client = await pool.connect();
    
    let sql;
    let values;
    
    if (senha && senha.trim() !== '') {
      // Atualizar com senha
      sql = `
        UPDATE usuarios 
        SET nome_usuario = $1, email_user = $2, numero = $3, senhauser = $4
        WHERE idusuarios = $5 
        RETURNING idusuarios, nome_usuario, email_user, numero
      `;
      values = [nome, email, numero, senha, userId];
    } else {
      // Atualizar sem senha - CORREÇÃO: faltava um parâmetro aqui
      sql = `
        UPDATE usuarios 
        SET nome_usuario = $1, email_user = $2, numero = $3
        WHERE idusuarios = $4 
        RETURNING idusuarios, nome_usuario, email_user, numero
      `;
      values = [nome, email, numero, userId];
    }

    console.log('📝 Executando SQL:', sql, 'com valores:', values);
    const result = await client.query(sql, values);
    client.release();

    if (result.rows.length > 0) {
      const usuarioAtualizado = result.rows[0];
      console.log('✅ Usuário atualizado com sucesso:', usuarioAtualizado);
      
      res.json({
        mensagem: 'Perfil atualizado com sucesso!',
        usuario: usuarioAtualizado
      });
    } else {
      console.log('❌ Usuário não encontrado para atualização');
      res.status(404).json({ erro: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    
    // Verificar se é erro de email duplicado
    if (error.code === '23505') {
      res.status(409).json({ erro: 'Email já está em uso' });
    } else {
      res.status(500).json({ 
        erro: 'Erro ao atualizar perfil',
        detalhes: error.message 
      });
    }
  }
});

// Rota para deletar usuário por ID - CORRIGIDA
app.delete('/api/usuario-atual/:id', autenticar, async (req, res) => {
  // CORREÇÃO: Usar req.params.id, não req.params.idusuarios
  const userId = parseInt(req.params.id);
  
  console.log('🗑️ Deletando usuário:', userId);
  
  // Verificar se o usuário da sessão é o mesmo que está sendo deletado
  if (userId !== req.session.user.idusuarios) {
    return res.status(403).json({ erro: 'Não autorizado' });
  }

  try {
    const client = await pool.connect();
    
    // Verificar se o usuário existe
    const userCheck = await client.query(
      'SELECT idusuarios FROM usuarios WHERE idusuarios = $1',
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      client.release();
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Deletar usuário (isso deve acionar CASCADE para pedidos, carrinho, etc.)
    await client.query('DELETE FROM usuarios WHERE idusuarios = $1', [userId]);
    client.release();
    
    // Destruir sessão
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Erro ao destruir sessão:', err);
      }
      console.log('✅ Sessão destruída após deletar usuário');
    });
    
    res.json({ 
      mensagem: 'Conta deletada com sucesso!',
      redirecionar: '/'
    });
    
  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error);
    res.status(500).json({ 
      erro: 'Erro ao deletar conta',
      detalhes: error.message 
    });
  }
});

app.post('/api/logout', autenticar, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Erro ao fazer logout:', err);
      return res.status(500).json({ erro: 'Erro ao fazer logout' });
    }
    res.json({ sucesso: true, mensagem: 'Logout realizado com sucesso' });
  });
});

// Rota de debug para verificar parâmetros
app.get('/api/debug/params/:id', (req, res) => {
  console.log('🔍 Parâmetros recebidos:', req.params);
  res.json({
    params: req.params,
    query: req.query,
    body: req.body
  });
});

// ==========================================
// 🏭 ROTAS DE PRODUÇÃO E MONITORAMENTO (CORRIGIDAS)
// ==========================================

// ==========================================
// 📦 ROTAS DE PEDIDOS (PROTEGIDAS)
// ==========================================

// Rota para criar pedido (simples, sem produção)
app.post('/api/pedidos', autenticar, async (req, res) => {
  console.log('📦 Criando pedido simples:', req.body);

  try {
    const { total, metodo_pagamento, endereco_entrega, itens } = req.body;
    
    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ erro: 'Itens do pedido inválidos' });
    }

    const client = await pool.connect();
    
    // Iniciar transação
    await client.query('BEGIN');

    try {
      // 1. Inserir pedido
      const pedidoResult = await client.query(
        `INSERT INTO pedidos (idusuarios, total, metodo_pagamento, endereco_entrega, status_geral) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [req.session.user.idusuarios, total, metodo_pagamento, endereco_entrega, 'PENDENTE']
      );

      const pedido = pedidoResult.rows[0];

      // 2. Inserir itens do pedido
      for (const item of itens) {
        await client.query(
          `INSERT INTO pedido_itens 
           (id_pedido, id_produto, quantidade, preco_unitario, tamanho, cor, configuracao) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            pedido.id_pedido,
            item.id_produto,
            item.quantidade,
            item.preco_unitario,
            item.tamanho || '',
            item.cor || '',
            item.configuracao || {}
          ]
        );
      }

      // 3. Limpar carrinho
      await client.query(
        'DELETE FROM carrinho WHERE idusuarios = $1',
        [req.session.user.idusuarios]
      );

      await client.query('COMMIT');
      client.release();

      console.log(`✅ Pedido ${pedido.id_pedido} criado com sucesso`);

      res.status(201).json({
        mensagem: 'Pedido criado com sucesso!',
        pedido: pedido,
        total_itens: itens.length
      });

    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      throw error;
    }

  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error);
    res.status(500).json({
      erro: 'Erro ao criar pedido',
      detalhes: error.message
    });
  }
});

// Rota para receber callbacks da Queue Smart 4.0 (CORRIGIDA)
app.post('/api/smart4-callback', async (req, res) => {
    console.log('🔄 Callback recebido da Queue Smart 4.0:', req.body);

    try {
        const { itemId, status, stage, progress, payload } = req.body;

        // Encontrar o item de produção correspondente (CORRIGIDO - usando producao)
        const client = await pool.connect();
        const itemProducao = await client.query(
            'SELECT * FROM producao WHERE item_id_maquina = $1', // CORRIGIDO
            [itemId]
        );

        if (itemProducao.rows.length === 0) {
            console.error('❌ Item de produção não encontrado para itemId:', itemId);
            return res.status(404).json({ error: 'Item não encontrado' });
        }

        const producaoItem = itemProducao.rows[0];

        // Atualizar status do item de produção (CORRIGIDO)
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
        console.error('❌ Erro ao processar callback:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// Rota para obter status detalhado do pedido (CORRIGIDA)
app.get('/api/pedidos/:id/status', autenticar, async (req, res) => {
    console.log(`🔍 [DEBUG] Iniciando busca de status para pedido: ${req.params.id}`);
    console.log(`🔍 [DEBUG] Usuário autenticado:`, req.session.user);
    
    try {
        const id_pedido = parseInt(req.params.id);
        
        if (isNaN(id_pedido)) {
            console.log(`❌ [DEBUG] ID do pedido inválido: ${req.params.id}`);
            return res.status(400).json({ erro: 'ID do pedido inválido' });
        }

        console.log(`🔍 [DEBUG] Buscando status detalhado para pedido: ${id_pedido}`);
        
        const statusDetalhado = await getStatusDetalhadoPedido(id_pedido);
        console.log(`✅ [DEBUG] Dados retornados:`, statusDetalhado);
        
        // Se for um objeto (nova estrutura)
        if (statusDetalhado.pedido) {
            // Verificar se o pedido pertence ao usuário
            if (statusDetalhado.pedido.idusuarios !== req.session.user.idusuarios) {
                console.log(`❌ [DEBUG] Acesso não autorizado - Pedido pertence a outro usuário`);
                return res.status(403).json({ erro: 'Acesso não autorizado a este pedido' });
            }

            console.log(`✅ [DEBUG] Status final retornado para pedido ${id_pedido}`);
            res.json(statusDetalhado);
        } else {
            // Estrutura antiga (array) - manter compatibilidade
            const pedido = statusDetalhado[0];
            if (!pedido) {
                console.log(`❌ [DEBUG] Pedido ${id_pedido} não encontrado`);
                return res.status(404).json({ erro: 'Pedido não encontrado' });
            }

            console.log(`🔍 [DEBUG] Pedido encontrado - ID Usuário: ${pedido.idusuarios}, Sessão Usuário: ${req.session.user.idusuarios}`);
            
            if (pedido.idusuarios !== req.session.user.idusuarios) {
                console.log(`❌ [DEBUG] Acesso não autorizado - Pedido pertence a outro usuário`);
                return res.status(403).json({ erro: 'Acesso não autorizado a este pedido' });
            }

            // Buscar dados de produção separadamente
            const producaoItens = await getStatusProducaoByPedido(id_pedido);
            
            const resultado = {
                pedido: {
                    id_pedido: pedido.id_pedido,
                    idusuarios: pedido.idusuarios,
                    status_geral: pedido.status_geral,
                    total: pedido.total,
                    metodo_pagamento: pedido.metodo_pagamento,
                    data_pedido: pedido.data_pedido,
                    atualizado_em: pedido.atualizado_em
                },
                itens: statusDetalhado.map(item => ({
                    id_pedido_item: item.id_item,
                    id_produto: item.id_produto,
                    nome_produto: item.nome_produto,
                    descricao: item.descricao,
                    imagem_url: item.imagem_url,
                    quantidade: item.quantidade,
                    preco_unitario: item.preco_unitario,
                    tamanho: item.tamanho,
                    cor: item.cor,
                    configuracao: item.configuracao
                })),
                producao: producaoItens,
                resumo: await verificarPedidoCompleto(id_pedido)
            };

            console.log(`✅ [DEBUG] Status final retornado para pedido ${id_pedido}`);
            res.json(resultado);
        }

    } catch (error) {
        console.error(`❌ [DEBUG] ERRO CRÍTICO ao buscar status do pedido ${req.params.id}:`, error);
        console.error(`❌ [DEBUG] Stack trace:`, error.stack);
        
        res.status(500).json({ 
            erro: 'Erro ao buscar status do pedido',
            detalhes: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Rota para monitorar produção em tempo real (CORRIGIDA)
app.get('/api/producao/monitoramento', autenticar, async (req, res) => {
    try {
        const client = await pool.connect();
        
        // Pedidos em produção do usuário (CORRIGIDO)
        const pedidosProducao = await client.query(`
            SELECT DISTINCT p.*,
                   (SELECT COUNT(*) FROM producao WHERE id_pedido = p.id_pedido) as total_itens,
                   (SELECT COUNT(*) FROM producao WHERE id_pedido = p.id_pedido AND status_maquina = 'COMPLETED') as itens_prontos
            FROM pedidos p
            INNER JOIN producao pr ON p.id_pedido = pr.id_pedido
            WHERE p.idusuarios = $1 AND p.status_geral = 'PROCESSANDO'
            ORDER BY p.data_pedido DESC
        `, [req.session.user.idusuarios]);

        // Itens em produção (CORRIGIDO)
        const itensProducao = await client.query(`
            SELECT pr.*, p.nome_produto, p.imagem_url, pd.id_pedido
            FROM producao pr
            INNER JOIN produtos p ON pr.id_produto = p.id_produto
            INNER JOIN pedidos pd ON pr.id_pedido = pd.id_pedido
            WHERE pd.idusuarios = $1 AND pr.status_maquina != 'COMPLETED'
            ORDER BY pr.criado_em DESC
        `, [req.session.user.idusuarios]);

        client.release();

        res.json({
            pedidos_em_producao: pedidosProducao.rows,
            itens_em_producao: itensProducao.rows,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Erro no monitoramento de produção:', error);
        res.status(500).json({ erro: 'Erro no monitoramento' });
    }
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
    console.error('❌ Erro no debug:', error);
    res.status(500).json({ erro: error.message });
  }
});

// Rota de teste para verificar pedido
app.get('/api/debug/pedido/:id', autenticar, async (req, res) => {
  try {
    const id_pedido = parseInt(req.params.id);
    
    const client = await pool.connect();
    
    // Verificar pedido básico
    const pedido = await client.query(
      'SELECT * FROM pedidos WHERE id_pedido = $1',
      [id_pedido]
    );
    
    // Verificar itens do pedido
    const itens = await client.query(
      'SELECT * FROM pedido_itens WHERE id_pedido = $1',
      [id_pedido]
    );
    
    client.release();
    
    res.json({
      pedido: pedido.rows[0] || null,
      itens: itens.rows,
      existe: pedido.rows.length > 0
    });
    
  } catch (error) {
    console.error('❌ Erro no debug do pedido:', error);
    res.status(500).json({ erro: error.message });
  }
});

// ==========================================
// 🧪 ROTAS DE TESTE
// ==========================================

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
            idusuarios: req.session.user.idusuarios,
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
        const resultado = await queueSmart.enviarItemParaMaquina(
            pedidoTeste,
            produtoTeste,
            configuracaoTeste,
            0,
            1
        );

        res.json({
            sucesso: true,
            mensagem: 'Pedido de teste enviado com sucesso!',
            dados: {
                item_id_maquina: resultado[0].item_id_maquina,
                configuracao_enviada: configuracaoTeste
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
        const response = await fetch('http://52.72.137.244:3001/api/smart4-callback', {
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


// 🧪 ROTAS DE TESTE DA INTEGRAÇÃO
app.get('/api/teste-integracao-maquina', async (req, res) => {
    try {
        console.log('🧪 Testando integração completa com Queue Smart...');
        
        const resultados = [];
        
        // 1. Testar conexão
        resultados.push({ teste: 'Conexão', dados: await queueSmart.verificarConexao() });
        
        // 2. Testar status
        resultados.push({ teste: 'Status', dados: await queueSmart.statusMaquina() });
        
        // 3. Testar envio de item
        resultados.push({ 
            teste: 'Envio Item Teste', 
            dados: await queueSmart.enviarItemTeste() 
        });
        
        // 4. Testar listagem
        resultados.push({ teste: 'Listar Fila', dados: await queueSmart.listarItensFila(5) });
        
        res.json({
            sucesso: true,
            mensagem: 'Teste de integração completo',
            resultados: resultados
        });
        
    } catch (error) {
        console.error('❌ Erro no teste de integração:', error);
        res.status(500).json({
            sucesso: false,
            erro: error.message,
            detalhes: 'Verifique se a Queue Smart está rodando e acessível'
        });
    }
});

app.get('/api/estatisticas-maquina', async (req, res) => {
    try {
        const estatisticas = await queueSmart.estatisticasFila();
        res.json(estatisticas);
    } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        res.status(500).json({ erro: error.message });
    }
});

// ==========================================
// 🚀 INICIALIZAÇÃO DO SERVIDOR
// ==========================================

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log('📊 Rotas disponíveis:');
  console.log('🌐 Públicas: /api/produtos/public, /api/categorias/public, /api/cadastro, /api/login');
  console.log('🔐 Protegidas: /api/produtos, /api/meus-produtos, /api/carrinho, /api/pedidos');
  console.log('🏠 Endereços: /api/enderecos');
  console.log('🏭 Produção: /api/pedidos/producao, /api/pedidos/:id/status, /api/producao/monitoramento');
  console.log('🧪 Testes: /api/teste-conexao-maquina, /api/teste-envio-pedido');
  console.log('🔗 Queue Smart 4.0: http://52.72.137.244:3000');
});