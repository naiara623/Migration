import React, { useState, useEffect } from 'react';
import './Preparando.css';
import { CheckCircle2, Clock, Package, Truck, Home, CheckCircle } from 'lucide-react';

function Preparando({ onClose, isOpen, pedidoId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [statusProducao, setStatusProducao] = useState([]);

  if (!isOpen) return null;

  // Buscar dados do pedido quando o componente abrir
  useEffect(() => {
    if (isOpen && pedidoId) {
      fetchOrderData();
    }
  }, [isOpen, pedidoId]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      
      // Buscar detalhes do pedido
      const pedidoResponse = await fetch(`/api/pedidos/${pedidoId}/status`, {
        credentials: 'include'
      });
      
      if (!pedidoResponse.ok) {
        throw new Error('Erro ao buscar dados do pedido');
      }
      
      const pedidoData = await pedidoResponse.json();
      
      // Buscar status de produção
      const producaoResponse = await fetch(`/api/producao/status/${pedidoId}`, {
        credentials: 'include'
      });
      
      let producaoData = { itens: [], estatisticas: { progresso: 0 } };
      if (producaoResponse.ok) {
        producaoData = await producaoResponse.json();
      }
      
      // Preparar dados para exibição
      const firstItem = pedidoData.itens?.[0] || {};
      
      const orderInfo = {
        title: getStatusTitle(pedidoData.pedido.status_geral),
        subtitle: "Acompanhe o progresso do seu produto em tempo real",
        status: getStatusMessage(pedidoData.pedido.status_geral),
        product: {
          name: firstItem.nome_produto || "Produto Personalizado",
          image: firstItem.imagem_url || "IMO",
          size: firstItem.tamanho || "M",
          colorOutside: firstItem.cor1 || "preto",
          colorInside: firstItem.cor2 || "preto",
          material: firstItem.material || "poliéster",
          stamp: firstItem.estampas || "✓",
          price: firstItem.subtotal || pedidoData.pedido.total || 0,
        },
        orderDetails: {
          orderNumber: `PED-${pedidoData.pedido.id_pedido}`,
          orderDate: new Date(pedidoData.pedido.data_pedido).toLocaleDateString('pt-BR'),
          estimatedTime: "5-7 dias úteis",
          currentStatus: pedidoData.pedido.status_geral,
        },
      };
      
      setOrderData(orderInfo);
      
      // Definir etapas do rastreamento
      const etapasDefinidas = getEtapasRastreamento(
        pedidoData.pedido.status_geral, 
        producaoData.estatisticas.progresso
      );
      setEtapas(etapasDefinidas);
      
      setStatusProducao(producaoData.itens);
      
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao carregar informações do pedido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTitle = (status) => {
    const statusMap = {
      'PENDENTE': 'Seu pedido foi recebido',
      'PROCESSANDO': 'Seu pedido está sendo processado',
      'EM_PRODUCAO': 'Seu produto está sendo produzido',
      'ENVIADO': 'Seu pedido foi enviado',
      'ENTREGUE': 'Pedido entregue com sucesso!',
      'CANCELADO': 'Pedido cancelado'
    };
    return statusMap[status] || 'Acompanhe seu pedido';
  };

  const getStatusMessage = (status) => {
    const messages = {
      'PENDENTE': 'Seu pedido foi confirmado e está aguardando processamento.',
      'PROCESSANDO': 'Estamos preparando os materiais para a produção do seu produto.',
      'EM_PRODUCAO': 'Sua peça está sendo fabricada em nossa máquina personalizadora.',
      'ENVIADO': 'Seu produto foi enviado e está a caminho do endereço cadastrado.',
      'ENTREGUE': 'Seu produto foi entregue! Esperamos que goste!',
      'CANCELADO': 'Este pedido foi cancelado.'
    };
    return messages[status] || 'Acompanhe as atualizações do seu pedido em tempo real.';
  };

  const getEtapasRastreamento = (statusGeral, progresso) => {
    const etapasBase = [
      {
        id: 1,
        nome: 'Pedido Recebido',
        descricao: 'Seu pedido foi confirmado e está na nossa fila',
        icon: Package,
        status: 'completed',
        data: orderData?.orderDetails.orderDate || ''
      },
      {
        id: 2,
        nome: 'Em Processamento',
        descricao: 'Preparando materiais e configurações',
        icon: Clock,
        status: statusGeral === 'PROCESSANDO' || 
               statusGeral === 'EM_PRODUCAO' || 
               statusGeral === 'ENVIADO' || 
               statusGeral === 'ENTREGUE' ? 'current' : 'pending',
        data: statusGeral === 'PROCESSANDO' ? 'Em andamento' : ''
      },
      {
        id: 3,
        nome: 'Em Produção',
        descricao: 'Produto sendo fabricado na máquina',
        icon: Clock,
        status: statusGeral === 'EM_PRODUCAO' ? 'current' : 
               statusGeral === 'ENVIADO' || statusGeral === 'ENTREGUE' ? 'completed' : 'pending',
        progresso: progresso,
        data: `${progresso}% concluído`
      },
      {
        id: 4,
        nome: 'Enviado',
        descricao: 'Produto despachado para entrega',
        icon: Truck,
        status: statusGeral === 'ENVIADO' ? 'current' : 
               statusGeral === 'ENTREGUE' ? 'completed' : 'pending'
      },
      {
        id: 5,
        nome: 'Entregue',
        descricao: 'Produto entregue com sucesso',
        icon: Home,
        status: statusGeral === 'ENTREGUE' ? 'current' : 'pending'
      }
    ];

    return etapasBase;
  };

  const refreshData = () => {
    fetchOrderData();
  };

  if (loading) {
    return (
      <div className='Modal-overlay1' onClick={onClose}>
        <div className='Modal-ContentPre' onClick={(e) => e.stopPropagation()}>
          <div className='loading-container'>
            <div className='spinner'></div>
            <p>Carregando informações do pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='Modal-overlay1' onClick={onClose}>
        <div className='Modal-ContentPre' onClick={(e) => e.stopPropagation()}>
          <div className='error-container'>
            <p className='error-text'>{error}</p>
            <button className='retry-button' onClick={refreshData}>
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className='Modal-overlay1' onClick={onClose}>
        <div className='Modal-ContentPre' onClick={(e) => e.stopPropagation()}>
          <div className='error-container'>
            <p>Nenhum dado de pedido disponível</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='Modal-overlay1' onClick={onClose}>
      <div className='Modal-ContentPre' onClick={(e) => e.stopPropagation()}>
        <div className='order-tracking-content-wrapper'>
          {/* C1: Header Section */}
          <div className='header-section'>
            <h1 className='header-title'>
              {orderData.title}
            </h1>
            <p className='header-subtitle'>
              {orderData.subtitle}
            </p>
            <button className='refresh-button' onClick={refreshData}>
              Atualizar status
            </button>
          </div>

          {/* C2: Status Alert Section */}
          <div className='status-alert-section'>
            <div className='status-alert-icon'>
              <Clock size={20} />
            </div>
            <div>
              <p className='status-alert-text'>
                {orderData.status}
              </p>
            </div>
          </div>

          {/* Nova Seção: Rastreamento do Pedido */}
          <div className='tracking-section'>
            <h3 className='tracking-title'>
              Rastreamento do Pedido
            </h3>
            
            <div className='tracking-timeline'>
              {etapas.map((etapa) => (
                <div 
                  key={etapa.id} 
                  className={`tracking-step ${etapa.status}`}
                >
                  <div className='step-icon-container'>
                    <etapa.icon 
                      size={20} 
                      className={`step-icon ${etapa.status}`}
                    />
                    {etapa.id < etapas.length && (
                      <div className='step-connector'></div>
                    )}
                  </div>
                  
                  <div className='step-content'>
                    <div className='step-header'>
                      <h4 className='step-title'>{etapa.nome}</h4>
                      <span className={`step-status ${etapa.status}`}>
                        {etapa.status === 'completed' && 'Concluído'}
                        {etapa.status === 'current' && 'Em andamento'}
                        {etapa.status === 'pending' && 'Pendente'}
                      </span>
                    </div>
                    
                    <p className='step-description'>{etapa.descricao}</p>
                    
                    {etapa.progresso && etapa.status === 'current' && (
                      <div className='step-progress'>
                        <div className='progress-bar'>
                          <div 
                            className='progress-fill' 
                            style={{ width: `${etapa.progresso}%` }}
                          ></div>
                        </div>
                        <span className='progress-text'>{etapa.progresso}%</span>
                      </div>
                    )}
                    
                    {etapa.data && (
                      <div className='step-date'>
                        <Clock size={14} />
                        <span>{etapa.data}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* C3: Product Details Section */}
          <div className='product-section'>
            <div className='product-grid'>
              {/* Product Image */}
              <div className='product-image-container'>
                {orderData.product.image && orderData.product.image !== 'IMO' ? (
                  <img 
                    src={orderData.product.image} 
                    alt={orderData.product.name}
                    className='product-image'
                  />
                ) : (
                  <div className='product-image-placeholder'>
                    <Package size={40} />
                    <p>Imagem do produto</p>
                  </div>
                )}
              </div>

              {/* Product Information */}
              <div className='product-info'>
                <h2 className='product-name'>
                  {orderData.product.name}
                </h2>

                <div className='product-details-list'>
                  <div className='product-detail-item'>
                    <span className='product-detail-label'>Tamanho:</span>
                    <span className='product-detail-value'>
                      {orderData.product.size}
                    </span>
                  </div>

                  <div className='product-detail-item'>
                    <span className='product-detail-label'>Cor por fora:</span>
                    <span className='product-detail-value'>
                      {orderData.product.colorOutside}
                    </span>
                  </div>

                  <div className='product-detail-item'>
                    <span className='product-detail-label'>Cor por dentro:</span>
                    <span className='product-detail-value'>
                      {orderData.product.colorInside}
                    </span>
                  </div>

                  <div className='product-detail-item'>
                    <span className='product-detail-label'>Material:</span>
                    <span className='product-detail-value'>
                      {orderData.product.material}
                    </span>
                  </div>

                  <div className='product-detail-item'>
                    <span className='product-detail-label'>Estampa:</span>
                    <span className='product-detail-value'>
                      {orderData.product.stamp}
                    </span>
                  </div>

                  <div className='product-price-container'>
                    <span className='product-price-label'>Valor:</span>
                    <span className='product-price-value'>
                      R$ {orderData.product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* C4: Order Details Section */}
          <div className='order-details-section'>
            <h3 className='order-details-title'>
              Detalhes do Pedido
            </h3>

            <div className='order-details-list'>
              <div className='order-detail-row'>
                <label className='order-detail-label'>
                  Número do Pedido:
                </label>
                <input
                  type="text"
                  value={orderData.orderDetails.orderNumber}
                  readOnly
                  className='order-detail-input'
                />
              </div>

              <div className='order-detail-row'>
                <label className='order-detail-label'>
                  Data do Pedido:
                </label>
                <input
                  type="text"
                  value={orderData.orderDetails.orderDate}
                  readOnly
                  className='order-detail-input'
                />
              </div>

              <div className='order-detail-row'>
                <label className='order-detail-label'>
                  Tempo Estimado:
                </label>
                <input
                  type="text"
                  value={orderData.orderDetails.estimatedTime}
                  readOnly
                  className='order-detail-input'
                />
              </div>

              <div className='order-detail-row'>
                <label className='order-detail-label'>
                  Status Atual:
                </label>
                <div className='order-status-container'>
                  <CheckCircle2 size={16} className='order-status-icon' />
                  {orderData.orderDetails.currentStatus}
                </div>
              </div>
            </div>
          </div>

          {/* Nova Seção: Detalhes de Produção */}
          {statusProducao.length > 0 && (
            <div className='production-details-section'>
              <h3 className='production-title'>
                Detalhes da Produção
              </h3>
              
              <div className='production-items'>
                {statusProducao.map((item, index) => (
                  <div key={item.id_producao || index} className='production-item'>
                    <div className='production-item-header'>
                      <span className='production-item-title'>
                        Unidade {item.item_unit || index + 1}
                      </span>
                      <span className={`production-item-status ${item.status_maquina}`}>
                        {getStatusTexto(item.status_maquina)}
                      </span>
                    </div>
                    
                    <div className='production-item-details'>
                      <div className='production-stage'>
                        <span className='stage-label'>Estágio:</span>
                        <span className='stage-value'>{item.estagio_maquina || 'Aguardando'}</span>
                      </div>
                      
                      <div className='production-progress'>
                        <span className='progress-label'>Progresso:</span>
                        <div className='progress-bar-small'>
                          <div 
                            className='progress-fill' 
                            style={{ width: `${item.progresso_maquina || 0}%` }}
                          ></div>
                        </div>
                        <span className='progress-value'>{item.progresso_maquina || 0}%</span>
                      </div>
                      
                      {item.slot_expedicao && (
                        <div className='production-slot'>
                          <span className='slot-label'>Slot:</span>
                          <span className='slot-value'>{item.slot_expedicao}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className='action-buttons'>
            <button className='secondary-button' onClick={onClose}>
              Fechar
            </button>
            <button className='primary-button' onClick={refreshData}>
              Atualizar Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusTexto(status) {
  const statusMap = {
    'PENDENTE': 'Pendente',
    'ENVIADO': 'Enviado para máquina',
    'PROCESSING': 'Em processamento',
    'COMPLETED': 'Concluído',
    'ERRO_ENVIO': 'Erro no envio',
    'NA_FILA': 'Na fila'
  };
  return statusMap[status] || status;
}

export default Preparando;