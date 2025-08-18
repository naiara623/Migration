import React, { useState } from 'react'; // Importa React e o useState para controlar os campos
import './Cadastro.css';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ThemeEffect } from '../ThemeEffect';

function CadastroContext() {
  ThemeEffect(); // Aplica os efeitos do tema
  // Aqui criamos os estados para armazenar os dados dos inputs
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showModal, setShowModal] = useState(false); // Para controlar a exibição do modal
  const [termosAceitos, setTermosAceitos] = useState(false); // para saber se os termos foram aceitos
    const navigate = useNavigate();

  // Função que será chamada ao clicar no botão "Cadastrar"
  const handleCadastro = () => {
    // Primeiro verificamos se todos os campos estão preenchidos e os termos aceitos
    if (!nome || !email || !senha) {
      alert('Preencha todos os campos!');
      return;
    }

    if (!termosAceitos) {
      alert('Você precisa aceitar os termos de uso.');
      return;
    }

    // Criamos um objeto com os dados do usuário
    const novoUsuario = {
      nome,
      email,
      senha
    };

    // Pegamos os usuários já cadastrados no localStorage (ou array vazio se não tiver nenhum)
    const usuariosExistentes = JSON.parse(localStorage.getItem('usuarios')) || [];

    // Adicionamos o novo usuário na lista
    usuariosExistentes.push(novoUsuario);

    // Salvamos a lista atualizada no localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuariosExistentes));

    setShowModal(true); // Exibe o modal de sucesso

  };
    // const closeModal = () => {
    //   setShowModal(false); // Fecha o modal
    //   setNome(''); // Limpa o campo nome
    //   setEmail(''); // Limpa o campo email
    //   setSenha(''); // Limpa o campo senha
    //   setTermosAceitos(false); // Reseta os termos aceitos
    // };

     function closeModal() {
    setShowModal(false);
    navigate('/');
  }



  return (
    <div className='cadastro-1'>
      <div className='LadoEsquerdo-cadastro'></div>

      <div className='ladoDireito-cadastro'>

        <div className='Titulo-Cadastro'>
          <h1 className='BemVindo-cadastro'>Bem vindo ao Migration!</h1>
        </div>

        <div className='Inputs-Cadastro'>
          {/* Campo Nome */}
          <div className='inputNome-Cadastro'>
            <label className='LabelNome-Cadastro'>Nome Completo</label>
            <input
              type="text"
              className='Nome-Cadastro'
              placeholder=' Ex: Nayllany Rodrigues da Silva'
              value={nome}
              onChange={(e) => setNome(e.target.value)} // Atualiza o estado quando digita
            />
          </div>

          {/* Campo Email */}
          <div className='inputemail-Cadastro'>
            <label className='Labelemail-Cadastro'>E-mail</label>
            <input
              type="email"
              className='Email-Cadastro'
              placeholder=' Ex: NayllanyRS@gmail.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Campo Senha */}
          <div className='inputsenha-Cadastro'>
            <label className='Labelsenha-Cadastro'>Senha</label>
            <input
              type="password"
              className='Senha-Cadastro'
              placeholder=' Ex: 123456'
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
        </div>

        {/* Botões */}
        <div className='Buttons-Cadastro'>
          <div className='butonLogar-Cadastro'>
            <button className='ButtonLogar-Cadastro' onClick={() => navigate('/login')}>Logar</button>
          </div>

          <div className='butoncadastrar-Cadastro'>
            <button className='ButtonCadastrar-Cadastro' onClick={handleCadastro}>
              Cadastrar
            </button>
          </div>
        </div>

        {/* Termos de uso */}
        <div className='Termos-cadastro'>
          <div className="checkbox-wrapper-46">
            <input
              type="checkbox"
              id="cbx-46"
              className="inp-cbx"
              checked={termosAceitos}
              onChange={(e) => setTermosAceitos(e.target.checked)}
            />
            <label htmlFor="cbx-46" className="cbx">
              <span>
                <svg viewBox="0 0 12 10" height="10px" width="12px">
                  <polyline points="1.5 6 4.5 9 10.5 1" />
                </svg>
              </span>
              <span>Li e concordo com os termos de uso</span>
            </label>
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
  );
}

function Cadastro() {
  return (
    <ThemeProvider>
          <CadastroContext />
    </ThemeProvider>

  );
}

export default Cadastro;
