import React from 'react'
import { ThemeProvider } from '../ThemeContext'
import { ThemeEffect } from '../ThemeEffect'
import './MinhasCompras.css'


function MinhasComprasContex() {
   ThemeEffect()

   return(
    <div>



















    </div>
    )
}




function MinhasCompras() {
  return (
  <ThemeProvider>
        <MinhasComprasContex/>
  </ThemeProvider>
  )
}

export default MinhasCompras