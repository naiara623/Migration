import React from 'react'
import './Categorias.css'

function Categorias({ isOpen, onClose}) {
  if (!isOpen) return null;

   const categorias = [
    { nome: "Viagens" },
    { nome: "Trilhas" },
    { nome: "Lembranças" },
    { nome: "Acessórios" },
    { nome: "Camping" },
    { nome: "Tecnologia de Viagem" },
    { nome: "Mapas e Guias" },
    { nome: "Moda de Viagem" },
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
