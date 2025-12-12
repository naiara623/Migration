import React, { useState } from 'react'
import './Login.css'
import { useNavigate } from 'react-router-dom'
import { ThemeProvider } from '../ThemeContext'
import { ThemeEffect } from '../ThemeEffect'
import { useTranslation } from 'react-i18next'

function LoginContext() {
  ThemeEffect()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagemEmail, setMensagemEmail] = useState('')
  const [mensagemSenha, setMensagemSenha] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation();

  // Login.js - modifique o handleLogin para verificar se é ADM

const handleLogin = async e => {
  e.preventDefault()
  let erro = false
  setMensagemEmail('')
  setMensagemSenha('')

  if (!email.trim()) {
    setMensagemEmail('O campo é obrigatório.')
    erro = true
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setMensagemEmail('Email inválido.')
    erro = true
  }

  if (!senha) {
    setMensagemSenha('O campo é obrigatório.')
    erro = true
  } else if (senha.length < 6) {
    setMensagemSenha('A senha deve ter pelo menos 6 caracteres.')
    erro = true
  }

  if (erro) return

  setIsLoading(true)
  try {
    // PRIMEIRO: Tentar login como administrador
    const responseAdm = await fetch('http://localhost:3001/api/login-adm', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const dataAdm = await responseAdm.json();
    
    if (responseAdm.ok && dataAdm.sucesso) {
      // É ADMINISTRADOR - redirecionar para tela de ADM
      setShowModal(true)
      setTimeout(() => navigate('/perfiladm '), 2000) // Nova rota para ADM
      return
    }

    // SE NÃO FOR ADMIN: Tentar login como usuário normal
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_user: email, senhauser: senha }),
    })

    const data = await response.json()
    if (!response.ok) {
      const errorMessage = data.erro || data.message || `Erro ${response.status}`
      throw new Error(errorMessage)
    }

    if (data.sucesso) {
      setShowModal(true)
      setTimeout(() => navigate('/'), 2000)
    } else {
      throw new Error(data.mensagem || 'Login não foi bem-sucedido')
    }
  } catch (err) {
    console.error('Erro ao logar:', err)
    if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      setMensagemSenha('Erro de conexão. Verifique se o servidor está rodando.')
    } else {
      setMensagemSenha(err.message || 'Email ou senha incorretos.')
    }
  } finally {
    setIsLoading(false)
  }
}

  function closeModal() {
    setShowModal(false)
    navigate('/')
  }

  return (
     <div className='Login-1'>
    <div className='LadoEsquerdo-Login'>
      <img className='ilus-png' src="ilustracaoL.png" alt="Ilustração de viagem" />
    </div>

    <div className='ladoDireito-Login'>

      <div className='Titulo-Login'>
        <h1 className='BemVindo-Login'>{t("login.logar.title")}</h1>
      </div>

      <div className='Inputs-Login'>
        <div className='inputNome-Login'>
          <label className='Labelemail-Login'>{t("login.input.email1")}</label>
           <input type="text" className='Email-Login'
            placeholder={t("login.place.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}/>
            {mensagemEmail && <p style={{ color: 'red', marginTop: '-3%', fontSize: '1rem' }}>{mensagemEmail}</p>}
        </div>


        <div className='inputsenha-Login'>
          <label className='Labelsenha-Login'>{t("login.input.senha2")}</label>
           <input type="text" className='Senha-Login'
            placeholder={t("login.place.senha")}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}/>
            {mensagemSenha && <p style={{ color: 'red', marginTop: '-5%' }}>{mensagemSenha}</p>}
        </div>
      </div>

      <div className='Buttons-Login'>


        <div className='butonLogar-Login'>
          <button className='ButtonLogar-Login' onClick={handleLogin} disabled={isLoading}>
            {isLoading ? t('login.button.buton') : t('login.button.butonl') }
          </button>
        </div>

        <div className='butoncadastrar-Login'>
          <button className='ButtonCadastrar-Login' onClick={() => navigate('/cadastro')}>{t("login.button.butonc")}</button>
        </div>
      </div>

            {showModal && (
          <div className="modal">
            <div className="modal-content">
               <img src="oiiiii.png" alt="OI mundo" className='Oimundo-cadastro'/>
              <p className='olaMundo-Cadastro'>{t("modais.modal.logar")}</p>
              <button onClick={closeModal} className='button-cadastro'>Fechar modal</button>
            </div>
          </div>
        )}

    </div>
    </div>
  )
}

export default function Login() {
  return (
    <ThemeProvider>
      <LoginContext />
    </ThemeProvider>
  )
}