import React, { useState } from 'react'; // Importa React e o useState para controlar os campos
import './Cadastro.css';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '../ThemeContext'; // Importa o ThemeProvider para aplicar o tema
import { ThemeEffect } from '../ThemeEffect';


function CadastroContext() {
const [nome, setNome] = useState(''); 
const [email, setEmail] = useState(''); 
const [senha, setSenha] = useState(''); 
const [mensagemErro, setMensagemErro] = useState({}); // Para mensagens de erro ou sucesso 
const [erroGeral, setErroGeral] = useState(); // Para controlar a exibição de erros gerais 
const [showModal, setShowModal] = useState(false); // Para controlar a exibição do modal
const [termosAceitos, setTermosAceitos] = useState(false); // para saber se os termos foram aceitos
const [isLoading, setIsLoading] = useState(false); const navigate = useNavigate();

ThemeEffect();

const handleCadastro = async () => {
  setMensagemErro({});
  setErroGeral('');

  const novosErros = {};
  if (!nome.trim()) novosErros.nome = 'O campo é obrigatório.';
  if (!email.trim()) novosErros.email = 'O campo é obrigatório.';
  if (!senha.trim()) novosErros.senha = 'O campo é obrigatório.';
  if (!termosAceitos) novosErros.termos = 'Você deve aceitar os termos de uso.';

  if (Object.keys(novosErros).length > 0) {
    setMensagemErro(novosErros);
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch('http://localhost:3001/api/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
  nome_usuario: nome.trim(),
  email_user: email.trim(),
  senhauser: senha,
}),

    });


    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Erro ao processar a resposta do servidor');
    }

    console.log('response.ok', response.ok);
    console.log('response.status', response.status);
    console.log('data:', data);

    if (!response.ok) {
      if (response.status === 409 && data.erro === 'Email já cadastrado') {
        setMensagemErro({ email: 'Este e-mail já está cadastrado.' });
      } else {
        throw new Error(data.erro || 'Erro desconhecido ao cadastrar.');
      }
      return;
    }

    // Se deu certo, abre o modal
    setShowModal(true);
  } catch (error) {
    setErroGeral(() => {
      if (error?.message === 'Failed to fetch') {
        return 'Não foi possível conectar ao servidor. Por favor, tente novamente mais tarde.';
      }
      return error.message || 'Ocorreu um erro ao cadastrar. Por favor, tente novamente.';
    });
  } finally {
    setIsLoading(false);
  }
};

     function closeModal() {
    setShowModal(false);
    navigate('/');
  }

  const renderErro = (campo, estiloPersonalizado = {}) => mensagemErro[campo] && (
    <p style={{
      color: 'red',
      fontSize: '0.85rem',
      marginTop: campo === 'senha' ? '9px' : '5px',
      ...estiloPersonalizado
    }}>
      {mensagemErro[campo]}
    </p>
  );


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
            {renderErro('nome')}
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
            {renderErro('email')}
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
            {renderErro('senha')}
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
          <div style={{ marginTop: '8px' }}>
          {renderErro('termos',
             { color: 'red',
               fontSize: '0.75rem',
               padding: '4px',
               borderRadius: '4px',
              })}
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
