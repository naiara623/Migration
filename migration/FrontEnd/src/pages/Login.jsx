import React, { useState } from 'react'
import './Login.css'
import { useNavigate } from 'react-router-dom'
import { ThemeProvider } from '../ThemeContext'
import { ThemeEffect } from '../ThemeEffect'

function LoginContext() {
  ThemeEffect()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagemEmail, setMensagemEmail] = useState('')
  const [mensagemSenha, setMensagemSenha] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

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
        // Corrigido para corresponder à rota definida em App.jsx
        setTimeout(() => navigate('/'), 2000)
      } else {
        throw new Error(data.mensagem || 'Login não foi bem-sucedido')
      }
    } catch (err) {
      console.error('Erro ao logar:', err)
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setMensagemSenha('Erro de conexão. Verifique se o servidor está rodando.')
      } else {
        setMensagemSenha(err.message || 'Erro no servidor. Tente novamente.')
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
          <button className='ButtonLogar-Login' onClick={handleLogin} disabled={isLoading}>Logar</button>
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

export default function Login() {
  return (
    <ThemeProvider>
      <LoginContext />
    </ThemeProvider>
  )
}
