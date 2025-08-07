import React from 'react'
import './Login.css';

function Login() {
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
            placeholder=' Ex: Nayllany Rodrigues da silva'/>
        </div>


        <div className='inputsenha-Login'>
          <label className='Labelsenha-Login'>Senha</label>
           <input type="text" className='Senha-Login'
            placeholder=' Ex: 123456'/>
        </div>
      </div>

      <div className='Buttons-Login'>

        <div className='butonLogar-Login'>
          <button className='ButtonLogar-Login'>Logar</button>
        </div>

        <div className='butoncadastrar-Login'>
          <button className='ButtonCadastrar-Login'>Cadastrar</button>
        </div>
      </div>

    </div>
    </div>
  )
}

export default Login
