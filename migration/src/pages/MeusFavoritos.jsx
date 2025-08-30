import React from 'react'
import { ThemeEffect } from '../ThemeEffect'
import { ThemeProvider } from '../ThemeContext'
import Header from '../components/Header'
import './MeusFavoritos.css'
import { Link } from 'react-router-dom';


function MeusFavoritosContext() {

    ThemeEffect()
    
       return(
        <div className='div-inclobaTudo-MF'>
    
            <div className='nav-bar-MF'>
                  <Header />
            </div>

            <div className='conteine-black-MF'>

              <div className='conteine-fino-MF' >
                   <div className='conteine-icon-nomeUsu-MF'>

                           <div className='icone-user-PRF' >
                            <img src="USER.png" alt="" className='img-USER-PRF' />
                           </div>

                           <div  className='conteine-nomeUsu-PRF'>
                            <h3>Nome_Usuario</h3></div>
                          </div>

                        <div  className='conteine-LINHA1-PRF'></div>

                        <div  className='conteine-M-F-E-PRF'>
                         
                            <Link className='nome-minhascompras-PRF' to='/MinhasCompras'> <h3>Minhas compras</h3></Link>

                           <Link className='nome-meusFavorito-PRF' to='/MeusFavoritos'><h3>Meus Favoritos</h3></Link>

                            <Link className='nome-endereço-PRF' to='/Endereco'><h3>Endereço</h3></Link> 

                        </div> 
                  
                
              </div>

              <div className='conteine-grosso-MF' >

                       <div className='informação-pessoais-PRF' >
                          <h2> Meus Favoritos</h2>
                      </div>

              </div>
            </div>

        </div>
        )
    
}

function MeusFavoritos() {
  return (
    <div>

<ThemeProvider>
<MeusFavoritosContext/>
</ThemeProvider>


    </div>
  )
}

export default MeusFavoritos