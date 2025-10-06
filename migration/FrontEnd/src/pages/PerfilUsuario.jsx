import React from 'react'
import { ThemeProvider } from '../ThemeContext'
import { ThemeEffect } from '../ThemeEffect'
import './PerfilUsuario.css'; 
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import ConteineFino from '../components/ConteineFino'

function PerfilUsuariocontext(){
    ThemeEffect()
    return(
        <div className='vermelha-PRF'>
            
              <div className='navbar-PRF'>
                   <Header />
              </div>

              <div className='conteine-preto-PRF'>
                
                 {/* colocar o componente AQUI! */}
                 <div className='conteine-fino-MC' >
                   <ConteineFino />
                </div>

                   <div className='conteine-grosso-PRF'>

                      <div className='informação-pessoais-PRF' >
                              <h2>Informações Pessoais</h2>
                      </div>
                      
                      <div className="conteine-LINHA2-PRF">
                       <div  className='div-LINHA2-PRF'></div>
                      </div>
 
                      <div className='div-vazia3' ></div>

                      <div className='campo-formulario-nome-PRF' >
                            <label className='funcao-cor-Em-SE-SX'htmlFor="">Nome do usuário:</label>
                              <input type="text" name="" id="" className='input-nome-PRF' />
                      </div> 

                      
                      <div className='campo-formulario-Email-PRF' >
                            <label className='funcao-cor-Em-SE-SX'  htmlFor="">Email:</label>
                              <input type="text" name="" id="" className='input-Email-PRF' />
                      </div> 

                          
                      <div className='campo-formulario-senha-PRF' >
                            <label className='funcao-cor-Em-SE-SX' htmlFor="">Senha:</label>
                              <input type="text" name="" id="" className='input-senha-PRF' />
                      </div>         
 
                      <div className='campo-de-opção-sexo-PRF'>

                                <div className='div-VAZIA4-PRF' ></div>

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