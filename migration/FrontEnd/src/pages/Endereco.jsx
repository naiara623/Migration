import React from 'react'
import { ThemeProvider } from '../ThemeContext'
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

                        <div className='campos-Endereco' >
                          
                          <div className='cep-estado'>

                             <div className='Oicep'>
                            <label htmlFor="cep">CEP:</label>
                            <input className='cep-Endereco' type="text" id="cep" name="cep" />
                          </div>
                          

                             <div className='OiEstado'>
                            <label htmlFor="cep">Estado:</label>
                            <input className='Estado-Endereco' type="text" id="cep" name="cep" />
                          </div>

                          </div>


                          <div className='outros-inputs'>
                            <div className='divvaziha3'></div>

                            <label htmlFor="cep">Estado:</label>
                            <input className='rua-Endereço' type="text" />

                          </div>
                

                         

                           {/* <div className='Oicep'>
                            <label htmlFor="cep">CEP:</label>
                            <input className='cep-Endereco' type="text" id="cep" name="cep" />
                          </div>

                           <div className='Oicep'>
                            <label htmlFor="cep">CEP:</label>
                            <input className='cep-Endereco' type="text" id="cep" name="cep" />
                          </div>

                               <div className='Oicep'>
                            <label htmlFor="cep">CEP:</label>
                            <input className='cep-Endereco' type="text" id="cep" name="cep" />
                          </div>

                           <div className='Oicep'>
                            <label htmlFor="cep">CEP:</label>
                            <input className='cep-Endereco' type="text" id="cep" name="cep" />
                          </div> */}
                        </div>
                        

                 </div>
             </div>

         </div>
     )

}







function Endereco() {
 return (

    <ThemeProvider>
      <EnderecoContex/>
    </ThemeProvider>


  )
}

export default Endereco