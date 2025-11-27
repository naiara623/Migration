import React from 'react'
import './PerfilAdm.css'
import { ThemeEffect } from '../../ThemeEffect'
import { ThemeContext } from '../../ThemeContext'

function ContextPerfilAdm() {
ThemeEffect()

  return (
    <div>

oi
        
    </div>
  )
}

function PerfilAdm(){

  return(
    <ThemeContext>
      <ContextPerfilAdm/>
    </ThemeContext>
  )
}

export default PerfilAdm