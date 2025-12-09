import React, { useEffect, useState } from 'react'
import { ThemeContext } from '../ThemeContext'
import { ThemeEffect } from '../ThemeEffect'
import Header from '../components/Header'
import './Endereco.css'
import { Link } from 'react-router-dom';
import ConteineFino from '../components/ConteineFino'
import { useTranslation } from 'react-i18next'

function EnderecoContex(){
   ThemeEffect()
   const {t} = useTranslation();
   // Adicione um state para os dados do endereço
const [endereco, setEndereco] = useState({
  cep: '',
  estado: '',
  complemento: '',
  numero: '',
  cidade: '',
  bairro: ''
});

// Função para carregar endereço
const carregarEndereco = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/enderecos', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      setEndereco(data);
    }
  } catch (error) {
    console.error('Erro ao carregar endereço:', error);
  }
};

// Função para salvar endereço
const salvarEndereco = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/enderecos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(endereco)
    });
    
    if (response.ok) {
      alert('Endereço salvo com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao salvar endereço:', error);
  }
};

// Use useEffect para carregar o endereço quando o componente montar
useEffect(() => {
  carregarEndereco();
}, []);

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
                               <h2>{t("perfil.endereco.ende")}</h2>
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
                            <label className='CEP2-Endereco'>{t("perfil.endereco.cep")}</label>
                            <input className='cep-Endereco' type="text" id="cep" name="cep" />
                          </div>
                          

                             <div className='OiEstado'>
                            <label htmlFor="cep" className='estado-text-Endereco'>{t("perfil.endereco.estado")}</label>
                            <input className='Estado-input-Endereco' type="text" id="cep" name="cep" />
                          </div>

                          </div>

 
                          <div className='outros-inputs'>
                            
                            <label  htmlFor="rua" className='rua-text-Endereco' >{t("perfil.endereco.rua")}</label>
                            <input className='rua-input-Endereco' type="text" />

                          </div>
                
                           <div className='complemento-numero-Estado'>

                             <div className='Oicep'>
                            <label htmlFor="" className='comple-text-Endereco'>{t("perfil.endereco.comple")}</label>
                            <input className='complemento-Endereco' type="text" id="Complemento" name="Complemento" />
                          </div>
                          

                             <div className='OiEstado'>
                            <label htmlFor="cep" className='numero-text-Endereco'>{t("perfil.endereco.refere")}</label>
                            <input className='numero-Endereco' type="text" id="numero" name="numero" />
                          </div>

                          </div>
                              
                          <div className='referencia-Endereco'>
                            
                            <label  htmlFor="rua" className='referencia-text-Endereco' >{t("perfil.endereco.numero")}:</label>
                            <input className='referencia-input-Endereco' type="text" />

                          </div>
                          
                          </div>
                          
                           

                            <div className='butons-Endereco' >
                              <button className='botao-editar-Endereco'>{t("perfil.endereco.buto")}</button>
                            <button className='botao-deletar-Endereco'>{t("perfil.endereco.but1")}</button>
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