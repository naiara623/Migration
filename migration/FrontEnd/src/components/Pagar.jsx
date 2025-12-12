import React, { useState, useEffect } from 'react';
import "./Pagar.css"

function Pagar({ isOpen, onClose, carrinhoItens, usuario }) {
  const [endereco, setEndereco] = useState({
    numeroContato: '',
    bairro: '',
    cidade: '',
    estado: ''
  });
  
  const [resumoPedido, setResumoPedido] = useState({
    metodoPagamento: 'Cartão de Crédito',
    cupom: '',
    quantidadeProdutos: 0,
    valorTotalProdutos: 0,
    totalFrete: 0,
    desconto: 0,
    totalAPagar: 0
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuario && isOpen) {
      carregarDadosUsuario();
      calcularResumo();
    }
  }, [usuario, isOpen, carrinhoItens]);

  const carregarDadosUsuario = async () => {
    try {
      // Carregar dados do usuário do backend
      const response = await fetch('/api/usuario-atual', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setEndereco({
          numeroContato: userData.numero || '',
          bairro: userData.rua || '',
          cidade: userData.estado || '',
          estado: userData.estado || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  const calcularResumo = () => {
    if (!carrinhoItens || carrinhoItens.length === 0) return;

    const quantidadeProdutos = carrinhoItens.reduce((total, item) => total + item.quantidade, 0);
    const valorTotalProdutos = carrinhoItens.reduce((total, item) => {
      return total + (item.preco_unitario * item.quantidade);
    }, 0);
    
    const totalFrete = 15.00;
    const desconto = 0;
    const totalAPagar = valorTotalProdutos + totalFrete - desconto;

    setResumoPedido({
      ...resumoPedido,
      quantidadeProdutos,
      valorTotalProdutos: valorTotalProdutos.toFixed(2),
      totalFrete: totalFrete.toFixed(2),
      totalAPagar: totalAPagar.toFixed(2)
    });
  };

  const handleFazerPedido = async () => {
    if (!carrinhoItens || carrinhoItens.length === 0) {
      alert('Carrinho vazio!');
      return;
    }

    setLoading(true);

    try {
      const pedidoData = {
        total: parseFloat(resumoPedido.totalAPagar),
        metodo_pagamento: resumoPedido.metodoPagamento,
        endereco_entrega: {
          ...endereco,
          nomeUsuario: usuario?.nome_usuario
        },
        itens: carrinhoItens.map(item => ({
          id_produto: item.id_produto,
          quantidade: item.quantidade,
          preco_unitario: parseFloat(item.preco_unitario),
          tamanho: item.tamanho || '',
          cor: item.cor || '',
          configuracao: item.configuracao || {}
        }))
      };

      console.log('Enviando pedido:', pedidoData);

      const response = await fetch('/api/pedidos/producao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(pedidoData)
      });

      if (response.ok) {
        const resultado = await response.json();
        alert('Pedido realizado com sucesso! Número do pedido: ' + resultado.pedido.id_pedido);
        onClose();
        window.location.reload();
      } else {
        const erro = await response.json();
        alert('Erro ao fazer pedido: ' + (erro.detalhes || erro.erro));
      }
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      alert('Erro ao processar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    if (window.confirm('Deseja realmente cancelar o pedido?')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='modal-overlay-pagar' onClick={onClose}>
      <div className='modal-content-pagar' onClick={(e) => e.stopPropagation()}>
        <div className='pagar-content-wrapper'>
          
          {/* Header Section */}
          <div className='pagar-header-section'>
            <h1 className='pagar-header-title'>Resumo da Compra</h1>
            <p className='pagar-header-subtitle'>Verifique seus dados e finalize o pedido</p>
          </div>

          {/* User & Address Section */}
          <div className='pagar-address-section'>
            <h3 className='pagar-section-title'>Dados de Entrega</h3>
            
            <div className='pagar-user-info'>
              <div className='pagar-user-icon'>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <input 
                type="text" 
                className='pagar-user-name'
                value={usuario?.nome_usuario || ''}
                readOnly
                placeholder="Nome do usuário"
              />
            </div>

            <div className='pagar-address-grid'>
              <div className='pagar-form-group'>
                <label className='pagar-form-label'>Número Para Contato:</label>
                <input 
                  className='pagar-form-input' 
                  type="text" 
                  value={endereco.numeroContato}
                  onChange={(e) => setEndereco({...endereco, numeroContato: e.target.value})}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className='pagar-form-group'>
                <label className='pagar-form-label'>Bairro:</label>
                <input 
                  className='pagar-form-input' 
                  type="text" 
                  value={endereco.bairro}
                  onChange={(e) => setEndereco({...endereco, bairro: e.target.value})}
                  placeholder="Seu bairro"
                />
              </div>

              <div className='pagar-form-group'>
                <label className='pagar-form-label'>Cidade:</label>
                <input 
                  className='pagar-form-input' 
                  type="text" 
                  value={endereco.cidade}
                  onChange={(e) => setEndereco({...endereco, cidade: e.target.value})}
                  placeholder="Sua cidade"
                />
              </div>

              <div className='pagar-form-group'>
                <label className='pagar-form-label'>Estado:</label>
                <input 
                  className='pagar-form-input' 
                  type="text" 
                  value={endereco.estado}
                  onChange={(e) => setEndereco({...endereco, estado: e.target.value})}
                  placeholder="Seu estado"
                />
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className='pagar-products-section'>
            <h3 className='pagar-section-title'>Produtos Selecionados</h3>

            <div className='pagar-products-list'>
              {carrinhoItens && carrinhoItens.length > 0 ? (
                carrinhoItens.map((item, index) => (
                  <div key={index} className='pagar-product-item'>
                    <div className='pagar-product-image'>
                      {item.imagem_url && (
                        <img 
                          src={item.imagem_url} 
                          alt={item.nome_produto}
                        />
                      )}
                    </div>
                    
                    <div className='pagar-product-details'>
                      <p className='pagar-product-name'>
                        {item.nome_produto}
                      </p>
                      <p className='pagar-product-specs'>
                        {item.tamanho && `Tamanho: ${item.tamanho}`}
                        {item.tamanho && item.cor && ' | '}
                        {item.cor && `Cor: ${item.cor}`}
                      </p>
                    </div>
                    
                    <div className='pagar-product-price'>
                      <p className='pagar-product-quantity'>
                        {item.quantidade}x
                      </p>
                      <p className='pagar-product-total'>
                        R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className='pagar-empty-cart'>




                  <p>Nenhum produto no carrinho</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details Section */}
          <div className='pagar-payment-section'>
            <h3 className='pagar-section-title'>Detalhes do Pagamento</h3>

            <div className='pagar-payment-form'>
              <div className='pagar-form-group'>
                <label className='pagar-form-label'>Método de Pagamento:</label>
                <select 
                  className='pagar-form-select'
                  value={resumoPedido.metodoPagamento}
                  onChange={(e) => setResumoPedido({...resumoPedido, metodoPagamento: e.target.value})}
                >
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="PIX">PIX</option>
                  <option value="Boleto">Boleto</option>
                </select>
              </div>

              <div className='pagar-form-group'>
                <label className='pagar-form-label'>Cupom Inserido:</label>
                <input 
                  className='pagar-form-input' 
                  type="text" 
                  value={resumoPedido.cupom}
                  onChange={(e) => setResumoPedido({...resumoPedido, cupom: e.target.value})}
                  placeholder="Código do cupom"
                />
              </div>
            </div>

            <div className='pagar-summary'>
              <div className='pagar-summary-item'>
                <span className='pagar-summary-label'>Quantidade de Produtos:</span>
                <span className='pagar-summary-value'>{resumoPedido.quantidadeProdutos}</span>
              </div>

              <div className='pagar-summary-item'>
                <span className='pagar-summary-label'>Valor Total do Produto:</span>
                <span className='pagar-summary-value'>R$ {resumoPedido.valorTotalProdutos}</span>
              </div>
              
              <div className='pagar-summary-item'>
                <span className='pagar-summary-label'>Total do Frete:</span>
                <span className='pagar-summary-value'>R$ {resumoPedido.totalFrete}</span>
              </div>

              <div className='pagar-summary-item'>
                <span className='pagar-summary-label'>Desconto:</span>
                <span className='pagar-summary-value'>R$ {resumoPedido.desconto.toFixed(2)}</span>
              </div>

              <div className='pagar-summary-total'>
                <span className='pagar-summary-total-label'>Total a Pagar:</span>
                <span className='pagar-summary-total-value'>R$ {resumoPedido.totalAPagar}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='pagar-actions'>
            <button 
              className='pagar-btn-cancel' 
              onClick={handleCancelar}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              className='pagar-btn-confirm' 
              onClick={handleFazerPedido}
              disabled={loading || !carrinhoItens || carrinhoItens.length === 0}
            >
              {loading ? 'Processando...' : 'Fazer Pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pagar;