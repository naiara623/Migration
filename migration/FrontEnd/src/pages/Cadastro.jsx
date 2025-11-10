import React, { useState } from 'react';
import './Cadastro.css';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '../ThemeContext';
import { ThemeEffect } from '../ThemeEffect';
import "../i18n"
import { useTranslation } from 'react-i18next';

function CadastroContext() {
  const [nome, setNome] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [senha, setSenha] = useState(''); 
  const [mensagemErro, setMensagemErro] = useState({});
  const [erroGeral, setErroGeral] = useState();
  const [showModal, setShowModal] = useState(false);
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();
  
  const { t } = useTranslation(); // Hook de tradução

  ThemeEffect();

  const handleCadastro = async () => {
    setMensagemErro({});
    setErroGeral('');

    const novosErros = {};
    if (!nome.trim()) novosErros.nome = t('requiredField');
    if (!email.trim()) novosErros.email = t('requiredField');
    if (!senha.trim()) novosErros.senha = t('requiredField');
    if (!termosAceitos) novosErros.termos = t('acceptTerms');

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
        throw new Error(t('serverError'));
      }

      console.log('response.ok', response.ok);
      console.log('response.status', response.status);
      console.log('data:', data);

      if (!response.ok) {
        if (response.status === 409 && data.erro === 'Email já cadastrado') {
          setMensagemErro({ email: t('emailAlreadyRegistered') });
        } else {
          throw new Error(data.erro || t('unknownError'));
        }
        return;
      }

      setShowModal(true);
    } catch (error) {
      setErroGeral(() => {
        if (error?.message === 'Failed to fetch') {
          return t('connectionError');
        }
        return error.message || t('registerError');
      });
    } finally {
      setIsLoading(false);
    }
  };

  function closeModal() {
    setShowModal(false);
    navigate('/login');
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
          <h1 className='BemVindo-cadastro'>{t("cadastro.cadstra.title")}</h1>
        </div>

        <div className='Inputs-Cadastro'>
          {/* Campo Nome */}
          <div className='inputNome-Cadastro'>
            <label className='LabelNome-Cadastro'>{t('cadastro.cadstra.nome')}</label>
            <input
              type="text"
              className='Nome-Cadastro'
              placeholder={t('cadastro.inputs.nome')}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            {renderErro('nome')}
          </div>

          {/* Campo Email */}
          <div className='inputemail-Cadastro'>
            <label className='Labelemail-Cadastro'>{t('cadastro.cadstra.email')}</label>
            <input
              type="email"
              className='Email-Cadastro'
              placeholder={t('cadastro.inputs.nome')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {renderErro('email')}
          </div>

          {/* Campo Senha */}
          <div className='inputsenha-Cadastro'>
            <label className='Labelsenha-Cadastro'>{t('cadastro.cadstra.senha')}</label>
            <input
              type="password"
              className='Senha-Cadastro'
              placeholder={t('cadastro.inputs.senha')}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            {renderErro('senha')}
          </div>
        </div>

        {/* Botões */}
        <div className='Buttons-Cadastro'>
          <div className='butonLogar-Cadastro'>
            <button className='ButtonLogar-Cadastro' onClick={() => navigate('/login')}>
              {t('cadastro.button.butonl')}
            </button>
          </div>

          <div className='butoncadastrar-Cadastro'>
            <button className='ButtonCadastrar-Cadastro' onClick={handleCadastro} disabled={isLoading}>
              {isLoading ? t('cadastro.button.buton') : t('cadastro.button.butonc')}
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
              <span>{t('cadastro.termos.termo')}</span>
            </label>
          </div>
          <div style={{ marginTop: '8px' }}>
            {renderErro('termos', {
              color: 'red',
              fontSize: '0.75rem',
              padding: '4px',
              borderRadius: '4px',
            })}
          </div>
        </div>

        {erroGeral && (
          <div className="erro-geral" style={{
            color: 'red',
            backgroundColor: '#ffe6e6',
            padding: '10px',
            borderRadius: '4px',
            margin: '10px 0',
            textAlign: 'center'
          }}>
            {erroGeral}
          </div>
        )}

        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <img src="oiiiii.png" alt="OI mundo" className='Oimundo-cadastro'/>
              <p className='olaMundo-Cadastro'>{t('welcomeMessage')}</p>
              <button onClick={closeModal} className='button-cadastro'>
                {t('closeModal')}
              </button>
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