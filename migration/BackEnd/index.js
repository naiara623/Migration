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
  console.log('req.body:', req.body); // <--- aqui
  const { nome_usuario, email_user, senhauser } = req.body;
  try {
    await insertUser({ nome_usuario, email_user, senhauser });
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
  const { email, senha } = req.body;
  try {
    const usuario = await selectUser(email, senha); //busca o usuário no banco
    if (usuario) {
      req.session.user = {email: usuario.email }; //Salva o email na sessão
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

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});
