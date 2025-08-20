import React from 'react'
import './Categorias.css'

function Categorias({ isOpen, onClose}) {
  if (!isOpen) return null;

   const categorias = [
    { nome: "Viagens" },
    { nome: "Trilhas" },
    { nome: "Lembranças" },
    { nome: "Mapas" },
    { nome: "Acessórios" },
    { nome: "Ofertas" },
  ];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className='modal-contente' onClick={(e) => e.stopPropagation()}>
        <div className='grid-categorias'>
          {categorias.map((cat, i) => (
            <div className='categoria-card' key={i}>
              <div className='icone'></div>
              <span>{cat.nome}</span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  )
}

export default Categorias
