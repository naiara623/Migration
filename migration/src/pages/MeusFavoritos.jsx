import React from 'react'
import { ThemeEffect } from '../ThemeEffect'
import { ThemeProvider } from '../ThemeContext'
import Header from '../components/Header'
import './MeusFavoritos.css'

function MeusFavoritosContext() {

    ThemeEffect()
    
       return(
        <div className='div-inclobaTudo-MF'>
    
            <div className='nav-bar-MF'>
                  <Header />
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