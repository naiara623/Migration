// Importa as dependências necessárias
const express = require("express");           // Framework para criar o servidor HTTP
const cors = require("cors");                 // Lib para liberar requisições de outras origens (CORS)
const bodyParser = require("body-parser");    // Facilita o tratamento de JSON no corpo das requisições
const multer = require("multer");           // Usado para upload de arquivos
const path = require("path");                 // Lida com caminhos de arquivos/pastas
const session = require('express-session');   // Gerencia sessões de usuário
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

const upload = multer({ storage: storage });


//Inicializa o servidor
const app = express();
const port=3001;

//variavel temporaria (Não usada com banco, apenas exemplo )
let posts = []

//middlewares globais
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Libera CORS para o front-end
app.use(bodyParser.json()); // Permite interpretar JSON no corpo das requisições
app.use(
  session({
    secret: 'sua_chave_secreta',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Em produção, use true se estiver com HTTPS
  })
);



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


//login de usuario
app.post('/api/login', async (req, res) => {
  const { email_user, senhauser } = req.body;  // aqui pega os nomes do banco
  try {
    const usuario = await selectUser(email_user, senhauser); // busca o usuário no banco
    if (usuario) {
      req.session.user = { email_user: usuario.email_user }; // salva o email na sessão (com o nome correto)
      console.log("req.session.user =======>>>>>>", req.session.user);
      res.json({ sucesso: true, usuario });
    } else {
      res.status(401).json({ erro: 'Email ou senha incorretos' });
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

// Retorna dados do usuário logado
app.get('/api/usuario-atual', async (req, res) => {
  if (!req.session.user || !req.session.user.email_user) {
  return res.status(401).json({ erro: 'Não autenticado' });
}
const email = req.session.user.email_user;

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
app.put('/api/usuarios/:email', async (req, res) => {
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
  try {
    const categorias = await selectAllCategories();
    res.json(categorias);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ erro: 'Erro ao buscar categorias' });
  }
});


// Rota para obter todas as categorias
app.get('/api/categorias', async (req, res) => {
  try {
    console.log('Buscando categorias...');
    const categorias = await selectAllCategories();
    console.log('Categorias encontradas:', categorias);
    res.json(categorias);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ erro: 'Erro ao buscar categorias' });
  }
});


app.get('/api/produtos/categoria/id/:id_categoria', async (req, res) => {
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


app.get('/api/produtos/categoria/:nome_categoria', async (req, res) => {
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


app.get('/api/produtos', async (req, res) => {
  const categoria = req.query.categoria;

  try {
    const client = await pool.connect();

    let query = `
      SELECT p.*, c.nome_categoria
      FROM produtos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
    `;
    let params = [];

    if (categoria) {
      // Aqui você pode aceitar id_categoria (número) ou nome_categoria (string)
      if (!isNaN(categoria)) {
        // categoria é id_categoria
        query += ' WHERE p.id_categoria = $1';
        params.push(parseInt(categoria));
      } else {
        // categoria é nome_categoria
        query += ' WHERE c.nome_categoria ILIKE $1';
        params.push(categoria);
      }
    }

    query += ' ORDER BY p.data_criacao DESC';

    const result = await client.query(query, params);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ erro: 'Erro ao buscar produtos' });
  }
});



// Rota para cadastrar produto (modificada)
app.post('/api/produtos', upload.single('image_url'), async (req, res) => {
  try {
    const { nome_produto, descricao, valor_produto, categoria, estoque } = req.body;
    
    // Buscar o ID da categoria pelo nome
    const categoriaObj = await selectCategoryByName(categoria);
    if (!categoriaObj) {
      return res.status(400).json({ erro: 'Categoria inválida' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await insertProduct({
      nome_produto,
      descricao,
      valor_produto: parseFloat(valor_produto),
      id_categoria: categoriaObj.id_categoria,
      estoque: parseInt(estoque) || 0,
      image_url
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

app.get('/api/produtos', (req, res) => {
  const categoria = req.query.categoria;
  let query = 'SELECT * FROM produtos';
  if (categoria) {
    query += ' WHERE categoria = ?';
    db.query(query, [categoria], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  } else {
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  }
});


// server.js - Corrigir a rota de atualização
app.put('/api/produtos/:id', upload.single('image_url'), async (req, res) => {
  try {
    const { nome_produto, descricao, valor_produto, categoria, estoque } = req.body;
    
    // Buscar o ID da categoria pelo nome
    const categoriaObj = await selectCategoryByName(categoria);
    if (!categoriaObj) {
      return res.status(400).json({ erro: 'Categoria inválida' });
    }

    const updateData = {
      nome_produto,
      descricao,
      valor_produto: parseFloat(valor_produto),
      id_categoria: categoriaObj.id_categoria,
      estoque: parseInt(estoque) || 0
    };

    // Apenas adiciona image_url se uma nova imagem foi enviada
    if (req.file) {
      updateData.image_url = `/uploads/${req.file.filename}`;
    }

    const product = await updateProduct(req.params.id, updateData);

    res.json({ 
      mensagem: 'Produto atualizado com sucesso!',
      product 
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ erro: 'Erro ao atualizar produto' });
  }
});

// Expor a pasta de imagens
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/produtos', async (req, res) => {
  try {
    const products = await selectAllProducts();
    res.json(products);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err.message || err);
    console.error(err.stack);
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
});
;

// server.js - Corrigir a rota DELETE
// index.js - Rota DELETE corrigida
app.delete('/api/produtos/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    console.log('Tentando deletar produto ID:', productId);
    
    // Validar o ID
    if (!productId || productId === 'undefined') {
      return res.status(400).json({ erro: 'ID do produto inválido' });
    }

    // Usar a função corrigida do db.js
    const deletedProduct = await deleteProduct(productId);
    
    res.json({ 
      mensagem: 'Produto deletado com sucesso', 
      produto: deletedProduct 
    });
    
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    if (error.message === 'Produto não encontrado') {
      res.status(404).json({ erro: 'Produto não encontrado' });
    } else {
      res.status(500).json({ erro: 'Erro ao deletar produto' });
    }
  }
});

app.get('/api/produtos/:id', async (req, res) => {
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
app.get('/api/carrinho', async (req, res) => {
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

app.post('/api/carrinho', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }

  try {
    const usuario = await getUserByEmail(req.session.user.email_user);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const { id_produto, quantidade = 1, tamanho = '', cor = '' } = req.body;
    
    const carrinhoItem = await addToCarrinho({
      id_usuario: usuario.idusuarios,
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

app.put('/api/carrinho/:id', async (req, res) => {
  try {
    const { quantidade } = req.body;
    const updatedItem = await updateCarrinhoItem(req.params.id, quantidade);
    res.json({ mensagem: 'Carrinho atualizado', item: updatedItem });
  } catch (error) {
    console.error('Erro ao atualizar carrinho:', error);
    res.status(500).json({ erro: 'Erro ao atualizar carrinho' });
  }
});

app.delete('/api/carrinho/:id', async (req, res) => {
  try {
    const removedItem = await removeFromCarrinho(req.params.id);
    res.json({ mensagem: 'Item removido do carrinho', item: removedItem });
  } catch (error) {
    console.error('Erro ao remover do carrinho:', error);
    res.status(500).json({ erro: 'Erro ao remover do carrinho' });
  }
});

// Rotas de Pedidos
app.post('/api/pedidos', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }

  try {
    const usuario = await getUserByEmail(req.session.user.email_user);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const { itens, total, metodo_pagamento, endereco_entrega } = req.body;

    const pedido = await createPedido({
      id_usuario: usuario.idusuarios,
      itens,
      total,
      metodo_pagamento,
      endereco_entrega
    });

    res.status(201).json({ mensagem: 'Pedido criado com sucesso', pedido });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ erro: 'Erro ao criar pedido' });
  }
});

app.get('/api/pedidos', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }

  try {
    const usuario = await getUserByEmail(req.session.user.email_user);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const pedidos = await getPedidosByUserId(usuario.idusuarios);
    res.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ erro: 'Erro ao buscar pedidos' });
  }
});

// Rota para obter quantidade de itens no carrinho
app.get('/api/carrinho/quantidade', autenticar, async (req, res) => {
  try {
    const resultado = await db.query(
      'SELECT COUNT(*) as quantidade FROM carrinho WHERE id_usuario = $1',
      [req.usuario.id]
    );
    
    res.json({ quantidade: parseInt(resultado.rows[0].quantidade) });
  } catch (error) {
    console.error('Erro ao buscar quantidade do carrinho:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});




app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});