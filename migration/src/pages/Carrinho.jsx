import React from 'react';
import { ThemeProvider } from '../ThemeContext';
import { ThemeEffect } from '../ThemeEffect';


function CarrinhoContext() {
  ThemeEffect();
  
  return (
<div className='contener-Carrinho'>
    <div className='contener-carrinho'>
        <div className='contener-navbar'>
        </div>
        <div className='contener-contener-Carrinho'>
           <div className='carrinho-mostrar-itens'>

           </div>
           <div className='carrinho-pagar-o-itens'>

           </div>
        </div>
    </div>
</div>
  );
}

function Carrinho() {
  return (
    <ThemeProvider>
      <CarrinhoContext/>
    </ThemeProvider>
  );
}

export default Carrinho;