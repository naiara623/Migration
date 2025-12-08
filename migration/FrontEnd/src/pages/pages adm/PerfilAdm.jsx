import React from 'react';
import './PerfilAdm.css';
import { ThemeEffect } from '../../ThemeEffect';
import { ThemeContext } from '../../ThemeContext';
import Header from '../../components/Header';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "../../i18n";

function ContextPerfilAdm() {
ThemeEffect()

const {t} = useTranslation();


  return (
    <div className='vermelha-ADM'>

        <div className='navbar-ADM'>  <Header/>  </div>


        <div className='conteine-preto-ADM' >

          <div className='conteine-fino-ADM' > 
           
           
              <div className='conteine-img-nomeUsu-ADM'>
                
                    <div className='conteine-da-img-ADM' >
                       <div className='div-img-ADM' ><img src="User1.png" alt="" /></div>
                    </div>

                    <div className='div-nome-ADM' >
                      <input className='input-nome-ADM' type="text" />
                    </div>

                       

                 </div>


                <div className='conteine-dos-links' >

                        <div className="links">

                          <h3 className='link-loja'><Link to="/loja">{t("navbar.nav.min")}</Link></h3>

                        </div>

                </div>








          </div>   
            
            
            
                               


          <div className='conteine-grosso-ADM' > 
            
              <div className='informação-pessoais-ADM' >
                   <h2>Informações Pessoais</h2>
              </div>
                      
                  <div className="conteine-LINHA2-ADM">
                       <div  className='div-LINHA2-ADM'></div>
                  </div>
 
                  <div className='div-vazia3ADM' ></div>
            
            
                 <div className='campo-formulario-nome-ADM' >
                            <label className='funcao-cor-Em-SE-SXADM  'htmlFor="">Nome:</label>
                              <input type="text" name="" id="" className='input-nome-PRF' />
                  </div> 

                      
                   <div className='campo-formulario-Email-ADM' >
                            <label className='funcao-cor-Em-SE-SXADM'  htmlFor="">Email:</label>
                              <input type="text" name="" id="" className='input-Email-PRF' />
                     </div> 

                          
                      <div className='campo-formulario-senha-ADM' >
                            <label className='funcao-cor-Em-SE-SXADM' htmlFor="">Senha:</label>
                              <input type="text" name="" id="" className='input-senha-PRF' />
                      </div> 


                       <div  className='conteine-dos-buttons-ADM'>

                               <button className='botao-editar-ADM'>EDITAR </button>
                            <button className='botao-deletar-ADM'>SALVAR</button>

                        </div>







          </div>  





























        </div>






    </div>
  )
}

function PerfilAdm(){

  return(
    <ThemeContext>
      <ContextPerfilAdm/>
    </ThemeContext>
  )
}

export default PerfilAdm