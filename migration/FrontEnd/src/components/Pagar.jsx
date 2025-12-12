import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Pagar.css"

function Pagar({ isOpen, onClose, carrinhoItens, usuario }) {
  const navigate = useNavigate();
  
  const [dadosUsuario, setDadosUsuario] = useState({
    usuario: {
      nome_usuario: '',
      numero: ''
    },
    endereco: {
      cep: '',
      bairro: '',
      cidade: '',
      estado: '',
      complemento: '',
      numero_endereco: ''
    }
  });
  
  const [resumoPedido, setResumoPedido] = useState({
    metodoPagamento: 'Cartão de Crédito',
    cupom: '',
    quantidadeProdutos: 0,
    valorTotalProdutos: 0,
    totalFrete: 15.00,
    desconto: 0,
    totalAPagar: 0
  });

  const [loading, setLoading] = useState(false);
  const [verificandoDados, setVerificandoDados] = useState(true);

  useEffect(() => {
    if (isOpen) {
      carregarDadosParaPagamento();
    }
  }, [isOpen, carrinhoItens]);

  const carregarDadosParaPagamento = async () => {
    try {
      setLoading(true);
      setVerificandoDados(true);
      
      // Usar a nova API para buscar dados completos
      const response = await fetch('http://localhost:3001/api/pagamento/dados-usuario', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados do usuário');
      }
      
      const resultado = await response.json();
      
      if (resultado.sucesso) {
        setDadosUsuario(resultado);
        calcularResumo();
      } else {
        throw new Error(resultado.erro || 'Erro desconhecido');
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados para pagamento:', error);
      alert('Erro ao carregar informações. Tente novamente.');
      onClose();
    } finally {
      setLoading(false);
      setVerificandoDados(false);
    }
  };

  const verificarDadosAntesDeAbrir = async () => {
    try {
      setVerificandoDados(true);
      
      const response = await fetch('http://localhost:3001/api/pagamento/verificar-dados', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erro ao verificar dados');
      }
      
      const resultado = await response.json();
      
      if (!resultado.podeFinalizar && resultado.camposFaltantes.length > 0) {
        const primeiroCampoFaltante = resultado.camposFaltantes[0];
        alert(`Por favor, complete seu ${primeiroCampoFaltante.campo.replace('_', ' ')} antes de fazer um pedido.`);
        
        // Fechar modal e redirecionar
        onClose();
        navigate(primeiroCampoFaltante.rota);
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.error('Erro ao verificar dados:', error);
      alert('Erro ao verificar informações. Tente novamente.');
      return false;
    } finally {
      setVerificandoDados(false);
    }
  };

  const calcularResumo = () => {
    if (!carrinhoItens || carrinhoItens.length === 0) {
      setResumoPedido({
        ...resumoPedido,
        quantidadeProdutos: 0,
        valorTotalProdutos: 0,
        totalAPagar: 0
      });
      return;
    }

    const quantidadeProdutos = carrinhoItens.reduce((total, item) => total + item.quantidade, 0);
    const valorTotalProdutos = carrinhoItens.reduce((total, item) => {
      return total + (parseFloat(item.valor_produto || item.preco_unitario || 0) * item.quantidade);
    }, 0);
    
    const totalFrete = 15.00;
    const desconto = 0;
    const totalAPagar = valorTotalProdutos + totalFrete - desconto;

    setResumoPedido(prev => ({
      ...prev,
      quantidadeProdutos,
      valorTotalProdutos: valorTotalProdutos.toFixed(2),
      totalFrete: totalFrete.toFixed(2),
      totalAPagar: totalAPagar.toFixed(2)
    }));
  };

  const handleFazerPedido = async () => {
    // Primeiro verificar se os dados estão completos
    const dadosOk = await verificarDadosAntesDeAbrir();
    if (!dadosOk) {
      return;
    }
    
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
          ...dadosUsuario.endereco,
          nomeUsuario: dadosUsuario.usuario.nome_usuario,
          numeroContato: dadosUsuario.usuario.numero
        },
        itens: carrinhoItens.map(item => ({
          id_produto: item.id_produto,
          quantidade: item.quantidade,
          preco_unitario: parseFloat(item.valor_produto || item.preco_unitario || 0),
          tamanho: item.tamanho || '',
          cor: item.cor || ''
        }))
      };

      console.log('Enviando pedido:', pedidoData);

      const response = await fetch('http://localhost:3001/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(pedidoData)
      });

      const resultado = await response.json();

      if (response.ok) {
        alert('Pedido realizado com sucesso! Número do pedido: ' + resultado.pedido.id_pedido);
        onClose();
        // Redirecionar para página de pedidos ou home
        navigate('/pedidos');
      } else {
        alert('Erro ao fazer pedido: ' + (resultado.detalhes || resultado.erro || 'Erro desconhecido'));
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
            {loading && <p className='pagar-loading-message'>Carregando informações...</p>}
            {verificandoDados && <p className='pagar-loading-message'>Verificando dados...</p>}
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
                value={dadosUsuario.usuario.nome_usuario || ''}
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
                  value={dadosUsuario.usuario.numero || ''}
                  readOnly
                  placeholder="(00) 00000-0000"
                />
                {!dadosUsuario.usuario.numero && (
                  <small className="pagar-aviso-link">
                    <a href="/Perfil-usuario" onClick={(e) => { e.preventDefault(); onClose(); navigate('/Perfil-usuario'); }}>
                      Cadastrar telefone
                    </a>
                  </small>
                )}
              </div>

              <div className='pagar-form-group'>
                <label className='pagar-form-label'>CEP:</label>
                <input 
                  className='pagar-form-input' 
                  type="text" 
                  value={dadosUsuario.endereco.cep || ''}
                  readOnly
                  placeholder="00000-000"
                />
              </div>

              <div className='pagar-form-group'>
                <label className='pagar-form-label'>Bairro:</label>
                <input 
                  className='pagar-form-input' 
                  type="text" 
                  value={dadosUsuario.endereco.bairro || ''}
                  readOnly
                  placeholder="Seu bairro"
                />
              </div>

              <div className='pagar-form-group'>
                <label className='pagar-form-label'>Cidade:</label>
                <input 
                  className='pagar-form-input' 
                  type="text" 
                  value={dadosUsuario.endereco.cidade || ''}
                  readOnly
                  placeholder="Sua cidade"
                />
              </div>

              <div className='pagar-form-group'>
                <label className='pagar-form-label'>Estado:</label>
                <input 
                  className='pagar-form-input' 
                  type="text" 
                  value={dadosUsuario.endereco.estado || ''}
                  readOnly
                  placeholder="Seu estado"
                />
              </div>

              <div className='pagar-form-group'>
                <label className='pagar-form-label'>Número:</label>
                <input 
                  className='pagar-form-input' 
                  type="text" 
                  value={dadosUsuario.endereco.numero_endereco || ''}
                  readOnly
                  placeholder="123"
                />
              </div>

              <div className='pagar-form-group'>
                <label className='pagar-form-label'>Complemento:</label>
                <input 
                  className='pagar-form-input' 
                  type="text" 
                  value={dadosUsuario.endereco.complemento || ''}
                  readOnly
                  placeholder="Apto 101"
                />
              </div>

              {(!dadosUsuario.endereco.bairro || !dadosUsuario.endereco.cidade || 
                !dadosUsuario.endereco.estado || !dadosUsuario.endereco.numero_endereco) && (
                <div className="pagar-aviso-endereco">
                  <small>
                    <a href="/endereco" onClick={(e) => { e.preventDefault(); onClose(); navigate('/endereco'); }}>
                      ❗ Cadastrar/atualizar endereço
                    </a>
                  </small>
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
                <span className='pagar-summary-label'>Valor Total dos Produtos:</span>
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
              {loading ? 'Processando...' : 'Confirmar Pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pagar;