import React from 'react'
import './ModalIdiomas.css' // Ou adicione os estilos inline

function ModalIdiomas({onClose, isOpen}) {
    if (!isOpen) return null;

    // Esta função impede que o clique dentro do modal feche ele
    const stopPropagation = (e) => {
        e.stopPropagation();
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={stopPropagation}>
                <h3 className='Selecione-idi'>Selecione o idioma</h3>
                <div className="idiomas-options">
                    <button>Português</button>
                    <button>English</button>
                    <button>Español</button>
                </div>
            </div>
        </div>
    )
}

export default ModalIdiomas