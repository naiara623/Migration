import React from 'react'
import { ThemeProvider } from '../ThemeContext'
import { ThemeEffect } from '../ThemeEffect'
import './PerfilUsuario.css'; 
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import ConteineFino from '../components/ConteineFino'
import { useTranslation } from 'react-i18next';
import "../i18n"

function PerfilUsuariocontext(){
    ThemeEffect()
    const {t} = useTranslation();
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
                              <h2>{t("perfil.dadospessoais.title")}</h2>
                      </div>
                      
                      <div className="conteine-LINHA2-PRF">
                       <div  className='div-LINHA2-PRF'></div>
                      </div>
 
                      <div className='div-vazia3' ></div>

                      <div className='campo-formulario-nome-PRF' >
                            <label className='funcao-cor-Em-SE-SX'htmlFor="">{t("perfil.dadospessoais.nome")}</label>
                              <input type="text" name="" id="" className='input-nome-PRF' />
                      </div> 

                      
                      <div className='campo-formulario-Email-PRF' >
                            <label className='funcao-cor-Em-SE-SX'  htmlFor="">{t("perfil.dadospessoais.email")}</label>
                              <input type="text" name="" id="" className='input-Email-PRF' />
                      </div> 

                          
                      <div className='campo-formulario-senha-PRF' >
                            <label className='funcao-cor-Em-SE-SX' htmlFor="">{t("perfil.dadospessoais.senha")}</label>
                              <input type="text" name="" id="" className='input-senha-PRF' />
                      </div>         
 
                      <div className='Numero-para-contato-PRF'>

                              
                          <div className='div-vazia-PRE' ></div>

                                <div className='algumacoisa-PRE' >
                                    <label className='funcao-cor-Em-SE-SX1' htmlFor="">{t("perfil.dadospessoais.nume")}</label>
                                    <input className='input-numero' name='' id='' type="number" />
                                    {/* <input className='input-numero' name='' id='' type="number" /> */}
                                </div>

                      </div>

                          <div className="div-vazia-2-PRF"></div>

                        <div  className='conteine-dos-buttons-PRF'>

                               <button className='botao-editar'>{t("perfil.dadospessoais.buto")} </button>
                            <button className='botao-deletar'>{t("perfil.dadospessoais.but1")} </button>

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