import React from 'react'
import './EditarProdutos.css';

function EditarProdutos({ isOpen, onClose}) {
    if (!isOpen) return null;

  return (
    <div className='modaloverlay1'>
        <div className='modal-container' onClick={(e) => e.stopPropagation()}>
            <div className='Foto-produto'></div>
        </div>
      
    </div>
  )
}

export default EditarProdutos
