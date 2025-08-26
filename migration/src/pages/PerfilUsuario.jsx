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

                        <div  className='conteine-LINHA1-PRF'></div>

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
                      
                      <div  className='conteine-LINHA2-PRF'></div>

 
                      <div className='campo-formulario-nome-PRF' >
                            <label className='text-nome-PRF'   htmlFor="">Nome do usuário:</label>
                              <input type="text"c name="" id="" className='input-nome-PRF' />
                      </div> 

                      
                      <div className='campo-formulario-Email-PRF' >
                            <label htmlFor="">Email:</label>
                              <input type="text" name="" id="" className='input-Email-PRF' />
                      </div> 

                          
                      <div className='campo-formulario-senha-PRF' >
                            <label htmlFor="">Senha:</label>
                              <input type="text" name="" id="" className='input-senha-PRF' />
                      </div>         
 
                      <div className='campo-de-opção-sexo-PRF'>


                                <label className='label-sexo-PRF' >Sexo:</label>

                               

                                <div  className='opcoes-sexo' >

                                    <label>
                                        <input type="radio" name="sexo"  /> Feminino
                                    </label>

                                    <label>
                                        <input type="radio" name="sexo"  /> Masculino
                                    </label>

                                    <label>
                                       <input type="radio" name="sexo"  /> Não informar 
                                    </label>

                                </div>

                           <div className='div-vazia-1-PRF' ></div>

                      </div>

                          <div className="div-vazia-2-PRF"></div>

                        <div  className='conteine-dos-buttons-PRF'>

                               <button className='botao-editar'>Editar Perfil</button>
                            <button className='botao-deletar'>Deletar Conta</button>

                        </div>

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