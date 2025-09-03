import React, { useState } from 'react'
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

function LoginContext() {
 const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showModal, setShowModal] = useState(false); // Para controlar a exibição do modal
  const navigate = useNavigate();

const handleLogin = () => {
  //pega os usuarios salvos no localStorage
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  //procura um usuario que combine com o email e senha fornecidos
  const usuarioEncontrado = usuarios.find(
    (usuario) => usuario.email === email && usuario.senha === senha
  );

  if (usuarioEncontrado) {
    setShowModal(true); // Exibe o modal de sucesso
    setTimeout(() => navigate('/'), 1500);
  } else {
    alert('Email ou senha incorretos. Tente novamente.');
  }
};

 const closeModal = () => {
      setShowModal(false); // Fecha o modal
      setEmail(''); // Limpa o campo email
      setSenha(''); // Limpa o campo senha 
    };


  return (
     <div className='Login-1'>
    <div className='LadoEsquerdo-Login'></div>

    <div className='ladoDireito-Login'>

      <div className='Titulo-Login'>
        <h1 className='BemVindo-Login'>Bem vindo de volta ao Migration!</h1>
      </div>

      <div className='Inputs-Login'>
        <div className='inputNome-Login'>
          <label className='Labelemail-Login'>E-mail</label>
           <input type="text" className='Email-Login'
            placeholder=' Ex: Nayllany Rodrigues da silva'
            value={email}
            onChange={(e) => setEmail(e.target.value)}/>
        </div>


        <div className='inputsenha-Login'>
          <label className='Labelsenha-Login'>Senha</label>
           <input type="text" className='Senha-Login'
            placeholder=' Ex: 123456'
            value={senha}
            onChange={(e) => setSenha(e.target.value)}/>
        </div>
      </div>

      <div className='Buttons-Login'>

        <div className='butonLogar-Login'>
          <button className='ButtonLogar-Login' onClick={handleLogin}>Logar</button>
        </div>

        <div className='butoncadastrar-Login'>
          <button className='ButtonCadastrar-Login' onClick={() => navigate('/cadastro')}>Cadastrar</button>
        </div>
      </div>

            {showModal && (
          <div className="modal">
            <div className="modal-content">
               <img src="oiiiii.png" alt="OI mundo" className='Oimundo-cadastro'/>
              <p className='olaMundo-Cadastro'>Seja bem vindo!</p>
              <button onClick={closeModal} className='button-cadastro'>Fechar modal</button>
            </div>
          </div>
        )}

    </div>
    </div>
  )
}

function Login() {
  return (
    <ThemeProvider>
         <LoginContext />
    </ThemeProvider>
  )
}

export default Login
