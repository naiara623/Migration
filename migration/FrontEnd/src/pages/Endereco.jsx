import React from 'react'
import { ThemeContext } from '../ThemeContext'
import { ThemeEffect } from '../ThemeEffect'
import Header from '../components/Header'
import './Endereco.css'
import { Link } from 'react-router-dom';
import ConteineFino from '../components/ConteineFino'

function EnderecoContex(){
   ThemeEffect()

     return(
        <div className='div-inclobaTudo-Endereco'>

           <div className='nav-bar-Endereco'>
                 <Header />
            </div>

             <div className='conteine-black-Endereco'>

             <div className='conteine-fino-Endereco' >
              <ConteineFino/>


             </div>

               <div className='conteine-grosso-Endereco' >

                         <div className='informação-pessoais-Endereco' >
                               <h2> Endereço</h2>
                          </div>

                          <div className='conteine-LINHA2-Endereco' >
                          <div className='div-LINHA2-Endereco' ></div>
                          </div>

                          <div className='LINHA-3-Endereco' ></div>


                        <div className='campos-Endereco' >
                          <div className="TodosIpunts">

                             {/* <div className='div-vazia-Estado' ></div> */}

                          <div className='cep-estado'>

                             <div className='Oicep'>
                            <label className='CEP2-Endereco'>CEP:</label>
                            <input className='cep-Endereco' type="text" id="cep" name="cep" />
                          </div>
                          

                             <div className='OiEstado'>
                            <label htmlFor="cep" className='estado-text-Endereco'>Estado:</label>
                            <input className='Estado-input-Endereco' type="text" id="cep" name="cep" />
                          </div>

                          </div>

 
                          <div className='outros-inputs'>
                            
                            <label  htmlFor="rua" className='rua-text-Endereco' >Rua:</label>
                            <input className='rua-input-Endereco' type="text" />

                          </div>
                
                           <div className='complemento-numero-Estado'>

                             <div className='Oicep'>
                            <label htmlFor="" className='comple-text-Endereco'>Complemento:</label>
                            <input className='complemento-Endereco' type="text" id="Complemento" name="Complemento" />
                          </div>
                          

                             <div className='OiEstado'>
                            <label htmlFor="cep" className='numero-text-Endereco'>Numero:</label>
                            <input className='numero-Endereco' type="text" id="numero" name="numero" />
                          </div>

                          </div>
                              
                          <div className='referencia-Endereco'>
                            
                            <label  htmlFor="rua" className='referencia-text-Endereco' >Referencia:</label>
                            <input className='referencia-input-Endereco' type="text" />

                          </div>
                          
                          </div>
                          
                           

                            <div className='butons-Endereco' >
                              <button className='botao-editar-Endereco'>Editar campos</button>
                            <button className='botao-deletar-Endereco'>Limpar campos</button>
                            </div>
                        </div>
                        

                 </div>
             </div>

         </div>
     )

}







function Endereco() {
 return (

    <ThemeContext>
      <EnderecoContex/>
    </ThemeContext>


  )
}

export default Endereco