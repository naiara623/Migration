import React from 'react'

function Preparando({ isOpen, onClose}) {

     if (!isOpen) return null;

  return (
     <div className='englobaTudo-Modal' onClick={onClose}>
       <div className='grande-modal' onClick={(e) => e.stopPropagation()}>

        

       </div>
     </div>
  )
}

export default Preparando