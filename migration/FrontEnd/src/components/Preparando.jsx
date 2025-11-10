import React from 'react';
import './Preparando.css'

function Preparando({onClose, isOpen}) {
  if (!isOpen) return null

  return (
    <div className='Modal-overlay1' onClick={onClose}>
      <div className='Modal-ContentPre' onClick={(e) => e.stopPropagation()}>

      <div className='conteine-body'>

          <div className='conteine-titulo-Prepa' >

              <h2>Seu produto esta sendo preparado</h2>
              <p>Acompanhe o progresso do seu produto em tempo real</p>

          </div>

            <div className='conteine-aviso-Prepa' >
              <div className="notification-message">
                <p>Seu pedido está em produção. Você receberá uma notificação quando estiver pronto para envio.</p>
              </div>
            </div>

                <div className='conteine-produto-Prepa' >
                    <div className='conteine-imgDoproduto' >

                       <div  className='div-imgDoproduto' >

                       </div>

                    </div>

                    <div></div>

                    <div></div>

                
                </div>

                  <div className='conteine-detalhes-Prepa' ></div>
        </div>



      </div>
    </div>
  )
}

export default Preparando