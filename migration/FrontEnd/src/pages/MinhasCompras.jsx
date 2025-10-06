import React, { useState } from 'react'
import { ThemeProvider } from '../ThemeContext'
import { ThemeEffect } from '../ThemeEffect'
import './MinhasCompras.css'
import Header from '../components/Header'

import ConteineFino from '../components/ConteineFino'
import Pagar from '../components/Pagar'

function MinhasComprasContex() {
    ThemeEffect()

    //modal dos icones
    const [modalAberto, setModalAberto] = useState(false);

    // Essa é a nossa "memória". O 0 é o valor inicial, a primeira etapa.
    const [etapaAtual, setEtapaAtual] = useState(0);

    // Função para avançar a etapa
    const avancarEtapa = () => {
        // Se a etapa atual for menor que 3 (a última etapa), avança.
        if (etapaAtual < 3) {
            setEtapaAtual(etapaAtual + 1);
        }
    }

    // A linha de progresso e o cálculo dela foram removidos daqui

    return (
        <div className='div-inclobaTudo-MC'>
            <div className='nav-bar-MC'>
                <Header />
            </div>

            <div className='conteine-black-MC'>
                <div className='conteine-fino-MC' >
                   <ConteineFino />
                </div>

                <div className='conteine-grosso-MC' >
                    <div className='informação-pessoais-MC' >
                        <h2>Minhas Compras</h2>
                    </div>
                    <div className='div-LINHA2-MC' >
                        <div className='conteine-LINHA2-MC' ></div>
                    </div>

                    <div className='conteine-4-icones-MC'>
                        <div className='div-vazia1-MC' > </div>

                        {/* Ícone da Carteira */}
                        <div className={`div-icone-carteira-MC ${etapaAtual === 0 ? 'passo-ativo' : etapaAtual > 0 ? 'passo-concluido' : ''}`} >
                            <img className='img-icone-carteira-MC' onClick={() => setModalAberto(true) } src="icone-carteira.png" alt="" />

                               <Pagar 
                               isOpen={modalAberto}
                               onClose ={() => setModalAberto(false)}
                               />         

                            <h3 className='text-icone-carteira-MC' >A pagar</h3>
                        </div>


                        {/* Ícone da Caixa */}
                        <div className={`div-icone-caixa-MC ${etapaAtual === 1 ? 'passo-ativo' : etapaAtual > 1 ? 'passo-concluido' : ''}`} >
                            <img className='img-icone-caixa-MC'  src="icone-caixa.png" alt="Clique-Aqui" />  



                            <h3 className='text-icone-caixa-MC' >Preparando</h3>
                        </div>

                        {/* Ícone do Caminhão */}
                        <div className={`div-icone-caminhão-MC ${etapaAtual === 2 ? 'passo-ativo' : etapaAtual > 2 ? 'passo-concluido' : ''}`} >
                            <img className='img-icone-caminhão-MC' src="icone-caminhao.png" alt="" />
                            <h3 className='text-icone-caminhão-MC' >A caminho</h3>
                        </div>

                        {/* Ícone da Avaliação */}
                        <div className={`div-icone-avaliação-MC ${etapaAtual >= 3 ? 'passo-concluido' : ''}`} >
                            <img className='img-icone-avaliaçao-MC' src="icone-estrela.png" alt="" />
                            <h3 className='text-icone-avaliaçao-MC' >Avaliar</h3>
                        </div>

                        <div className='div-vazia2-MC' > </div>
                    </div>

                    <div className='div-da-LINHA3-MC'>
                        <div className='conteine-LINHA3-MC' ></div>
                    </div>

                    {/* Botão para avançar na simulação */}
                    <button onClick={avancarEtapa} style={{ marginTop: '20px', padding: '10px' }}>
                        Avançar Etapa
                    </button>
                    
                </div>
            </div>
        </div>
    )
}

function MinhasCompras() {
    return (
        <ThemeProvider>
            <MinhasComprasContex />
        </ThemeProvider>
    )
}

export default MinhasCompras