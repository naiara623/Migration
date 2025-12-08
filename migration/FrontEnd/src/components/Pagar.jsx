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
    
    const totalFrete = 15.00; // Valor fixo para exemplo
    const desconto = 0; // Pode ser calculado baseado em cupons
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
      // Preparar dados do pedido
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
        onClose(); // Fechar modal
        
        // Recarregar a página ou atualizar o estado global
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
    <div className='englobaTudo-Modal' onClick={onClose}>
      <div className='grande-modal' onClick={(e) => e.stopPropagation()}>

        <div className='conteiner-0-pagar' > 
          <div className='conteiner-1-pagar'>
            <h1>Resumo Da Compra</h1>
          </div>

          <div className='conteiner-2-pagar'>
            <div className='div-img-NMusuario-pagar'>
              <div className='div-vazia-pagar'></div>
              <div className='div-img-pino-pagar'>
                <img className='imagem-pino' src="pino-mapa.png" alt="Localização" />
              </div>
              <div className='NM-Usuario-pagar'>
                <input 
                  type="text" 
                  value={usuario?.nome_usuario || ''}
                  readOnly
                  placeholder="Nome do usuário"
                />
              </div>
            </div>

            <div className='div-detalheEndereço-pagar'>
              <div className='div-numerocontato-pagar'>
                <label className='lebels-pagar'>Número Para Contato:</label>
                <input 
                  className='inputs-pagar' 
                  type="text" 
                  value={endereco.numeroContato}
                  onChange={(e) => setEndereco({...endereco, numeroContato: e.target.value})}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className='div-bairro-pagar'>
                <label className='lebels-pagar'>Bairro:</label>
                <input 
                  className='inputs-pagar' 
                  type="text" 
                  value={endereco.bairro}
                  onChange={(e) => setEndereco({...endereco, bairro: e.target.value})}
                  placeholder="Seu bairro"
                />
              </div>

              <div className='div-cidade-pagar'>
                <label className='lebels-pagar'>Cidade:</label>
                <input 
                  className='inputs-pagar' 
                  type="text" 
                  value={endereco.cidade}
                  onChange={(e) => setEndereco({...endereco, cidade: e.target.value})}
                  placeholder="Sua cidade"
                />
              </div>

              <div className='div-estado-pagar'>
                <label className='lebels-pagar'>Estado:</label>
                <input 
                  className='inputs-pagar' 
                  type="text" 
                  value={endereco.estado}
                  onChange={(e) => setEndereco({...endereco, estado: e.target.value})}
                  placeholder="Seu estado"
                />
              </div>
            </div>
          </div>

          <div className='conteiner-3-pagar'>
            <div className='titulo-ProdutoSelec-pagar'>
              <h6>Produto Selecionado</h6>
            </div>

            <div className='div-img-descri-pagar'>
              <div className='div-vazia0-pagar'></div>
              
              {carrinhoItens && carrinhoItens.length > 0 ? (
                carrinhoItens.map((item, index) => (
                  <div key={index} className='div-descricao-produto-pagar'>
                    <div className='div-imagem-pagar'>
                      {item.imagem_url && (
                        <img 
                          src={item.imagem_url} 
                          alt={item.nome_produto}
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    
                    <div className='descriçãoProduto-pagar'>
                      <input 
                        type="text" 
                        value={`${item.nome_produto} - ${item.tamanho || ''} ${item.cor || ''}`}
                        readOnly
                      />
                    </div>
                    
                    <div className='preco-pagar'>
                      <input 
                        type="text" 
                        value={`R$ ${(item.preco_unitario * item.quantidade).toFixed(2)} (${item.quantidade}x)`}
                        readOnly
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className='descriçãoProduto-pagar'>
                  <input type="text" value="Nenhum produto no carrinho" readOnly />
                </div>
              )}
            </div>
          </div>

          <div className='conteiner-4-pagar'>
            <div className='titulo-detalhePG-pagar'>
              <h6>Detalhes do Pagamento</h6>
            </div>

            <div className='div-detalhes-buttons-pagar'>
              <div className='div-vazia2-pagar'></div>

              <div className='detalhe-pagar'>
                <div className='div-metodoPg-pagar'>
                  <label className='labels-detalhe'>Método de Pagamento:</label>
                  <select 
                    className='inputs-detalhes'
                    value={resumoPedido.metodoPagamento}
                    onChange={(e) => setResumoPedido({...resumoPedido, metodoPagamento: e.target.value})}
                  >
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="PIX">PIX</option>
                    <option value="Boleto">Boleto</option>
                  </select>
                </div>

                <div className='div-CupomInse-pagar'>
                  <label className='labels-detalhe'>Cupom Inserido:</label>
                  <input 
                    className='inputs-detalhes' 
                    type="text" 
                    value={resumoPedido.cupom}
                    onChange={(e) => setResumoPedido({...resumoPedido, cupom: e.target.value})}
                    placeholder="Código do cupom"
                  />
                </div>

                <div className='div-QTProduto-pagar'>
                  <label className='labels-detalhe'>Quantidade de Produto:</label>
                  <input 
                    className='inputs-detalhes' 
                    type="text" 
                    value={resumoPedido.quantidadeProdutos}
                    readOnly
                  />
                </div>

                <div className='div-VL-produto-pagar'>
                  <label className='labels-detalhe'>Valor Total do Produto:</label>
                  <input 
                    className='inputs-detalhes' 
                    type="text" 
                    value={`R$ ${resumoPedido.valorTotalProdutos}`}
                    readOnly
                  />
                </div>
                
                <div className='div-TTL-Frete-pagar'>
                  <label className='labels-detalhe'>Total do Frete:</label>
                  <input 
                    className='inputs-detalhes' 
                    type="text" 
                    value={`R$ ${resumoPedido.totalFrete}`}
                    readOnly
                  />
                </div>

                <div className='div-Desconto-pagar'>
                  <label className='labels-detalhe'>Desconto:</label>
                  <input 
                    className='inputs-detalhes' 
                    type="text" 
                    value={`R$ ${resumoPedido.desconto.toFixed(2)}`}
                    readOnly
                  />
                </div>

                <div className='div-Total Apagar-pagar'>
                  <label className='labels-detalhe'>Total a Pagar:</label>
                  <input 
                    className='inputs-detalhes' 
                    type="text" 
                    value={`R$ ${resumoPedido.totalAPagar}`}
                    readOnly
                  />
                </div>
              </div> 

              <div className='div-buttons-pagar'>
                <div className="botoes-container">
                  <button 
                    className="btn-cancelar" 
                    onClick={handleCancelar}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn-confirmar" 
                    onClick={handleFazerPedido}
                    disabled={loading || !carrinhoItens || carrinhoItens.length === 0}
                  >
                    {loading ? 'Processando...' : 'Fazer pedido'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>  
      </div>
    </div>
  );
}

export default Pagar;