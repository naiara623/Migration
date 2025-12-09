import React, { useState, useEffect } from 'react'
import { ThemeProvider } from '../ThemeContext'
import { ThemeEffect } from '../ThemeEffect'
import './MinhasCompras.css'
import Header from '../components/Header'
import ConteineFino from '../components/ConteineFino'
import Pagar from '../components/Pagar'
import Preparando from '../components/Preparando'
import Caminho from '../components/Caminho'
import Avaliar from '../components/Avaliar'

function MinhasComprasContex() {
    ThemeEffect()

    //modal dos icones
    const [modalPaga, setModalPaga] = useState(false);
    const [modalPrepa, setModalPrepa] = useState(false);
    const [modalCaminho, setModalCaminho] = useState(false);
    const [modalAvalia, setModalAvalia] = useState(false);

    // Estado para armazenar os pedidos e status
    const [pedidos, setPedidos] = useState([]);
    const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
    const [statusDetalhado, setStatusDetalhado] = useState(null);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState(null);

    // Buscar pedidos do usuário
    useEffect(() => {
        buscarPedidos();
    }, []);

    const buscarPedidos = async () => {
        try {
            setCarregando(true);
            const response = await fetch('http://localhost:3001/api/pedidos', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const dados = await response.json();
                setPedidos(dados);
                if (dados.length > 0) {
                    // Seleciona o pedido mais recente por padrão
                    setPedidoSelecionado(dados[0]);
                    buscarStatusDetalhado(dados[0].id_pedido);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
        } finally {
            setCarregando(false);
        }
    };

const buscarStatusDetalhado = async (id_pedido) => {
  try {
    setCarregando(true);
    setErro(null);

  try {
    console.log(`🔍 Buscando status para pedido: ${id_pedido}`);
    
    const response = await fetch(`http://localhost:3001/api/pedidos/${id_pedido}/status`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const erroData = await response.json().catch(() => ({ erro: 'Erro desconhecido' }));
      console.error(`❌ Erro ${response.status}:`, erroData);
      
      if (response.status === 404) {
        setStatusDetalhado(null);
        return;
      }
      
      throw new Error(erroData.erro || `Erro ${response.status}`);
    }

    const dados = await response.json();
    console.log(`✅ Status recebido:`, dados);
    setStatusDetalhado(dados);
  } catch (error) {
    console.error('❌ Erro ao buscar status detalhado:', error);
    setStatusDetalhado(null);
  }
   } catch (error) {
    setErro(error.message);
    setStatusDetalhado(null);
  } finally {
    setCarregando(false);
  }
};


    // Função para determinar a etapa atual baseada no status real
    const getEtapaAtual = () => {
        if (!statusDetalhado) return 0;

        const { pedido, resumo, itens } = statusDetalhado;

        // Etapa 0: A Pagar (pedido criado mas nenhum item em produção)
        if (resumo.itens_prontos === 0 && !itens.some(item => 
            item.unidades.some(unit => unit.status_maquina === 'PROCESSING'))) {
            return 0;
        }

        // Etapa 1: Preparando (alguns itens em produção)
        if (resumo.itens_prontos < resumo.total_itens) {
            return 1;
        }

        // Etapa 2: A Caminho (todos os itens prontos, mas não entregue)
        if (resumo.completo && pedido.status_geral === 'COMPLETO') {
            return 2;
        }

        // Etapa 3: Avaliar (entregue - você pode adicionar lógica de entrega depois)
        return 3;
    };

    const etapaAtual = getEtapaAtual();

    // Função para calcular progresso por etapa
    const getProgressoEtapa = () => {
        if (!statusDetalhado || !statusDetalhado.resumo) return 0;

        const { resumo, itens } = statusDetalhado;
        
        switch (etapaAtual) {
            case 0: // A Pagar
                return 100; // Sempre 100% se está nessa etapa
                
            case 1: // Preparando
                if (resumo.total_itens === 0) return 0;
                return Math.round((resumo.itens_prontos / resumo.total_itens) * 100);
                
            case 2: // A Caminho
                return 100; // Pronto para envio
                
            case 3: // Avaliar
                return 100; // Entregue
                
            default:
                return 0;
        }
    };

    const progresso = getProgressoEtapa();

    // Função para obter texto de status detalhado
    const getTextoStatus = () => {
        if (!statusDetalhado) return 'Carregando...';

        const { resumo, itens } = statusDetalhado;

        switch (etapaAtual) {
            case 0:
                return 'Aguardando processamento do pagamento';
            case 1:
                return `${resumo.itens_prontos} de ${resumo.total_itens} itens produzidos`;
            case 2:
                return 'Produtos prontos! Preparando para envio';
            case 3:
                return 'Pedido entregue! Avalie sua experiência';
            default:
                return 'Status desconhecido';
        }
    };

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
                        <h2 className='Minha-Compras'>Minhas Compras</h2>
                        
                        {/* Seletor de Pedido */}
                        <div className="seletor-pedido">
                            <label className='selecionar-produto'>Selecionar Pedido: </label>
                            <select 
                            className='selecionar'
                                onChange={(e) => {
                                    const pedido = pedidos.find(p => p.id_pedido === parseInt(e.target.value));
                                    setPedidoSelecionado(pedido);
                                    if (pedido) buscarStatusDetalhado(pedido.id_pedido);
                                }}
                                value={pedidoSelecionado?.id_pedido || ''}
                            >
                                <option value="">Selecione um pedido</option>
                                {pedidos.map(pedido => (
                                    <option key={pedido.id_pedido} value={pedido.id_pedido}>
                                        Pedido #{pedido.id_pedido} - R$ {pedido.total} - {new Date(pedido.data_pedido).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className='div-LINHA2-MC' >
                        <div className='conteine-LINHA2-MC' ></div>
                    </div>

                    {/* Status do Pedido */}
                    {pedidoSelecionado && statusDetalhado && (
                        <div className="status-pedido-info">
                            <h3>Status do Pedido #{pedidoSelecionado.id_pedido}</h3>
                            <p className="texto-status">{getTextoStatus()}</p>
                            <div className="barra-progresso">
                                <div 
                                    className="progresso-preenchido"
                                    style={{ width: `${progresso}%` }}
                                ></div>
                            </div>
                            <span>{progresso}% concluído</span>
                        </div>
                    )}

                    <div className='conteine-4-icones-MC'>
                        <div className='div-vazia1-MC' > </div>

                        {/* Ícone da Carteira */}
                        <div className={`div-icone-carteira-MC ${etapaAtual === 0 ? 'passo-ativo' : etapaAtual > 0 ? 'passo-concluido' : ''}`} >
                            <img className='img-icone-carteira-MC' onClick={() => setModalPaga(true)} src="icone-carteira.png" alt="A Pagar" />
                           
                            <Pagar 
                                isOpen={modalPaga}
                                onClose={() => setModalPaga(false)}
                                pedido={pedidoSelecionado}
                                status={statusDetalhado}
                            />         

                            <h3 className='text-icone-carteira-MC' >A pagar</h3>
                        </div>

                        {/* Ícone da Caixa */}
                        <div className={`div-icone-caixa-MC ${etapaAtual === 1 ? 'passo-ativo' : etapaAtual > 1 ? 'passo-concluido' : ''}`} >
                            <img className='img-icone-caixa-MC' onClick={() => setModalPrepa(true)} src="icone-caixa.png" alt="Preparando" />

                            <Preparando
                                isOpen={modalPrepa}
                                onClose={() => setModalPrepa(false)}
                                pedido={pedidoSelecionado}
                                status={statusDetalhado}
                            /> 

                            <h3 className='text-icone-caixa-MC' >Preparando</h3>
                        </div>

                        {/* Ícone do Caminhão */}
                        <div className={`div-icone-caminhão-MC ${etapaAtual === 2 ? 'passo-ativo' : etapaAtual > 2 ? 'passo-concluido' : ''}`} >
                            <img className='img-icone-caminhão-MC' onClick={() => setModalCaminho(true)} src="icone-caminhao.png" alt="A Caminho" />

                            <Caminho
                                isOpen={modalCaminho}
                                onClose={() => setModalCaminho(false)}
                                pedido={pedidoSelecionado}
                                status={statusDetalhado}
                            /> 

                            <h3 className='text-icone-caminhão-MC' >A caminho</h3>
                        </div>

                        {/* Ícone da Avaliação */}
                        <div className={`div-icone-avaliação-MC ${etapaAtual >= 3 ? 'passo-concluido' : ''}`} >
                            <img className='img-icone-avaliaçao-MC' onClick={() => setModalAvalia(true)} src="icone-estrela.png" alt="Avaliar" />

                            <Avaliar
                                isOpen={modalAvalia}
                                onClose={() => setModalAvalia(false)}
                                pedido={pedidoSelecionado}
                                status={statusDetalhado}
                            /> 

                            <h3 className='text-icone-avaliaçao-MC' >Avaliar</h3>
                        </div>

                        <div className='div-vazia2-MC' > </div>
                    </div>

                    <div className='div-da-LINHA3-MC'>
                        <div className='conteine-LINHA3-MC' ></div>
                    </div>

                    {/* Detalhes da Produção */}
                    {statusDetalhado && statusDetalhado.itens && (
                        <div className="detalhes-producao">
                            <h4>Detalhes da Produção</h4>
                            {statusDetalhado.itens.map((item, index) => (
                                <div key={index} className="item-producao">
                                    <div className="info-produto">
                                        <strong>{item.nome_produto}</strong>
                                        <span>Quantidade: {item.quantidade}</span>
                                    </div>
                                    <div className="unidades-producao">
                                        {item.unidades && item.unidades.map((unidade, unitIndex) => (
                                            <div key={unitIndex} className={`unidade ${unidade.status_maquina.toLowerCase()}`}>
                                                <span>Unidade {unidade.item_unit}</span>
                                                <span className={`status ${unidade.status_maquina.toLowerCase()}`}>
                                                    {unidade.status_maquina === 'COMPLETED' ? '✅ Pronto' : 
                                                     unidade.status_maquina === 'PROCESSING' ? '🔄 Produzindo' : 
                                                     '⏳ Pendente'}
                                                </span>
                                                {unidade.slot_expedicao && (
                                                    <span className="slot">Slot: {unidade.slot_expedicao}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Botão para atualizar status */}
                    <button 
                        onClick={() => pedidoSelecionado && buscarStatusDetalhado(pedidoSelecionado.id_pedido)} 
                        className="botao-atualizar"
                        disabled={carregando}
                    >
                        {carregando ? 'Atualizando...' : '🔄 Atualizar Status'}
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