import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '../ThemeContext';
import { ThemeEffect } from '../ThemeEffect';
import Header from '../components/Header';
import './Carrinho.css';

// Checkbox Customizado
const CustomCheckbox = ({ id, label, checked, onChange }) => (
  <div className="checkbox-container-new">
    <input 
      type="checkbox" 
      id={id} 
      checked={checked}
      onChange={onChange}
    />
    <label htmlFor={id} className="checkBox-new">
      <div className="transition-new"></div>
    </label>
    <label htmlFor={id} className="checkbox-label-new">
      {label}
    </label>
    <div className="clear"></div>
  </div>
);

// Radio de pagamento
const PaymentRadio = ({ id, label, name, checked, onChange, description }) => (
  <div className="content-pix" onClick={() => onChange(true)}>
    <label className="checkBox-pix-new">
      <input 
        type="radio" 
        id={id}
        name={name}
        checked={checked}
        onChange={(e) => {
          e.stopPropagation();
          onChange(e.target.checked);
        }}
      />
      <div className="transition-pix-new"></div>
    </label>
    <div className="text-desc-pix">
      <span className="text-pix">
        {label}
        <p className="desc-pix">{description}</p>
      </span>
    </div>
  </div>
);

// Checkbox Produto
const ProductCheckbox = ({ id, checked, onChange }) => (
  <div className="checkbox-product-container">
    <input 
      type="checkbox" 
      id={id}
      checked={checked}
      onChange={onChange}
    />
    <label htmlFor={id} className="checkBox-product">
      <div className="transition-product"></div>
    </label>
  </div>
);

// Carrinho.js - Atualizações
function CarrinhoContent() {
  ThemeEffect();
  const [products, setProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  
const subtotal = products
  .filter(item => item.checked) // só produtos marcados
  .reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Calcular desconto
const desconto = appliedCoupon 
  ? subtotal * (appliedCoupon.discountPercent / 100)
  : 0;

const total = subtotal - desconto;


  // ✅ ATUALIZADO: Buscar produtos do carrinho
  const fetchCarrinho = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/carrinho', { 
        credentials: 'include' 
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Itens do carrinho:', data);
      
      const formatted = data.map(item => ({
        id: item.id_carrinho,
        id_produto: item.id_produto,
        name: item.nome_produto,
        price: parseFloat(item.valor_produto),
        quantity: item.quantidade,
        tamanho: item.tamanho || '',
        cor: item.cor || '',
        image: item.imagem_url,
        checked: false
      }));
      
      setProducts(formatted);
    } catch (err) {
      console.error('❌ Erro ao buscar carrinho:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuthAndFetchCart = async () => {
      try {
        const userResponse = await fetch('http://localhost:3001/api/check-session', { 
          credentials: 'include' 
        });
        
        if (!userResponse.ok) {
          throw new Error('Usuário não autenticado');
        }
        
        const user = await userResponse.json();
        console.log('👤 Usuário logado:', user);
        await fetchCarrinho();
        
      } catch (err) {
        console.warn('⚠️ Usuário não logado', err);
        setProducts([]);
      }
    };

    checkAuthAndFetchCart();
  }, []);

  // ✅ ATUALIZADO: Atualizar quantidade no carrinho
  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/carrinho/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantidade: newQuantity }),
        credentials: 'include'
      });

      if (response.ok) {
        // Atualizar localmente para resposta mais rápida
        setProducts(products.map(p => 
          p.id === id ? { ...p, quantity: newQuantity } : p
        ));
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao atualizar quantidade:', errorData);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar quantidade:', error);
    }
  };

  // ✅ ATUALIZADO: Remover produto do carrinho
  const handleRemoveProduct = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/carrinho/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao remover produto:', errorData);
      }
    } catch (error) {
      console.error('❌ Erro ao remover produto:', error);
    }
  };

  // ✅ ATUALIZADO: Limpar carrinho
  const handleClearCart = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/carrinho/limpar', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setProducts([]);
        setSelectAll(false);
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao limpar carrinho:', errorData);
      }
    } catch (error) {
      console.error('❌ Erro ao limpar carrinho:', error);
    }
  };

  // Selecionar/deselecionar todos os produtos
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setProducts(products.map(p => ({ ...p, checked: newSelectAll })));
  };

  // Selecionar produto individual
  const handleProductSelect = (id) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, checked: !p.checked } : p
    ));
  };

  // ✅ ATUALIZADO: Finalizar compra
  const handleFinalizarCompra = async () => {
    const selectedProducts = products.filter(p => p.checked);
    
    if (selectedProducts.length === 0) {
      alert('Selecione pelo menos um produto para comprar');
      return;
    }

    if (!paymentMethod) {
      alert('Selecione uma forma de pagamento');
      return;
    }

    try {
      const pedidoData = {
        itens: selectedProducts.map(p => ({
          id_produto: p.id_produto,
          quantidade: p.quantity,
          preco_unitario: p.price,
          tamanho: p.tamanho,
          cor: p.cor
        })),
        total: total,
        metodo_pagamento: paymentMethod,
        endereco_entrega: "Endereço do usuário" // Você pode pegar do perfil do usuário
      };

      console.log('📦 Dados do pedido:', pedidoData);

      const response = await fetch('http://localhost:3001/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedidoData),
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        alert('✅ Pedido realizado com sucesso!');
        console.log('📋 Pedido criado:', result);
        
        // Recarregar carrinho (deve estar vazio agora)
        await fetchCarrinho();
        setSelectAll(false);
        setPaymentMethod("");
      } else {
        const errorData = await response.json();
        console.error('❌ Erro na resposta:', errorData);
        alert('❌ Erro ao realizar pedido: ' + (errorData.erro || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('❌ Erro ao finalizar compra:', error);
      alert('❌ Erro ao finalizar compra: ' + error.message);
    }
  };

  // Função remover cupom
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  const handleApplyCoupon = async () => {
    try {
      // Aqui estamos apenas simulando um cupom fixo para teste
      const CupomValido = "MIGRANDO";
      if (couponInput.toUpperCase() === CupomValido) {
        setAppliedCoupon({ code: CupomValido, discountPercent: 50 });
      } else {
        alert("Cupom inválido");
      }
    } catch (error) {
      console.error("Erro ao aplicar cupom:", error);
      alert("Erro ao aplicar cupom");
    }
  };

  if (loading) {
    return (
      <div className='contener-Carrinho'>
        <div className='contener-carrinho'>
          <div className='contener-navbar'>
            <Header/>
          </div>
          <div className='loading-carrinho'>
            <p>🔄 Carregando carrinho...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='contener-Carrinho'>
      <div className='contener-carrinho'>
        <div className='contener-navbar'>
          <Header/>
        </div>
        <div className='contener-contener-Carrinho'>

          {/* Itens */}
          <div className='carrinho-mostrar-itens'>
            <div className='carrinho-pedidos'>
              
              {products.length > 0 && (
                <div className="cart-header">
                  <div className="select-all">
                    <CustomCheckbox 
                      id="selectAll" 
                      label={`Selecionar todos os itens (${products.length})`}
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </div>
                  <button 
                    className="clear-cart-btn"
                    onClick={handleClearCart}
                  >
                    🗑️ Limpar Carrinho
                  </button>
                </div>
              )}
              
              {products.length === 0 && (
                <div className="empty-cart">
                  <p>🛒 Seu carrinho está vazio</p>
                  <button 
                    onClick={fetchCarrinho}
                    className="refresh-cart-btn"
                  >
                    🔄 Recarregar Carrinho
                  </button>
                </div>
              )}

              {products.map((p) => (
                <div className="item-card" key={p.id}>
                  <div className="item-header">
                    <ProductCheckbox 
                      id={p.id} 
                      checked={p.checked}
                      onChange={() => handleProductSelect(p.id)}
                    />
                  </div>
                  <div className="item-info">
                    <h3>{p.name}</h3>
                    <div className="item-details">
                      {p.tamanho && <span className="detail-tag">Tamanho: {p.tamanho}</span>}
                      {p.cor && <span className="detail-tag">Cor: {p.cor}</span>}
                      <span className="item-price">R$ {p.price.toFixed(2)}</span>

                      <div className="quantity-controls">
                        <button 
                          onClick={() => updateQuantity(p.id, p.quantity - 1)} 
                          disabled={p.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{p.quantity}</span>
                        <button onClick={() => updateQuantity(p.id, p.quantity + 1)}>
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="remove-button" 
                    onClick={() => handleRemoveProduct(p.id)}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pagamento */}
          <div className='carrinho-pagar-o-itens'>
            <div className='carrinho-pagamento'>
              <div className="payment-container">
                <h1 className="payment-title">Resumo da compra</h1>
                <hr className="payment-divider" />
                
                <div className="price-section">
                  <div className="price-row">
                   <span className="price-label">
  Subtotal ({products.filter(p => p.checked).length} itens)
</span>
                    <span className="price-value bold">R$ {subtotal.toFixed(2)}</span>
                  </div>

                  {/* Área do cupom */}
                  <div className="coupon-section">
                    {!appliedCoupon ? (
                      <div className="coupon-input-area">
                        <input 
                          type="text" 
                          placeholder="Digite seu cupom" 
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                        />
                        <button onClick={handleApplyCoupon}>Aplicar</button>
                      </div>
                    ) : (
                      <div className="applied-coupon">
                        <span>Cupom aplicado: <strong>{appliedCoupon.code}</strong></span>
                        <button onClick={handleRemoveCoupon}>Remover</button>
                      </div>
                    )}
                  </div>
                  
                  {appliedCoupon && (
                    <div className="price-row">
                      <span className="price-label small">Desconto ({appliedCoupon.code})</span>
                      <span className="price-value small discount">- R$ {desconto.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <hr className="payment-divider" />
                  
                  <div className="price-row total-row">
                    <span className="price-label">Total</span>
                    <span className="price-value bold total">R$ {total.toFixed(2)}</span>
                  </div>
                </div>
                
                <hr className="payment-divider" />
                
                <div className="payment-method">
                  <h3>Forma de pagamento</h3>
                  <PaymentRadio 
                    id="pixPayment" 
                    name="paymentMethod"
                    label="Pix"
                    description="Pagamento instantâneo"
                    checked={paymentMethod === "pix"}
                    onChange={() => setPaymentMethod("pix")}
                  />
                  <PaymentRadio 
                    id="visaPayment" 
                    name="paymentMethod"
                    label="Visa"
                    description="Pagamento com cartão Visa"
                    checked={paymentMethod === "visa"}
                    onChange={() => setPaymentMethod("visa")}
                  />
                  <PaymentRadio 
                    id="outroPayment" 
                    name="paymentMethod"
                    label="Outro"
                    description="Outras formas"
                    checked={paymentMethod === "outro"}
                    onChange={() => setPaymentMethod("outro")}
                  />
                </div>
                
                <button 
                  className="buy-button" 
                  disabled={products.filter(p => p.checked).length === 0 || !paymentMethod}
                  onClick={handleFinalizarCompra}
                >
                  Comprar agora ({products.filter(p => p.checked).length} itens)
                </button>

                {products.filter(p => p.checked).length === 0 && products.length > 0 && (
                  <p className="selection-hint">Selecione pelo menos um produto para comprar</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Carrinho() {
  return (
    <ThemeProvider>
      <CarrinhoContent />
    </ThemeProvider>
  );
}

export default Carrinho;