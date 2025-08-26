import React from 'react'
import { ThemeEffect } from '../ThemeEffect'
import { ThemeProvider } from '../ThemeContext'
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
<MeusFavoritos/>
</ThemeProvider>


    </div>
  )
}

export default MeusFavoritos