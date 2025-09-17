import React from 'react'
import { ThemeEffect } from '../ThemeEffect'
import { ThemeProvider } from '../ThemeContext'
import Header from '../components/Header'
import './MeusFavoritos.css'
import { Link } from 'react-router-dom';
import ConteineFino from '../components/ConteineFino'


function MeusFavoritosContext() {

    ThemeEffect()
    
       return(
        <div className='div-inclobaTudo-MF'>
    
            <div className='nav-bar-MF'>
                  <Header />
            </div>

            <div className='conteine-black-MF'>

              <div className='conteine-fino-MF' >
                  
 
                  <ConteineFino />
              
              </div>
 
              <div className='conteine-grosso-MF' >

                       <div className='informação-pessoais-MF' >
                          <h2> Meus Favoritos</h2>
                      </div>

                        <div className='conteine-LINHA2-MF' >

                          <div  className='div-LINHA2-MF' ></div>
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