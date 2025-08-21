import React from 'react'
import { ThemeProvider } from '../ThemeContext'
import { ThemeEffect } from '../ThemeEffect'
import './PerfilUsuario.css'; 
import Header from '../components/Header';

function PerfilUsuariocontext(){
    ThemeEffect()
    return(
        <div className='vermelha-PRF'>
            
              <div className='navbar-PRF'>
                   <Header />
              </div>

              <div className='conteine-preto-PRF'>
                
                  <div className='conteine-fino-PRF'>

                        <div className='conteine-do-nomeUsu-PRF'>

                          <img src="" alt="" />
                          <h3>Nome_Usuario</h3>
                        </div>

                        <div  className='conteine-LINHA-PRF'></div>

                        <div  className='conteine-M-F-E-PRF'>

                          <h3>Minhas compras</h3>
                          <h3>Favorito</h3>
                          <h3>Endereço</h3>
                        </div>

                  </div>

                   <div className='conteine-grosso-PRF'>

                      <div className='informação-pessoais-PRF' >
                              <h2>Informações Pessoais</h2>
                      </div>
                      
                      <div className='campo-formulario-nome-PRF' >
                            <label htmlFor="Nome do usuário:"></label>


                      </div>




                     {/* <div className='campo-formulario'>
                            <label>Nome do usuário:</label>
                            <input type="text" value="Kayliany Ketyily Da Silva Lima" readOnly />
                        </div>
                        
                        <div className='campo-formulario'>
                            <label>Email:</label>
                            <input type="email" value="Kaylianyketyily@gmail.com" readOnly />
                        </div>
                        
                        <div className='campo-formulario'>
                            <label>Senha:</label>
                            <input type="password" value="••••••••" readOnly />
                        </div> */}




                   </div>
              </div>



        </div>
    )
}


function PerfilUsuario() {
  return (
  <ThemeProvider>
<PerfilUsuariocontext/>
  </ThemeProvider>
  )
}

export default PerfilUsuario