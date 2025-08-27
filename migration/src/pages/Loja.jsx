import React, { useState } from 'react';
import { ThemeProvider } from '../ThemeContext';
import { ThemeEffect } from '../ThemeEffect';
import Header from '../components/Header';
import { FaPlusCircle, FaBoxOpen, FaChartPie } from "react-icons/fa"; // ✅ importando ícones
import './Loja.css';

function Lojacontext() {
  ThemeEffect();
  const [activeSection, setActiveSection] = useState(null); // ← começa sem nada selecionado
  
  return (
    <div className='container-loja'>
      <div className='navebar-ok'>
        <Header/>
      </div>
      
      <div className='lojaa-ok'>
        <div className='opções-ok'> 
          <div className="menu-lateral">
            <h2>My Store</h2>
            <div className="menu-options">
              
           <div 
  className={`menu-option ${activeSection === 'produtos' ? 'active' : ''}`}
  onClick={() => setActiveSection('produtos')}
>
  <FaPlusCircle className="option-icon"/>
  <span className="option-text">Adicionar Um Novo Produto</span>
  <div className={`selection-indicator ${activeSection === 'produtos' ? 'visible' : ''}`}></div>
</div>

<div 
  className={`menu-option ${activeSection === 'itens' ? 'active' : ''}`}
  onClick={() => setActiveSection('itens')}
>
  <FaBoxOpen className="option-icon"/>
  <span className="option-text">Selecionar Itens</span>
  <div className={`selection-indicator ${activeSection === 'itens' ? 'visible' : ''}`}></div>
</div>

<div 
  className={`menu-option ${activeSection === 'desempenho' ? 'active' : ''}`}
  onClick={() => setActiveSection('desempenho')}
>
  <FaChartPie className="option-icon"/>
  <span className="option-text">Desempenho Dos Itens</span>
  <div className={`selection-indicator ${activeSection === 'desempenho' ? 'visible' : ''}`}></div>
</div>

            </div>
          </div>
        </div>

        <div className='produtos-ok'>
            <div className="placeholder-image">
                <img className='imagg' src="io.png" alt="" />
            </div>
        </div>
      </div>
    </div>
  )
}

function Loja() {
  return(
    <ThemeProvider>
      <Lojacontext />
    </ThemeProvider>
  )
}

export default Loja;