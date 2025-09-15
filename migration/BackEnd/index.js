// Importa as dependências necessárias
const express = require("express");           // Framework para criar o servidor HTTP
const cors = require("cors");                 // Lib para liberar requisições de outras origens (CORS)
const bodyParser = require("body-parser");    // Facilita o tratamento de JSON no corpo das requisições
const multer = require("multer");             // Usado para upload de arquivos
const path = require("path");                 // Lida com caminhos de arquivos/pastas
const session = require('express-session');   // Gerencia sessões de usuário
require("dotenv").config();                   // Carrega variáveis de ambiente do arquivo .env
const db = require("./db");                   // Importa a conexão com o banco de dados
const { insertUser, selectUser, updateUser, deleteUser, getUserByEmail, 
        inserirComentario, listarComentarios } = require("./db"); // Importa funções do banco

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
  if (!req.session.user || !req.session.user.email) { // Verifica se tem sessão
    return res.status(401).json({ erro: 'Não autenticado' });
  }
  const email = req.session.user.email;
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

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});