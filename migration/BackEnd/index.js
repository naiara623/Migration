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
    getFavoritosByUserId,
    getDadosUsuarioParaPagamento,
  addToFavoritos,
  removeFromFavoritos,
  isFavorito,
  addToCarrinho,
calcularTotalCarrinho,
criarPedidoCompleto,
  getTotalFavoritos,
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

// Adicione antes do app.listen()
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url}`);
  next();
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

// server.js - Atualize o middleware de autenticação
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
  next();
}

// Middleware para verificar se é administrador
function verificarAdmin(req, res, next) {
  console.log('👑 Verificando se é administrador:', req.session.user);
  
  if (!req.session.user) {
    console.log('❌ ACESSO NEGADO: Sem sessão de usuário');
    return res.status(401).json({ 
      erro: 'Não autenticado',
      detalhes: 'Faça login novamente' 
    });
  }
  
  if (!req.session.user.isAdmin) {
    console.log('❌ ACESSO NEGADO: Usuário não é administrador');
    return res.status(403).json({ 
      erro: 'Acesso negado',
      detalhes: 'Esta ação requer privilégios de administrador' 
    });
  }
  
  console.log('✅ Usuário é administrador');
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

// server.js - adicione esta rota após a rota /api/login

// Rota pública para login de administrador
app.post('/api/login-adm', async (req, res) => {
  const { email, senha } = req.body; // Usando 'email' e 'senha' como no frontend
  
  console.log('🔐 Tentativa de login ADM:', { email });
  
  try {
    const client = await pool.connect();
    
    // Buscar administrador pelo email
    const result = await client.query(
      'SELECT * FROM adm WHERE email_adm = $1',
      [email]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      console.log('❌ Administrador não encontrado');
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }
    
    const administrador = result.rows[0];
    
    // Verificar senha (em produção, use bcrypt para comparação!)
    if (senha !== administrador.senhadm) {
      console.log('❌ Senha incorreta');
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }
    
    // Criar sessão de administrador
    req.session.user = {
      idusuarios: administrador.id_adm,
      email_user: administrador.email_adm,
      nome_usuario: administrador.nome_adm,
      isAdmin: true // Flag para identificar que é administrador
    };
    
    req.session.save((err) => {
      if (err) {
        console.error('❌ Erro ao salvar sessão ADM:', err);
        return res.status(500).json({ erro: 'Erro interno do servidor' });
      }
      
      console.log("✅ Sessão ADM salva - Admin ID:", administrador.id_adm);
      res.json({ 
        sucesso: true, 
        usuario: {
          idusuarios: administrador.id_adm,
          nome_usuario: administrador.nome_adm,
          email_user: administrador.email_adm,
          isAdmin: true
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Erro ao fazer login ADM:', error);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

// Rota para verificar se usuário é administrador
app.get('/api/check-admin', autenticar, async (req, res) => {
  try {
    const client = await pool.connect();
    
    const result = await client.query(
      'SELECT * FROM adm WHERE email_adm = $1',
      [req.session.user.email_user]
    );
    
    client.release();
    
    const isAdmin = result.rows.length > 0;
    
    res.json({ 
      isAdmin,
      adminData: isAdmin ? {
        id_adm: result.rows[0].id_adm,
        nome_adm: result.rows[0].nome_adm,
        email_adm: result.rows[0].email_adm
      } : null
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar admin:', error);
    res.status(500).json({ erro: 'Erro ao verificar permissões' });
  }
});


// Rota para obter dados do administrador autenticado
app.get('/api/admin-data', autenticar, async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Primeiro verificar se é admin
    const adminCheck = await client.query(
      'SELECT * FROM adm WHERE email_adm = $1',
      [req.session.user.email_user]
    );
    
    if (adminCheck.rows.length === 0) {
      client.release();
      return res.status(403).json({ erro: 'Acesso não autorizado' });
    }
    
    const administrador = adminCheck.rows[0];
    
    // Retornar dados sem a senha por segurança
    const adminData = {
      id_adm: administrador.id_adm,
      nome_adm: administrador.nome_adm,
      email_adm: administrador.email_adm,
      // Não incluir a senha!
    };
    
    client.release();
    res.json(adminData);
    
  } catch (error) {
    console.error('❌ Erro ao buscar dados do admin:', error);
    res.status(500).json({ erro: 'Erro ao buscar dados do administrador' });
  }
});

// Rota para atualizar dados do administrador
app.put('/api/admin-update', autenticar, async (req, res) => {
  const { nome_adm, email_adm, senha_atual, nova_senha } = req.body;
  
  console.log('📝 Atualizando admin:', { nome_adm, email_adm });
  
  try {
    const client = await pool.connect();
    
    // Verificar se o admin existe
    const adminCheck = await client.query(
      'SELECT * FROM adm WHERE email_adm = $1',
      [req.session.user.email_user]
    );
    
    if (adminCheck.rows.length === 0) {
      client.release();
      return res.status(403).json({ erro: 'Acesso não autorizado' });
    }
    
    const administrador = adminCheck.rows[0];
    
    // Se for alterar senha, verificar senha atual
    if (senha_atual) {
      if (senha_atual !== administrador.senhadm) {
        client.release();
        return res.status(400).json({ erro: 'Senha atual incorreta' });
      }
      
      if (!nova_senha || nova_senha.length < 6) {
        client.release();
        return res.status(400).json({ erro: 'Nova senha inválida (mínimo 6 caracteres)' });
      }
    }
    
    // Atualizar dados
    let sql;
    let values;
    
    if (nova_senha) {
      // Atualizar com nova senha
      sql = `
        UPDATE adm 
        SET nome_adm = $1, email_adm = $2, senhadm = $3
        WHERE id_adm = $4 
        RETURNING id_adm, nome_adm, email_adm
      `;
      values = [nome_adm, email_adm, nova_senha, administrador.id_adm];
    } else {
      // Atualizar sem alterar senha
      sql = `
        UPDATE adm 
        SET nome_adm = $1, email_adm = $2
        WHERE id_adm = $3 
        RETURNING id_adm, nome_adm, email_adm
      `;
      values = [nome_adm, email_adm, administrador.id_adm];
    }
    
    const result = await client.query(sql, values);
    
    // Atualizar sessão com novos dados
    if (result.rows.length > 0) {
      const adminAtualizado = result.rows[0];
      
      req.session.user = {
        ...req.session.user,
        nome_usuario: adminAtualizado.nome_adm,
        email_user: adminAtualizado.email_adm
      };
      
      await req.session.save();
      
      client.release();
      
      res.json({
        mensagem: 'Dados atualizados com sucesso!',
        admin: adminAtualizado
      });
    } else {
      client.release();
      res.status(404).json({ erro: 'Administrador não encontrado' });
    }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar admin:', error);
    
    if (error.code === '23505') { // Erro de unique constraint
      res.status(409).json({ erro: 'Email já está em uso' });
    } else {
      res.status(500).json({ 
        erro: 'Erro ao atualizar dados',
        detalhes: error.message 
      });
    }
  }
});

// Rota para deletar administrador (opcional, cuidado!)
app.delete('/api/admin-delete', autenticar, async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Primeiro verificar se é admin
    const adminCheck = await client.query(
      'SELECT * FROM adm WHERE email_adm = $1',
      [req.session.user.email_user]
    );
    
    if (adminCheck.rows.length === 0) {
      client.release();
      return res.status(403).json({ erro: 'Acesso não autorizado' });
    }
    
    const administrador = adminCheck.rows[0];
    
    // Contar quantos admins existem
    const countResult = await client.query('SELECT COUNT(*) FROM adm');
    const adminCount = parseInt(countResult.rows[0].count);
    
    // Impedir deletar o último admin
    if (adminCount <= 1) {
      client.release();
      return res.status(400).json({ 
        erro: 'Não é possível deletar o último administrador do sistema' 
      });
    }
    
    // Deletar admin
    await client.query('DELETE FROM adm WHERE id_adm = $1', [administrador.id_adm]);
    
    client.release();
    
    // Destruir sessão
    req.session.destroy();
    
    res.json({ 
      mensagem: 'Conta de administrador deletada com sucesso!',
      redirecionar: '/login'
    });
    
  } catch (error) {
    console.error('❌ Erro ao deletar admin:', error);
    res.status(500).json({ 
      erro: 'Erro ao deletar conta',
      detalhes: error.message 
    });
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


// Rota para obter endereço do usuário (FALTANTE - ADICIONE ESTA ROTA)
app.get('/api/enderecos', autenticar, async (req, res) => {
  try {
    console.log('🏠 Buscando endereço para usuário:', req.session.user.idusuarios);
    
    const endereco = await getEnderecoByUserId(req.session.user.idusuarios);
    
    if (!endereco) {
      console.log('ℹ️ Usuário não tem endereço cadastrado');
      return res.status(404).json({ 
        erro: 'Endereço não encontrado',
        mensagem: 'Você ainda não cadastrou um endereço' 
      });
    }
    
    console.log('✅ Endereço encontrado:', endereco);
    res.json(endereco);
    
  } catch (error) {
    console.error('❌ Erro ao buscar endereço:', error);
    res.status(500).json({ 
      erro: 'Erro ao buscar endereço',
      detalhes: error.message 
    });
  }
});

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
// ❤️ ROTAS DE FAVORITOS (PROTEGIDAS)
// ==========================================

// Rota para obter todos os favoritos do usuário
app.get('/api/favoritos', autenticar, async (req, res) => {
  try {
    const favoritos_usuario = await getFavoritosByUserId(req.session.user.idusuarios);
    res.json(favoritos_usuario);
  } catch (error) {
    console.error('❌ Erro ao buscar favoritos:', error);
    res.status(500).json({ erro: 'Erro ao buscar favoritos' });
  }
});

// Rota para adicionar produto aos favoritos
app.post('/api/favoritos', autenticar, async (req, res) => {
  try {
    const { id_produto } = req.body;
    
    if (!id_produto) {
      return res.status(400).json({ erro: 'ID do produto é obrigatório' });
    }
    
    const resultado = await addToFavoritos(req.session.user.idusuarios, id_produto);
    res.status(201).json(resultado);
  } catch (error) {
    console.error('❌ Erro ao adicionar aos favoritos:', error);
    res.status(500).json({ erro: 'Erro ao adicionar aos favoritos' });
  }
});

// Rota para remover produto dos favoritos
app.delete('/api/favoritos/:id_produto', autenticar, async (req, res) => {
  try {
    const id_produto = req.params.id_produto;
    
    const resultado = await removeFromFavoritos(req.session.user.idusuarios, id_produto);
    res.json(resultado);
  } catch (error) {
    console.error('❌ Erro ao remover dos favoritos:', error);
    res.status(500).json({ erro: 'Erro ao remover dos favoritos' });
  }
});

// Rota para verificar se um produto é favorito
app.get('/api/favoritos/verificar/:id_produto', autenticar, async (req, res) => {
  try {
    const id_produto = req.params.id_produto;
    
    const isFav = await isFavorito(req.session.user.idusuarios, id_produto);
    res.json({ isFavorito: isFav });
  } catch (error) {
    console.error('❌ Erro ao verificar favorito:', error);
    res.status(500).json({ erro: 'Erro ao verificar favorito' });
  }
});

// Rota para obter quantidade de favoritos
app.get('/api/favoritos/quantidade', autenticar, async (req, res) => {
  try {
    const total = await getTotalFavoritos(req.session.user.idusuarios);
    res.json({ quantidade: total });
  } catch (error) {
    console.error('❌ Erro ao buscar quantidade de favoritos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
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

// Rota para verificar se é admin
app.get('/api/check-admin', autenticar, async (req, res) => {
  try {
    const isAdmin = !!req.session.user.isAdmin;
    
    res.json({ 
      isAdmin,
      adminData: isAdmin ? {
        id: req.session.user.idusuarios,
        nome: req.session.user.nome_usuario,
        email: req.session.user.email_user
      } : null
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar admin:', error);
    res.status(500).json({ erro: 'Erro ao verificar permissões' });
  }
});

// Rota para obter produtos do administrador logado
app.get('/api/meus-produtos', autenticar, verificarAdmin, async (req, res) => {
  console.log('🔍 INICIANDO /api/meus-produtos');
  console.log('👤 Sessão completa:', req.session.user);
  console.log('🆔 Admin ID na sessão:', req.session.user.idusuarios);
  
  try {
    const client = await pool.connect();
    
    // Primeiro verificar se é admin
    const adminCheck = await client.query(
      'SELECT id_adm FROM adm WHERE id_adm = $1',
      [req.session.user.idusuarios]
    );
    
    if (adminCheck.rows.length === 0) {
      client.release();
      return res.status(403).json({ erro: 'Acesso não autorizado' });
    }
    
    const adminId = adminCheck.rows[0].id_adm;
    
    const result = await client.query(`
      SELECT p.*, c.nome_categoria 
      FROM produtos p 
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria 
      WHERE p.id_adm = $1
      ORDER BY p.data_criacao DESC
    `, [adminId]);
    
    client.release();
    
    console.log(`✅ Busca concluída: ${result.rows.length} produtos para admin ${adminId}`);
    res.json(result.rows);
    
  } catch (error) {
    console.error('💥 ERRO CRÍTICO em /api/meus-produtos:', error);
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
}); 

// Rota protegida para cadastrar produto (SOMENTE ADMIN)
app.post('/api/produtos', autenticar, verificarAdmin, upload.single('imagem_url'), async (req, res) => {
  console.log("📦 Dados recebidos para cadastro de produto:");
  console.log("body:", req.body);
  console.log("file:", req.file);
  console.log("usuário logado:", req.session.user);

  try {
    const { nome_produto, descricao, valor_produto, categoria, estoque } = req.body;

    // Verificar se o usuário é realmente administrador
    const client = await pool.connect();
    const adminCheck = await client.query(
      'SELECT id_adm FROM adm WHERE id_adm = $1',
      [req.session.user.idusuarios]
    );
    
    if (adminCheck.rows.length === 0) {
      client.release();
      return res.status(403).json({ erro: 'Acesso negado. Apenas administradores podem cadastrar produtos.' });
    }

    const categoriaObj = await selectCategoryByName(categoria);
    if (!categoriaObj) {
      client.release();
      return res.status(400).json({ erro: 'Categoria inválida' });
    }

    const imagem_url = req.file ? `/uploads/${req.file.filename}` : null;

    // Obter ID do administrador
    const admin = adminCheck.rows[0];

    const product = await insertProduct({
      nome_produto,
      descricao,
      valor_produto: parseFloat(valor_produto),
      id_categoria: categoriaObj.id_categoria,
      estoque: parseInt(estoque) || 0,
      imagem_url,
      id_adm: admin.id_adm  // <-- Usar id_adm em vez de idusuarios
    });

    client.release();

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
app.put('/api/produtos/:id', autenticar, verificarAdmin, upload.single('imagem_url'), async (req, res) => {
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
app.delete('/api/produtos/:id', autenticar, verificarAdmin, async (req, res) => {
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



// ROTA POST CORRIGIDA - adicione no server.js
app.post('/api/carrinho', autenticar, async (req, res) => {
    const { id_produto, quantidade = 1, tamanho = '', cor = '' } = req.body;
    
    console.log('🛒 Recebendo requisição para adicionar ao carrinho:', {
        usuario: req.session.user.idusuarios,
        id_produto,
        quantidade,
        tamanho,
        cor
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
                `UPDATE carrinho SET quantidade = quantidade + $1
                 WHERE idusuarios = $2 AND id_produto = $3 AND tamanho = $4 AND cor = $5
                 RETURNING *`,
                [quantidade, req.session.user.idusuarios, id_produto, tamanho, cor]
            );
            client.release();
            return res.json({ 
                mensagem: 'Item atualizado no carrinho', 
                item: result.rows[0] 
            });
        } else {
            // Inserir novo item
            const result = await client.query(
                `INSERT INTO carrinho (idusuarios, id_produto, quantidade, tamanho, cor, data_adicionado) 
                 VALUES ($1, $2, $3, $4, $5, NOW()) 
                 RETURNING *`,
                [req.session.user.idusuarios, id_produto, quantidade, tamanho, cor]
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

// ==========================================
// 🛒 ROTAS DO CARRINHO (PROTEGIDAS) - CORRIGIDAS
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

// Rota PUT para atualizar quantidade - CORRIGIDA
app.put('/api/carrinho/:id', autenticar, async (req, res) => {
  try {
    const id_carinho = req.params.id; // id_carinho (singular)
    const { quantidade } = req.body;
    
    console.log(`📝 Atualizando carrinho item ${id_carinho} para quantidade ${quantidade}`);
    
    const updatedItem = await updateCarrinhoItem(id_carinho, quantidade);
    
    if (updatedItem.mensagem) {
      res.json({ mensagem: updatedItem.mensagem });
    } else {
      res.json({ 
        mensagem: 'Carrinho atualizado', 
        item: updatedItem 
      });
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar carrinho:', error);
    res.status(500).json({ erro: 'Erro ao atualizar carrinho' });
  }
});

// 🧹 LIMPAR TODO O CARRINHO
app.delete('/api/carrinho/limpar', autenticar, async (req, res) => {
  try {
    const userId = req.session.user.idusuarios;
    
    console.log(`🧹 Limpando carrinho do usuário ${userId}`);

    await clearCarrinho(userId);

    res.json({ mensagem: 'Carrinho limpo com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao limpar carrinho:', error);
    res.status(500).json({ erro: 'Erro ao limpar carrinho' });
  }
});

// 🗑️ REMOVER ITEM INDIVIDUAL - CORRIGIDA
app.delete('/api/carrinho/:id', autenticar, async (req, res) => {
  try {
    const id_carinho = req.params.id; // id_carinho (singular)
    
    console.log(`🗑️ Removendo item ${id_carinho} do carrinho`);
    
    const removedItem = await removeFromCarrinho(id_carinho);
    
    res.json({ 
      mensagem: 'Item removido do carrinho', 
      item: removedItem 
    });
  } catch (error) {
    console.error('❌ Erro ao remover do carrinho:', error);
    res.status(500).json({ erro: 'Erro ao remover do carrinho' });
  }
});

app.get('/api/carrinho/quantidade', autenticar, async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT COALESCE(SUM(quantidade), 0) as quantidade FROM carrinho WHERE idusuarios = $1', 
      [req.session.user.idusuarios]
    );
    client.release();
    
    const quantidade = parseInt(result.rows[0].quantidade);
    res.json({ quantidade });
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

// Rota para obter todos os pedidos do usuário (COMPLETA)
app.get('/api/pedidos', autenticar, async (req, res) => {
    console.log('📦 Buscando pedidos para usuário:', req.session.user.idusuarios);
    
    try {
        const client = await pool.connect();
        
        const result = await client.query(`
            SELECT 
                p.id_pedido,
                p.total,
                p.status_geral,
                p.metodo_pagamento,
                p.data_pedido,
                p.atualizado_em,
                COUNT(pi.id_item) as total_itens,
                SUM(pi.quantidade) as quantidade_total
            FROM pedidos p
            LEFT JOIN pedido_itens pi ON p.id_pedido = pi.id_pedido
            WHERE p.idusuarios = $1
            GROUP BY p.id_pedido
            ORDER BY p.data_pedido DESC
        `, [req.session.user.idusuarios]);
        
        client.release();
        
        console.log(`✅ ${result.rows.length} pedidos encontrados para o usuário`);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                erro: 'Nenhum pedido encontrado',
                mensagem: 'Você ainda não fez nenhum pedido' 
            });
        }
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('❌ Erro ao buscar pedidos:', error);
        res.status(500).json({ 
            erro: 'Erro ao buscar pedidos',
            detalhes: error.message 
        });
    }
});





// Adicione esta rota ANTES da rota app.listen()



// Rota para receber callbacks da Queue Smart 4.0 (CORRIGIDA)
app.post('/api/smart4-callback', async (req, res) => {
    console.log('🔄 Callback recebido da Queue Smart 4.0:', req.body);

    try {
        const { itemId, status, stage, progress, payload } = req.body;

        // CORREÇÃO: Buscar por item_id_maquina
        const client = await pool.connect();
        
        const itemProducao = await client.query(
            `SELECT pr.*, pi.id_pedido, p.nome_produto 
             FROM producao_itens pr
             INNER JOIN pedido_itens pi ON pr.id_item = pi.id_item
             INNER JOIN produtos p ON pr.id_produto = p.id_produto
             WHERE pr.item_id_maquina = $1 OR pr.order_id = $2
             LIMIT 1`,
            [itemId, itemId]
        );

        if (itemProducao.rows.length === 0) {
            console.error('❌ Item de produção não encontrado para itemId:', itemId);
            client.release();
            return res.status(404).json({ error: 'Item não encontrado' });
        }

        const producaoItem = itemProducao.rows[0];

        // Atualizar status do item de produção com campos corretos
        await atualizarStatusProducao(producaoItem.id_producao, {
            status_maquina: status || producaoItem.status_maquina,
            estagio_maquina: stage || producaoItem.estagio_maquina,
            progresso_maquina: progress || producaoItem.progresso_maquina,
            slot_expedicao: producaoItem.slot_expedicao
        });

        console.log(`✅ Item ${producaoItem.id_producao} (${producaoItem.nome_produto}) atualizado: ${status} - ${stage} (${progress}%)`);

        // Se o item foi concluído, verificar pedido completo
        if (status === 'COMPLETED') {
            console.log(`🎉 Item ${producaoItem.id_producao} concluído!`);
            
            // Atualizar status do item do pedido
            await client.query(
                `UPDATE pedido_itens 
                 SET status = 'PRODUZIDO'
                 WHERE id_item = $1`,
                [producaoItem.id_item]
            );
            
            // Verificar se todos os itens do pedido estão prontos
            const statusPedido = await verificarPedidoCompleto(producaoItem.id_pedido);
            
            if (statusPedido.completo) {
                console.log(`🎊 PEDIDO ${producaoItem.id_pedido} COMPLETO! Todos os itens prontos.`);
                
                // Atualizar status geral do pedido
                await client.query(
                    `UPDATE pedidos SET status_geral = 'PRODUZIDO' WHERE id_pedido = $1`,
                    [producaoItem.id_pedido]
                );
            }
        }

        client.release();
        res.status(200).json({ received: true, updated: true });

    } catch (error) {
        console.error('❌ Erro ao processar callback:', error);
        res.status(500).json({ error: 'Erro interno', details: error.message });
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
                    id_item: pedido.id_item,
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
                    cor: item.cor
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
// Rota para monitorar produção em tempo real (CORRIGIDA)
// Rota para monitorar produção em tempo real (CORRIGIDA)
app.get('/api/producao/monitoramento', autenticar, async (req, res) => {
    try {
        const client = await pool.connect();
        
        // Pedidos em produção do usuário (CORRIGIDO)
        const pedidosProducao = await client.query(`
            SELECT DISTINCT p.*,
                   (SELECT COUNT(*) FROM pedido_itens WHERE id_pedido = p.id_pedido) as total_itens,
                   (SELECT COUNT(*) FROM producao_itens pr 
                    INNER JOIN pedido_itens pi ON pr.id_item = pi.id_item 
                    WHERE pi.id_pedido = p.id_pedido AND pr.status_maquina = 'COMPLETED') as itens_prontos
            FROM pedidos p
            WHERE p.idusuarios = $1 AND p.status_geral = 'PROCESSANDO'
            ORDER BY p.data_pedido DESC
        `, [req.session.user.idusuarios]);

        // Itens em produção (CORRIGIDO)
        const itensProducao = await client.query(`
            SELECT pr.*, p.nome_produto, p.imagem_url, pi.id_pedido, pi.quantidade
            FROM producao_itens pr
            INNER JOIN pedido_itens pi ON pr.id_item = pi.id_item
            INNER JOIN produtos p ON pr.id_produto = p.id_produto
            INNER JOIN pedidos pd ON pi.id_pedido = pd.id_pedido
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
// 💳 ROTAS PARA PAGAMENTO (PROTEGIDAS)
// ==========================================

// Rota para buscar dados completos do usuário para pagamento
app.get('/api/pagamento/dados-usuario', autenticar, async (req, res) => {
  try {
    console.log('💳 Buscando dados do usuário para pagamento:', req.session.user.idusuarios);
    
    // Você precisará importar a nova função no topo do arquivo
    // const { getDadosUsuarioParaPagamento } = require("./db");
    
    const dados = await getDadosUsuarioParaPagamento(req.session.user.idusuarios);
    
    res.json({
      sucesso: true,
      ...dados
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar dados para pagamento:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao buscar dados do usuário',
      detalhes: error.message
    });
  }
});

// Rota para verificar se o usuário pode finalizar compra
app.get('/api/pagamento/verificar-dados', autenticar, async (req, res) => {
  try {
    console.log('🔍 Verificando dados para pagamento do usuário:', req.session.user.idusuarios);
    
    const dados = await getDadosUsuarioParaPagamento(req.session.user.idusuarios);
    
    // Verificar campos obrigatórios
    const camposFaltantes = [];
    
    // Verificar telefone
    if (!dados.usuario.numero || dados.usuario.numero.trim() === '') {
      camposFaltantes.push({
        campo: 'telefone',
        mensagem: 'Número de telefone não cadastrado',
        rota: '/Perfil-usuario'
      });
    }
    
    // Verificar endereço
    if (!dados.endereco) {
      camposFaltantes.push({
        campo: 'endereco',
        mensagem: 'Endereço não cadastrado',
        rota: '/endereco'
      });
    } else {
      // Verificar campos obrigatórios do endereço
      const camposEnderecoObrigatorios = ['bairro', 'cidade', 'estado', 'numero_endereco'];
      for (const campo of camposEnderecoObrigatorios) {
        if (!dados.endereco[campo] || dados.endereco[campo].trim() === '') {
          camposFaltantes.push({
            campo: `endereco_${campo}`,
            mensagem: `Campo ${campo.replace('_endereco', '')} do endereço não preenchido`,
            rota: '/endereco'
          });
        }
      }
    }
    
    const podeFinalizar = camposFaltantes.length === 0;
    
    res.json({
      sucesso: true,
      podeFinalizar,
      dadosCompletos: podeFinalizar,
      camposFaltantes,
      mensagem: podeFinalizar 
        ? 'Todos os dados estão completos!' 
        : 'Complete os dados faltantes para finalizar a compra',
      dados: dados
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados para pagamento:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao verificar dados do usuário',
      detalhes: error.message
    });
  }
});

// Rota para buscar detalhes completos do pedido (para visualização)
app.get('/api/pedidos/:id/detalhes', autenticar, async (req, res) => {
    try {
        const id_pedido = parseInt(req.params.id);
        
        console.log(`📋 Buscando detalhes do pedido ${id_pedido} para visualização`);
        
        const client = await pool.connect();
        
        // 1. Buscar pedido
        const pedidoResult = await client.query(
            `SELECT * FROM pedidos WHERE id_pedido = $1`,
            [id_pedido]
        );
        
        if (pedidoResult.rows.length === 0) {
            client.release();
            return res.status(404).json({ erro: 'Pedido não encontrado' });
        }
        
        const pedido = pedidoResult.rows[0];
        
        // Verificar se o pedido pertence ao usuário
        if (pedido.idusuarios !== req.session.user.idusuarios) {
            client.release();
            return res.status(403).json({ erro: 'Acesso não autorizado' });
        }
        
        // 2. Buscar itens do pedido
        const itensResult = await client.query(
            `SELECT pi.*, p.nome_produto, p.descricao, p.imagem_url 
             FROM pedido_itens pi 
             INNER JOIN produtos p ON pi.id_produto = p.id_produto 
             WHERE pi.id_pedido = $1`,
            [id_pedido]
        );
        
        // 3. Buscar dados do usuário
        const usuarioResult = await client.query(
            `SELECT nome_usuario, numero FROM usuarios WHERE idusuarios = $1`,
            [req.session.user.idusuarios]
        );
        
        // 4. Buscar endereço do usuário
        const enderecoResult = await client.query(
            `SELECT * FROM endereco WHERE idusuarios = $1`,
            [req.session.user.idusuarios]
        );
        
        client.release();
        
        // Parsear endereço_entrega se for JSON string
        let enderecoEntrega = {};
        try {
            if (pedido.endereco_entrega && typeof pedido.endereco_entrega === 'string') {
                enderecoEntrega = JSON.parse(pedido.endereco_entrega);
            } else if (pedido.endereco_entrega && typeof pedido.endereco_entrega === 'object') {
                enderecoEntrega = pedido.endereco_entrega;
            }
        } catch (e) {
            console.error('Erro ao parsear endereço:', e);
        }
        
        // Se não tiver endereço no pedido, usar o cadastrado
        if (!enderecoEntrega || Object.keys(enderecoEntrega).length === 0) {
            enderecoEntrega = enderecoResult.rows[0] || {};
        }
        
        res.json({
            pedido: {
                id_pedido: pedido.id_pedido,
                total: pedido.total,
                metodo_pagamento: pedido.metodo_pagamento,
                status_geral: pedido.status_geral,
                data_pedido: pedido.data_pedido,
                endereco_entrega: pedido.endereco_entrega
            },
            usuario: usuarioResult.rows[0] || {},
            endereco_entrega: enderecoEntrega,
            itens: itensResult.rows.map(item => ({
                id_produto: item.id_produto,
                nome_produto: item.nome_produto,
                descricao: item.descricao,
                imagem_url: item.imagem_url,
                quantidade: item.quantidade,
                preco_unitario: item.preco_unitario,
                tamanho: item.tamanho,
                cor: item.cor
            }))
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar detalhes do pedido:', error);
        res.status(500).json({ 
            erro: 'Erro ao buscar detalhes do pedido',
            detalhes: error.message 
        });
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
// 🤖 ROTA DO CHATBOT (CONECTADO AO BANCO DE DADOS)
// ==========================================

// Rota para o chatbot responder dúvidas sobre o site
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        erro: 'Mensagem não pode estar vazia',
        response: 'Por favor, digite sua dúvida para que eu possa ajudar.' 
      });
    }

    console.log('🤖 Chatbot recebeu mensagem:', message);
    
    // Analisar a mensagem para entender o que o usuário quer
    const mensagemLower = message.toLowerCase().trim();
    
    // Buscar informações do banco de dados com base na mensagem
    const resposta = await processarMensagemChatbot(mensagemLower);
    
    res.json({ 
      response: resposta,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro no chatbot:', error);
    res.status(500).json({ 
      response: 'Desculpe, estou com problemas para acessar as informações no momento. Tente novamente mais tarde.' 
    });
  }
});

// Função para processar a mensagem e buscar informações no banco
async function processarMensagemChatbot(mensagem) {
  const client = await pool.connect();
  
  try {
    // Categorias de perguntas
    const categorias = {
      produtos: ['produto', 'produtos', 'comprar', 'loja', 'item', 'itens', 'mercadoria'],
      categorias: ['categoria', 'categorias', 'tipo', 'tipos', 'seção', 'seções'],
      pedidos: ['pedido', 'pedidos', 'compra', 'compras', 'encomenda', 'rastrear'],
      carrinho: ['carrinho', 'cesto', 'sacola', 'adicionar carrinho'],
      pagamento: ['pagamento', 'pagar', 'cartão', 'dinheiro', 'pix', 'boleto'],
      entrega: ['entrega', 'frete', 'envio', 'prazo', 'receber', 'chegar'],
      conta: ['conta', 'perfil', 'cadastro', 'login', 'senha', 'usuario', 'usuário'],
      ajuda: ['ajuda', 'suporte', 'duvida', 'dúvida', 'problema', 'contato'],
      estoque: ['estoque', 'disponível', 'disponibilidade', 'acabou'],
      preco: ['preço', 'valor', 'custo', 'barato', 'caro', 'promoção']
    };

    // Identificar categoria da pergunta
    let categoriaEncontrada = null;
    for (const [categoria, palavras] of Object.entries(categorias)) {
      if (palavras.some(palavra => mensagem.includes(palavra))) {
        categoriaEncontrada = categoria;
        break;
      }
    }

    // Processar de acordo com a categoria
    switch(categoriaEncontrada) {
      case 'produtos':
        return await buscarInformacoesProdutos(mensagem, client);
      
      case 'categorias':
        return await buscarInformacoesCategorias(client);
      
      case 'pedidos':
        return await informacoesPedidos(mensagem);
      
      case 'carrinho':
        return await informacoesCarrinho();
      
      case 'pagamento':
        return await informacoesPagamento();
      
      case 'entrega':
        return await informacoesEntrega();
      
      case 'conta':
        return await informacoesConta();
      
      case 'estoque':
        return await verificarEstoque(mensagem, client);
      
      case 'preco':
        return await buscarPrecos(mensagem, client);
      
      default:
        return await respostaGenerica(mensagem, client);
    }

  } finally {
    client.release();
  }
}

// Funções auxiliares para cada tipo de consulta
async function buscarInformacoesProdutos(mensagem, client) {
  try {
    // Extrair palavras-chave sobre produtos
    const palavrasProduto = mensagem.split(' ').filter(word => 
      word.length > 3 && !['como', 'onde', 'quero', 'gostaria', 'sobre'].includes(word)
    );

    if (palavrasProduto.length > 0) {
      // Buscar produtos relacionados
      const query = palavrasProduto.map((_, i) => 
        `(LOWER(nome_produto) LIKE $${i + 1} OR LOWER(descricao) LIKE $${i + 1})`
      ).join(' OR ');
      
      const values = palavrasProduto.map(palavra => `%${palavra}%`);
      
      const result = await client.query(
        `SELECT nome_produto, descricao, valor_produto, estoque 
         FROM produtos 
         WHERE estoque > 0 AND (${query})
         LIMIT 5`,
        values
      );

      if (result.rows.length > 0) {
        const produtos = result.rows.map(p => 
          `- ${p.nome_produto}: R$ ${p.valor_produto} (${p.estoque} em estoque)`
        ).join('\n');
        
        return `Encontrei estes produtos relacionados:\n\n${produtos}\n\nPara ver mais detalhes, visite a página do produto.`;
      }
    }

    // Se não encontrou produtos específicos, dar informações gerais
    const totalProdutos = await client.query(
      'SELECT COUNT(*) as total FROM produtos WHERE estoque > 0'
    );
    
    return `Temos ${totalProdutos.rows[0].total} produtos disponíveis em nosso catálogo. Você pode:\n\n1. Navegar por categorias\n2. Buscar por nome\n3. Ver produtos em destaque\n\nDiga-me qual tipo de produto você está procurando!`;

  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return 'Desculpe, não consegui buscar informações sobre produtos no momento.';
  }
}

async function buscarInformacoesCategorias(client) {
  try {
    const result = await client.query(
      'SELECT nome_categoria FROM categorias ORDER BY nome_categoria'
    );
    
    const categorias = result.rows.map(c => `- ${c.nome_categoria}`).join('\n');
    
    return `Nossas categorias disponíveis são:\n\n${categorias}\n\nClique em uma categoria para ver todos os produtos relacionados.`;

  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return 'Desculpe, não consegui carregar as categorias no momento.';
  }
}

async function verificarEstoque(mensagem, client) {
  try {
    // Extrair nome do produto da mensagem
    const palavras = mensagem.split(' ');
    const indexEstoque = palavras.findIndex(p => p.includes('estoque'));
    
    if (indexEstoque > 0) {
      const possivelProduto = palavras[indexEstoque - 1];
      
      const result = await client.query(
        `SELECT nome_produto, estoque 
         FROM produtos 
         WHERE LOWER(nome_produto) LIKE $1 AND estoque >= 0
         LIMIT 1`,
        [`%${possivelProduto}%`]
      );

      if (result.rows.length > 0) {
        const produto = result.rows[0];
        return `O produto "${produto.nome_produto}" tem ${produto.estoque} unidades disponíveis em estoque.`;
      }
    }

    return 'Para verificar o estoque de um produto específico, diga-me o nome do produto. Exemplo: "Tem estoque da camiseta?"';

  } catch (error) {
    console.error('Erro ao verificar estoque:', error);
    return 'Desculpe, não consegui verificar o estoque no momento.';
  }
}

async function buscarPrecos(mensagem, client) {
  try {
    const palavras = mensagem.split(' ');
    const indexPreco = palavras.findIndex(p => 
      ['preço', 'valor', 'custo', 'quanto'].includes(p.toLowerCase())
    );
    
    if (indexPreco > 0 && palavras[indexPreco + 1]) {
      const produtoNome = palavras.slice(indexPreco + 1).join(' ');
      
      const result = await client.query(
        `SELECT nome_produto, valor_produto 
         FROM produtos 
         WHERE LOWER(nome_produto) LIKE $1
         LIMIT 3`,
        [`%${produtoNome.toLowerCase()}%`]
      );

      if (result.rows.length > 0) {
        const precos = result.rows.map(p => 
          `- ${p.nome_produto}: R$ ${p.valor_produto}`
        ).join('\n');
        
        return `Preços encontrados:\n\n${precos}`;
      }
    }

    return 'Para saber o preço de um produto, diga-me o nome dele. Exemplo: "Qual o preço da camiseta?"';

  } catch (error) {
    console.error('Erro ao buscar preços:', error);
    return 'Desculpe, não consegui buscar preços no momento.';
  }
}

async function informacoesPedidos(mensagem) {
  const respostas = {
    'como rastrear': 'Para rastrear seu pedido:\n\n1. Faça login na sua conta\n2. Vá em "Meus Pedidos"\n3. Clique no pedido desejado\n4. Você verá o status atual e atualizações',
    'status': 'Os status possíveis são:\n- Pendente\n- Processando\n- Em produção\n- Enviado\n- Entregue',
    'tempo': 'O tempo de processamento varia de 1 a 3 dias úteis, mais o prazo de entrega.',
    'cancelar': 'Para cancelar um pedido, entre em contato com nosso suporte dentro de 24 horas após a compra.',
    'troca': 'Para solicitar troca, acesse "Meus Pedidos" e clique em "Solicitar Troca" no pedido desejado.'
  };

  for (const [palavra, resposta] of Object.entries(respostas)) {
    if (mensagem.includes(palavra)) {
      return resposta;
    }
  }

  return 'Sobre pedidos, posso ajudar com:\n\n- Como rastrear seu pedido\n- Status do pedido\n- Tempo de entrega\n- Cancelamentos\n- Trocas\n\nO que você gostaria de saber?';
}

async function informacoesCarrinho() {
  return 'Sobre o carrinho de compras:\n\n✅ **Como adicionar:**\n- Clique em "Adicionar ao Carrinho" em qualquer produto\n\n✅ **Como visualizar:**\n- Clique no ícone do carrinho no menu\n\n✅ **Como remover:**\n- No carrinho, clique no "X" ao lado do produto\n\n✅ **Limite:**\nVocê pode adicionar até 99 unidades de cada produto.';
}

async function informacoesPagamento() {
  return 'Formas de pagamento aceitas:\n\n💳 **Cartões de crédito:**\n- Visa, Mastercard, Elo, American Express\n- Até 12x sem juros\n\n📱 **PIX:**\n- Pagamento instantâneo\n- 5% de desconto\n\n📄 **Boleto bancário:**\n- Vencimento em 3 dias\n\n💰 **Carteira digital:**\n- PayPal, Mercado Pago\n\nTodos os pagamentos são processados com segurança.';
}

async function informacoesEntrega() {
  return 'Informações de entrega:\n\n🚚 **Opções disponíveis:**\n- Entrega padrão: 5-7 dias úteis\n- Entrega expressa: 2-3 dias úteis\n- Retirada na loja: Disponível em 24h\n\n📍 **Cobertura:**\nEntregamos para todo o Brasil\n\n📦 **Frete grátis:**\nPara compras acima de R$ 150,00\n\n📱 **Acompanhamento:**\nRastreie seu pedido em tempo real.';
}

async function informacoesConta() {
  return 'Sua conta no site:\n\n👤 **Criar conta:**\nClique em "Cadastrar" no menu superior\n\n🔑 **Login:**\nUse seu email e senha\n\n📝 **Editar perfil:**\nAcesse "Meu Perfil" após o login\n\n🏠 **Endereço:**\nCadastre seu endereço para entregas\n\n📧 **Recuperar senha:**\nClique em "Esqueci minha senha" na página de login';
}

async function respostaGenerica(mensagem, client) {
  // Verificar se é uma saudação
  const saudacoes = ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hello', 'hi'];
  if (saudacoes.some(s => mensagem.includes(s))) {
    return 'Olá! Sou o assistente virtual da loja. Posso ajudar com:\n\n🛍️ Informações sobre produtos\n📦 Status de pedidos\n🚚 Informações de entrega\n💳 Formas de pagamento\n👤 Sua conta\n\nComo posso ajudar você hoje?';
  }

  // Verificar se é agradecimento
  if (mensagem.includes('obrigado') || mensagem.includes('obrigada') || mensagem.includes('valeu')) {
    return 'De nada! Estou aqui para ajudar. 😊\nSe tiver mais alguma dúvida, é só perguntar!';
  }

  // Buscar produtos genéricos como sugestão
  const produtosDestaque = await client.query(
    `SELECT nome_produto, valor_produto 
     FROM produtos 
     WHERE estoque > 0 
     ORDER BY data_criacao DESC 
     LIMIT 3`
  );

  if (produtosDestaque.rows.length > 0) {
    const sugestoes = produtosDestaque.rows.map(p => 
      `- ${p.nome_produto} (R$ ${p.valor_produto})`
    ).join('\n');

    return `Não entendi completamente sua pergunta. Mas posso te ajudar com:\n\n${sugestoes}\n\nOu você pode me perguntar sobre:\n- Produtos específicos\n- Como comprar\n- Meus pedidos\n- Formas de pagamento\n- Entrega`;
  }

  return 'Olá! Sou o assistente virtual. Posso ajudar você com:\n\n1. Informações sobre produtos\n2. Como fazer uma compra\n3. Status do seu pedido\n4. Dúvidas sobre entrega\n5. Problemas com sua conta\n\nComo posso ajudar você hoje?';
}




// ==========================================
// 🛒 ROTA PARA CALCULAR TOTAL DO CARRINHO
// ==========================================

app.get('/api/carrinho/total', autenticar, async (req, res) => {
  try {
    const userId = req.session.user.idusuarios;
    
    // 1. Calcular total dos produtos
    const totalCarrinho = await calcularTotalCarrinho(userId);
    
    // 2. Definir frete (exemplo: R$ 15 fixo)
    const frete = 15.00;
    
    // 3. Calcular total final
    const totalFinal = totalCarrinho.total_produtos + frete;
    
    res.json({
      sucesso: true,
      total_produtos: totalCarrinho.total_produtos,
      total_itens: totalCarrinho.total_itens,
      quantidade_total: totalCarrinho.quantidade_total,
      frete: frete,
      total_final: totalFinal,
      resumo: {
        valor_produtos: `R$ ${totalCarrinho.total_produtos.toFixed(2)}`,
        frete: `R$ ${frete.toFixed(2)}`,
        total_a_pagar: `R$ ${totalFinal.toFixed(2)}`
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao calcular total do carrinho:', error);
    res.status(500).json({ 
      sucesso: false,
      erro: 'Erro ao calcular total' 
    });
  }
});

// ==========================================
// 💳 ROTA PARA FINALIZAR COMPRA
// ==========================================

app.post('/api/pagamento/finalizar', autenticar, async (req, res) => {
  console.log('💳 Finalizando compra...');
  
  try {
    const { metodo_pagamento, endereco_entrega } = req.body;
    const userId = req.session.user.idusuarios;
    
    // 1. Verificar se há itens no carrinho
    const carrinho = await getCarrinhoByUserId(userId);
    if (carrinho.length === 0) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Carrinho vazio',
        mensagem: 'Adicione produtos ao carrinho antes de finalizar a compra'
      });
    }
    
    // 2. Calcular total
    const totalCarrinho = await calcularTotalCarrinho(userId);
    const frete = 15.00;
    const totalFinal = totalCarrinho.total_produtos + frete;
    
    console.log('💰 Total calculado:', {
      produtos: totalCarrinho.total_produtos,
      frete,
      total: totalFinal
    });
    
    // 3. Criar objeto de endereço
    let enderecoFormatado = '';
    if (endereco_entrega) {
      if (typeof endereco_entrega === 'object') {
        const { bairro, cidade, estado, numero, complemento } = endereco_entrega;
        enderecoFormatado = `${bairro}, ${cidade} - ${estado}, Nº ${numero}${complemento ? `, ${complemento}` : ''}`;
      } else {
        enderecoFormatado = endereco_entrega;
      }
    }
    
    // 4. Criar pedido
    const pedidoData = {
      idusuarios: userId,
      total: totalFinal,
      metodo_pagamento: metodo_pagamento || 'Cartão de Crédito',
      endereco_entrega: enderecoFormatado || 'Endereço não informado'
    };
    
    console.log('📦 Dados do pedido:', pedidoData);
    
    const resultado = await criarPedidoCompleto(pedidoData);
    
    // 5. Retornar sucesso
    res.status(201).json({
      sucesso: true,
      mensagem: 'Compra finalizada com sucesso!',
      pedido: {
        id_pedido: resultado.pedido.id_pedido,
        total: resultado.pedido.total,
        status: resultado.pedido.status_geral,
        data_pedido: resultado.pedido.data_pedido
      },
      detalhes: {
        total_itens: resultado.total_itens,
        total_pago: `R$ ${totalFinal.toFixed(2)}`,
        metodo_pagamento: pedidoData.metodo_pagamento
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao finalizar compra:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao finalizar compra',
      detalhes: error.message
    });
  }
});

// ==========================================
// 📋 ROTA PARA RESUMO DA COMPRA
// ==========================================

app.get('/api/pagamento/resumo', autenticar, async (req, res) => {
  try {
    const userId = req.session.user.idusuarios;
    
    // 1. Buscar itens do carrinho
    const carrinhoItens = await getCarrinhoByUserId(userId);
    
    if (carrinhoItens.length === 0) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Carrinho vazio',
        mensagem: 'Nenhum produto no carrinho'
      });
    }
    
    // 2. Calcular totais
    const totalCarrinho = await calcularTotalCarrinho(userId);
    const frete = 15.00;
    const totalFinal = totalCarrinho.total_produtos + frete;
    
    // 3. Buscar dados do usuário
    const client = await pool.connect();
    const usuarioResult = await client.query(
      'SELECT nome_usuario, email_user, numero FROM usuarios WHERE idusuarios = $1',
      [userId]
    );
    
    // 4. Buscar endereço do usuário
    const enderecoResult = await client.query(
      'SELECT * FROM endereco WHERE idusuarios = $1',
      [userId]
    );
    
    client.release();
    
    const usuario = usuarioResult.rows[0] || {};
    const endereco = enderecoResult.rows[0] || null;
    
    // 5. Montar resposta
    res.json({
      sucesso: true,
      usuario: {
        nome: usuario.nome_usuario || 'Nome não informado',
        telefone: usuario.numero || 'Telefone não informado',
        email: usuario.email_user || 'Email não informado'
      },
      endereco: endereco ? {
        cep: endereco.cep,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        estado: endereco.estado,
        numero: endereco.numero,
        complemento: endereco.complemento
      } : null,
      produtos: carrinhoItens.map(item => ({
        id_produto: item.id_produto,
        nome: item.nome_produto,
        descricao: item.descricao,
        valor_unitario: item.valor_produto,
        quantidade: item.quantidade,
        subtotal: item.valor_produto * item.quantidade,
        imagem: item.imagem_url,
        tamanho: item.tamanho,
        cor: item.cor
      })),
      resumo_pagamento: {
        quantidade_produtos: totalCarrinho.quantidade_total,
        valor_produtos: totalCarrinho.total_produtos,
        frete: frete,
        total_a_pagar: totalFinal,
        valores_formatados: {
          produtos: `R$ ${totalCarrinho.total_produtos.toFixed(2)}`,
          frete: `R$ ${frete.toFixed(2)}`,
          total: `R$ ${totalFinal.toFixed(2)}`
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao gerar resumo:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao gerar resumo da compra'
    });
  }
});

// ==========================================
// 📦 ROTA PARA CRIAR PEDIDOS (CORRIGIDA)
// ==========================================

// Rota POST para criar pedido - ADICIONE ESTA ROTA
app.post('/api/pedidos', autenticar, async (req, res) => {
  console.log('📦 Recebendo requisição para criar pedido...');
  
  try {
    const { total, metodo_pagamento, endereco_entrega, itens } = req.body;
    const userId = req.session.user.idusuarios;
    
    console.log('📋 Dados do pedido:', {
      userId,
      total,
      metodo_pagamento,
      endereco_entrega,
      quantidade_itens: itens?.length || 0
    });
    
    // Validação básica
    if (!itens || itens.length === 0) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Nenhum item no pedido',
        mensagem: 'Adicione produtos ao carrinho antes de finalizar a compra'
      });
    }
    
    if (!total || total <= 0) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Total inválido',
        mensagem: 'O total do pedido é inválido'
      });
    }
    
    if (!metodo_pagamento) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Método de pagamento não informado',
        mensagem: 'Selecione uma forma de pagamento'
      });
    }
    
    // Verificar se o usuário tem produtos no carrinho
    const carrinhoItens = await getCarrinhoByUserId(userId);
    if (carrinhoItens.length === 0) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Carrinho vazio',
        mensagem: 'Seu carrinho está vazio'
      });
    }
    
    // Preparar dados do pedido
    const pedidoData = {
      idusuarios: userId,
      total: parseFloat(total),
      metodo_pagamento,
      endereco_entrega: endereco_entrega || 'Endereço não informado',
      itens: carrinhoItens.map(item => ({
        id_produto: item.id_produto,
        quantidade: item.quantidade,
        preco_unitario: item.valor_produto,
        tamanho: item.tamanho || '',
        cor: item.cor || ''
      }))
    };
    
    console.log('🛒 Criando pedido com dados:', pedidoData);
    
    // Criar pedido usando função existente
    const resultado = await criarPedidoCompleto(pedidoData);
    
    console.log('✅ Pedido criado com sucesso:', resultado.pedido.id_pedido);
      console.log('🤡:', resultado.pedido.total);

    res.status(201).json({
      sucesso: true,
      mensagem: 'Pedido criado com sucesso!',
      pedido: {
        id_pedido: resultado.pedido.id_pedido,
        total: resultado.pedido.total,
        status_geral: resultado.pedido.status_geral,
        data_pedido: resultado.pedido.data_pedido,
        metodo_pagamento: resultado.pedido.metodo_pagamento
      },
      detalhes: {
        total_itens: resultado.total_itens,
        total_pago: `R$ ${resultado.pedido.total}`
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error);
    
    // Retornar erro específico para o frontend
    let mensagemErro = 'Erro ao criar pedido';
    let statusCode = 500;
    
    if (error.message.includes('Estoque insuficiente')) {
      mensagemErro = error.message;
      statusCode = 400;
    } else if (error.message.includes('carrinho')) {
      mensagemErro = 'Erro ao processar carrinho de compras';
    }
    
    res.status(statusCode).json({
      sucesso: false,
      erro: mensagemErro,
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// Rota de teste rápida
app.get('/api/teste-carrinho', autenticar, async (req, res) => {
  try {
    const userId = req.session.user.idusuarios;
    
    // Testar se pode adicionar ao carrinho
    const testeAdicao = await addToCarrinho({
      idusuarios: userId,
      id_produto: 1, // ID de um produto existente
      quantidade: 2,
      tamanho: 'M',
      cor: 'Azul'
    });
    
    // Ver carrinho
    const carrinho = await getCarrinhoByUserId(userId);
    
    // Calcular total
    const total = await calcularTotalCarrinho(userId);
    
    res.json({
      sucesso: true,
      teste_adicao: testeAdicao,
      carrinho: carrinho,
      total: total,
      status: 'Carrinho funcionando!'
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
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