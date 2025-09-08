import React from 'react'
import { ThemeProvider } from '../ThemeContext'
import { ThemeEffect } from '../ThemeEffect'
import Header from '../components/Header'
import './Endereco.css'
import { Link } from 'react-router-dom';

function EnderecoContex(){
    ThemeEffect()

    return(
       <div className='div-inclobaTudo-Endereco'>
    
            <div className='nav-bar-Endereco'>
                  <Header />
            </div>

            <div className='conteine-black-Endereco'>

              <div className='conteine-fino-Endereco' >
                   <div className='conteine-icon-nomeUsu-Endereco'>

                           <div className='icone-user-Endereco' >
                            <img src="USER.png" alt="" className='img-USER-Endereco' />
                           </div>

                           <div  className='conteine-nomeUsu-Endereco'>
                               <Link className='nomeUsuario-Endereco' to='/Perfil-usuario'> <h3>Nome_Usuario</h3></Link>
                            
                            
                            </div>
                          </div>

                        <div  className='conteine-LINHA1-Endereco'></div>

                        <div  className='conteine-M-F-E-Endereco'>
                         
                            <Link className='nome-minhascompras-Endereco' to='/MinhasCompras'> <h3>Minhas compras</h3></Link>

                           <Link className='nome-meusFavorito-Endereco' to='/MeusFavoritos'><h3>Meus Favoritos</h3></Link>

                            <Link className='nome-endereço-Endereco' to='/Endereco'><h3>Endereço</h3></Link> 

                        </div> 
                  
                
              </div>

              <div className='conteine-grosso-Endereco' >

                       <div className='informação-pessoais-Endereco' >
                          <h2>Endereço</h2>
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