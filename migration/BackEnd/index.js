// Importa as dependências necessárias
const express = require("express");           // Framework para criar o servidor HTTP
const cors = require("cors");                 // Lib para liberar requisições de outras origens (CORS)
const bodyParser = require("body-parser");    // Facilita o tratamento de JSON no corpo das requisições
const multer = require("multer");           // Usado para upload de arquivos
const path = require("path");                 // Lida com caminhos de arquivos/pastas
const session = require('express-session');   // Gerencia sessões de usuário
const app = express();
require("dotenv").config();                   // Carrega variáveis de ambiente do arquivo .env                // Importa a conexão com o banco de dados
const {
  pool,
  selectProductById,
  deleteProduct,
  insertProduct,
  updateProduct,
  selectAllCategories,
  selectCategoryByName,
  insertUser,
  selectUser,
  selectAllProducts,
  getUserByEmail,
  updateUser,
  getCarrinhoByUserId,
  addToCarrinho,
  updateCarrinhoItem,
  removeFromCarrinho,
  clearCarrinho,
  createPedido,
  getPedidosByUserId
} = require("./db");

function autenticar(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ erro: 'Não autenticado' }); // JSON garantido
  }
  next();
}


app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));



// Exemplo com express-session
app.use(session({
  secret: 'sua_chave_secreta',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true se HTTPS
    sameSite: 'lax' // ou 'strict' se for mesma origem
  }
}));




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





 // Importa funções do banco

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // pasta onde as imagens serão salvas (crie essa pasta!)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

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



//Inicializa o servidor
const port=3001;

//variavel temporaria (Não usada com banco, apenas exemplo )
let posts = []



// Rota de teste
app.get('/api/check-session', (req, res) => {
  console.log('Sessão:', req.session);
  if (req.session.userId) {
    res.json({ autenticado: true });
  } else {
    res.json({ autenticado: false });
  }
});


// --------------ROTAS -------------------

//Cadastrar usuário
app.post('/api/cadastro', async (req, res) => {
  console.log('req.body:', req.body);
  const { nome_usuario, email_user, senhauser, cep, estado_cidade, nome_rua, complemento, numero, referencia } = req.body; // incluir cep
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



// Rota para obter produtos do usuário logado - CORRIGIDA


// Corrigir a rota de login para garantir que o ID seja salvo
app.post('/api/login', async (req, res) => {
  const { email_user, senhauser } = req.body;
  try {
    const usuario = await selectUser(email_user, senhauser);
    if (usuario) {
      req.session.user = {
        id: usuario.idusuarios, // Garantir que o ID está sendo salvo
        email_user: usuario.email_user
      };
      
      // Salvar a sessão antes de responder
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

// Adicionar rota de logout para limpar sessão
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao fazer logout:', err);
      return res.status(500).json({ erro: 'Erro ao fazer logout' });
    }
    res.json({ sucesso: true, mensagem: 'Logout realizado com sucesso' });
  });
});

// Rota para verificar sessão
app.get('/api/check-session', (req, res) => {
  if (req.session.user) {
    res.json({ 
      autenticado: true, 
      user: req.session.user 
    });
  } else {
    res.json({ autenticado: false });
  }
});




// Retorna dados do usuário logado
app.get('/api/usuario-atual', autenticar,  async (req, res) => {
  if (!req.session.user || !req.session.user.email_user) {
  return res.status(401).json({ erro: 'Não autenticado' });
}
const email = req.session.user.email_user;
const usuario = await getUserByEmail(email);

  try {
    const usuario = await getUserByEmail(email); // Busca usuário no banco
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
        followers: 245,   // Valores fixos (mockados)
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

// Atualizar dados de usuário
app.put('/api/usuarios/:email', autenticar,  async (req, res) => {
  const { email } = req.params; // Email vem pela URL
  const { nome_usuario, email_user, estado_cidade, nome_rua, complemento, numero, referencia } = req.body;
  try {
    const updatedUser = await updateUser(email_user, { nome_usuario, email_user, estado_cidade, nome_rua, complemento, numero, referencia });
    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ erro: 'Erro ao atualizar usuário' });
  }
});






// Rota para obter todas as categorias
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



app.get('/api/produtos/categoria/id/:id_categoria',  autenticar, async (req, res) => {
  const id_categoria = parseInt(req.params.id_categoria);

  try {
    const client = await pool.connect();

    // Verifica se a categoria existe
    const categoriaCheck = await client.query(
      'SELECT * FROM categorias WHERE id_categoria = $1',
      [id_categoria]
    );

    if (categoriaCheck.rowCount === 0) {
      client.release();
      return res.status(404).json({ erro: 'Categoria não encontrada' });
    }

    const result = await client.query(`
      SELECT p.*, c.nome_categoria 
      FROM produtos p 
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria 
      WHERE p.id_categoria = $1
      ORDER BY p.data_criacao DESC
    `, [id_categoria]);

    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar produtos por categoria:', error);
    res.status(500).json({ erro: 'Erro ao buscar produtos por categoria' });
  }
});


app.get('/api/produtos/categoria/:nome_categoria', autenticar,  async (req, res) => {
  const nome_categoria = req.params.nome_categoria;

  try {
    const categoria = await selectCategoryByName(nome_categoria);

    if (!categoria) {
      return res.status(404).json({ erro: 'Categoria não encontrada' });
    }

    const client = await pool.connect();
    const result = await client.query(`
      SELECT p.*, c.nome_categoria 
      FROM produtos p 
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria 
      WHERE c.nome_categoria = $1
      ORDER BY p.data_criacao DESC
    `, [nome_categoria]);
    
    res.json(result.rows);
    client.release();
  } catch (error) {
    console.error('Erro ao buscar produtos por categoria:', error);
    res.status(500).json({ erro: 'Erro ao buscar produtos por categoria' });
  }
});






// Rota para cadastrar produto (modificada)
app.post('/api/produtos', upload.single('imagem_url'), async (req, res) => {
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
      idusuarios: req.session.user.id // <-- salvar o dono do produto
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




// Corrigir a rota de produtos para aceitar parâmetro de categoria
app.get('/api/produtos', upload.single('imagem_url'), autenticar, async (req, res) => {
  try {
    const { categoria } = req.query;
    
    if (categoria) {
      // Buscar produtos por nome da categoria
      const categoriaObj = await selectCategoryByName(categoria);
      if (!categoriaObj) {
        return res.status(404).json({ erro: 'Categoria não encontrada' });
      }
      
      const client = await pool.connect();
      const result = await client.query(`
        SELECT p.*, c.nome_categoria 
        FROM produtos p 
        INNER JOIN categorias c ON p.id_categoria = c.id_categoria 
        WHERE c.nome_categoria = $1
        ORDER BY p.data_criacao DESC
      `, [categoria]);
      client.release();
      
      res.json(result.rows);
    } else {
      // Buscar todos os produtos
      const products = await selectAllProducts();
      res.json(products);
    }
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
});
// Expor a pasta de imagens
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota para obter produtos do usuário logado
app.get('/api/meus-produtos', autenticar, async (req, res) => {
  console.log('Session atual na rota /api/meus-produtos:', req.session);
  console.log('User ID na sessão:', req.session.user?.id);
  
  try {
    if (!req.session.user || !req.session.user.id) {
      console.log('Usuário não autenticado ou ID não encontrado na sessão');
      return res.status(401).json({ erro: 'Não autenticado' });
    }

    const client = await pool.connect();
    const result = await client.query(`
      SELECT p.*, c.nome_categoria 
      FROM produtos p 
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria 
      WHERE p.idusuarios = $1
      ORDER BY p.data_criacao DESC
    `, [req.session.user.id]);
    
    client.release();
    console.log(`Encontrados ${result.rows.length} produtos para o usuário ${req.session.user.id}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro detalhado ao buscar produtos do usuário:', error);
    res.status(500).json({ 
      erro: 'Erro ao buscar produtos',
      detalhes: error.message 
    });
  }
});



app.get('/api/produtos', autenticar,  async (req, res) => {
  try {
    const products = await selectAllProducts();
    res.json(products);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err.message || err);
    console.error(err.stack);
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
});


// server.js - Corrigir a rota DELETE
// index.js - Rota DELETE corrigida
app.delete('/api/produtos/:id', autenticar, async (req, res) => {
  try {
    const id_produto = req.params.id;
    console.log('Tentando deletar produto ID:', id_produto);
    
    // Validar o ID
    if (!id_produto || id_produto === 'undefined') {
      return res.status(400).json({ erro: 'ID do produto inválido' });
    }

    // Verificar se o produto pertence ao usuário
    const client = await pool.connect();
    const productCheck = await client.query(
      'SELECT * FROM produtos WHERE id_produto = $1 AND idusuarios = $2',
      [id_produto, req.session.user.id]
    );
    
    if (productCheck.rowCount === 0) {
      client.release();
      return res.status(404).json({ erro: 'Produto não encontrado ou não pertence ao usuário' });
    }

    // Deletar o produto
    await client.query('DELETE FROM produtos WHERE id_produto = $1', [id_produto]);
    client.release();
    
    res.json({ 
      mensagem: 'Produto deletado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ erro: 'Erro ao deletar produto' });
  }
});

app.get('/api/produtos/:id', autenticar,  async (req, res) => {
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



// Rotas do Carrinho
app.get('/api/carrinho', autenticar, async (req, res) => {
    
  console.log('Session user:', req.session.user); // <-- ADICIONE ISSO
  if (!req.session.user) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }

  try {
    const usuario = await getUserByEmail(req.session.user.email_user);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const carrinhoItens = await getCarrinhoByUserId(usuario.idusuarios);
    res.json(carrinhoItens);
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    res.status(500).json({ erro: 'Erro ao buscar carrinho' });
  }
});

app.post('/api/carrinho', autenticar, async (req, res) => {
  const idusuarios = req.session.user.id;
  const { id_produto, quantidade = 1, tamanho = '', cor = '' } = req.body;

  try {
    const carrinhoItem = await addToCarrinho({
      idusuarios,
      id_produto,
      quantidade,
      tamanho,
      cor
    });

    res.status(201).json({ mensagem: 'Produto adicionado ao carrinho', item: carrinhoItem });
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    res.status(500).json({ erro: 'Erro ao adicionar ao carrinho' });
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

app.delete('/api/carrinho/:id', autenticar, async (req, res) => {
  try {
    const removedItem = await removeFromCarrinho(req.params.id);
    res.json({ mensagem: 'Item removido do carrinho', item: removedItem });
  } catch (error) {
    console.error('Erro ao remover do carrinho:', error);
    res.status(500).json({ erro: 'Erro ao remover do carrinho' });
  }
});



// Rota para obter quantidade de itens no carrinho
app.get('/api/carrinho/quantidade', autenticar, async (req, res) => {
  if (!req.session.user) return res.status(401).json({ erro: 'Não autenticado' });

  try {
    const usuario = await getUserByEmail(req.session.user.email_user);
    const result = await pool.query('SELECT COUNT(*) as quantidade FROM carrinho WHERE idusuarios = $1', [usuario.idusuarios]);
    res.json({ quantidade: parseInt(result.rows[0].quantidade) });
  } catch (error) {
    console.error('Erro ao buscar quantidade do carrinho:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});





app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});