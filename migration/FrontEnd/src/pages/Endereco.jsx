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
         console.log('Endereço carregado:', data);
         setEndereco(data);
       } else if (response.status === 404) {
         console.log('Endereço não cadastrado. O usuário pode cadastrar agora.');
         // Mantém os campos vazios
       } else {
         const errorData = await response.json();
         console.error('Erro ao carregar endereço:', errorData);
       }
     } catch (error) {
       console.error('Erro ao carregar endereço:', error);
     }
   };

   // Função para salvar endereço
   const salvarEndereco = async () => {
     // Validação básica
     if (!endereco.cep || !endereco.estado || !endereco.cidade || !endereco.bairro) {
       alert('Por favor, preencha todos os campos obrigatórios: CEP, Estado, Cidade e Bairro');
       return;
     }
     
     try {
       console.log('Enviando endereço:', endereco);
       
       const response = await fetch('http://localhost:3001/api/enderecos', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         credentials: 'include',
         body: JSON.stringify(endereco)
       });
       
       const responseData = await response.json();
       
       if (response.ok) {
         alert('Endereço salvo com sucesso!');
         console.log('Resposta do servidor:', responseData);
         // Recarrega os dados após salvar
         carregarEndereco();
       } else {
         console.error('Erro na resposta:', responseData);
         alert(`Erro ao salvar endereço: ${responseData.erro || 'Erro desconhecido'}`);
       }
     } catch (error) {
       console.error('Erro ao salvar endereço:', error);
       alert('Erro de conexão ao salvar endereço');
     }
   };

   // Função para deletar endereço
   const deletarEndereco = async () => {
     if (!window.confirm('Tem certeza que deseja deletar seu endereço?')) {
       return;
     }
     
     try {
       // Primeiro verifica se tem endereço
       const checkResponse = await fetch('http://localhost:3001/api/enderecos', {
         credentials: 'include'
       });
       
       if (checkResponse.ok) {
         const enderecoData = await checkResponse.json();
         
         // Deleta usando o ID
         const deleteResponse = await fetch(`http://localhost:3001/api/enderecos/${enderecoData.id_endereco}`, {
           method: 'DELETE',
           credentials: 'include'
         });
         
         if (deleteResponse.ok) {
           alert('Endereço deletado com sucesso!');
           // Limpa os campos
           setEndereco({
             cep: '',
             estado: '',
             complemento: '',
             numero: '',
             cidade: '',
             bairro: ''
           });
         } else {
           const errorData = await deleteResponse.json();
           alert(`Erro ao deletar endereço: ${errorData.erro}`);
         }
       } else if (checkResponse.status === 404) {
         alert('Você não tem endereço cadastrado para deletar.');
       }
     } catch (error) {
       console.error('Erro ao deletar endereço:', error);
       alert('Erro ao deletar endereço');
     }
   };

   // Carrega o endereço quando o componente montar
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
                            <input className='cep-Endereco'  type="text" 
                     id="estado" 
                     name="estado"
                     value={endereco.estado || ''}
                     onChange={(e) => setEndereco({...endereco, estado: e.target.value})}  />
                          </div>
                          

                             <div className='OiEstado'>
                            <label htmlFor="cep" className='estado-text-Endereco'>{t("perfil.endereco.estado")}</label>
                            <input className='Estado-input-Endereco' id="cidade" 
                     name="cidade"
                     value={endereco.cidade || ''}
                     onChange={(e) => setEndereco({...endereco, cidade: e.target.value})}  />
                          </div>

                          </div>

 
                          <div className='outros-inputs'>
                            
                            <label  htmlFor="rua" className='rua-text-Endereco' >{t("perfil.endereco.rua")}</label>
                            <input className='rua-input-Endereco'   id="bairro" 
                     name="bairro"
                     value={endereco.bairro || ''}
                     onChange={(e) => setEndereco({...endereco, bairro: e.target.value})}  />

                          </div>
                
                           <div className='complemento-numero-Estado'>

                             <div className='Oicep'>
                            <label htmlFor="" className='comple-text-Endereco'>{t("perfil.endereco.comple")}</label>
                            <input className='complemento-Endereco'  type="text" 
                     id="cep" 
                     name="cep"
                     value={endereco.cep || ''}
                     onChange={(e) => setEndereco({...endereco, cep: e.target.value})}  />
                          </div>
                          

                             <div className='OiEstado'>
                            <label htmlFor="cep" className='numero-text-Endereco'>{t("perfil.endereco.refere")}</label>
                            <input className='numero-Endereco' type="text" 
                     id="numero" 
                     name="numero"
                     value={endereco.numero || ''}
                     onChange={(e) => setEndereco({...endereco, numero: e.target.value})} />
                          </div>

                          </div>
                              
                          <div className='referencia-Endereco'>
                            
                            <label  htmlFor="rua" className='referencia-text-Endereco' >{t("perfil.endereco.numero")}:</label>
                            <input className='referencia-input-Endereco'  type="text" 
                     id="complemento" 
                     name="complemento"
                     value={endereco.complemento || ''}
                     onChange={(e) => setEndereco({...endereco, complemento: e.target.value})}  />

                          </div>
                          
                          </div>
                          
                           

                            <div className='butons-Endereco' >
                              <button className='botao-editar-Endereco'  onClick={salvarEndereco}>{t("perfil.endereco.buto")}</button>
                            <button className='botao-deletar-Endereco'onClick={deletarEndereco}>
                 {t("perfil.endereco.but1")} </button>
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