import React from 'react'
import './Categorias.css'

function Categorias({ isOpen, onClose}) {
  if (!isOpen) return null;

   const categorias = [
    { nome: "Viagens", imagem: "/Pass.jpg" },
    { nome: "Trilhas", imagem: "/trilhas.jpg"},
    { nome: "Lembranças", imagem: "/Lembranças.jpg" },
    { nome: "Acessórios", imagem: "/Almofada.jpg" },
    { nome: "Camping", imagem: "/Camping.jpg" },
    { nome: "Tecnologia de Viagem", imagem: "/Tecnologia.jpg" },
    { nome: "Moda de Viagem", imagem: "/Moda.jpg" },
  ];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className='modal-contente' onClick={(e) => e.stopPropagation()}>
        <div className='grid-categorias'>
          {categorias.map((cat, i) => (
            <div className='categoria-card' key={i}>
          <img src={cat.imagem} alt={cat.nome} className='icone' />
              <span>{cat.nome}</span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  )
}

export default Categorias
