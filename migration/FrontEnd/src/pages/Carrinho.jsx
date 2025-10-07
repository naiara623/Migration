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
  
  const subtotal = products.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Calcular desconto
  const desconto = appliedCoupon 
    ? subtotal * (appliedCoupon.discountPercent / 100)
    : 0;
  
  // Calcular total
  const total = subtotal - desconto;

  // Buscar produtos do carrinho do banco
  useEffect(() => {
    fetchCarrinho();
  }, []);

  const fetchCarrinho = async () => {
    try {
      const response = await fetch('/api/carrinho', {
        credentials: 'include'
      });
      if (response.ok) {
        const carrinhoItens = await response.json();
        const formattedProducts = carrinhoItens.map(item => ({
          id: item.id_carrinho,
          productId: item.id_produto,
          name: item.nome_produto,
          price: parseFloat(item.valor_produto),
          quantity: item.quantidade,
          size: item.tamanho || '',
          color: item.cor || '',
          image: item.imagem_url,
          checked: false
        }));
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
    }
  };

  // Atualizar quantidade no carrinho
  const updateQuantity = async (id, newQuantity) => {
    try {
      const response = await fetch(`/api/carrinho/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantidade: newQuantity }),
        credentials: 'include'
      });

      if (response.ok) {
        fetchCarrinho(); // Recarrega o carrinho
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    }
  };

  // Remover produto do carrinho
  const handleRemoveProduct = async (id) => {
    try {
      const response = await fetch(`/api/carrinho/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Erro ao remover produto:', error);
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

  // Finalizar compra
  const handleFinalizarCompra = async () => {
    const selectedProducts = products.filter(p => p.checked);
    
    if (selectedProducts.length === 0 || !paymentMethod) {
      alert('Selecione produtos e forma de pagamento');
      return;
    }

    try {
      const pedidoData = {
        itens: selectedProducts.map(p => ({
          id_produto: p.productId,
          quantidade: p.quantity,
          preco_unitario: p.price,
          tamanho: p.size,
          cor: p.color
        })),
        total: total,
        metodo_pagamento: paymentMethod,
        endereco_entrega: "Endereço do usuário" // Você pode pegar do perfil do usuário
      };

      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedidoData),
        credentials: 'include'
      });

      if (response.ok) {
        alert('Pedido realizado com sucesso!');
        fetchCarrinho(); // Recarrega o carrinho vazio
      } else {
        alert('Erro ao realizar pedido');
      }
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      alert('Erro ao finalizar compra');
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
      const cupomValido = "DESCONTO10";

      if (couponInput.toUpperCase() === cupomValido) {
        setAppliedCoupon({ code: cupomValido, discountPercent: 10 });
      } else {
        alert("Cupom inválido");
      }
    } catch (error) {
      console.error("Erro ao aplicar cupom:", error);
      alert("Erro ao aplicar cupom");
    }
  };

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
                <div className="select-all">
                  <CustomCheckbox 
                    id="selectAll" 
                    label={`Selecionar todos os itens (${products.length})`}
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </div>
              )}
              
              {products.length === 0 && (
                <p className="empty-cart">Seu carrinho está vazio 🛒</p>
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
                      <span>{p.size}</span>
                      <span className="item-price">R$ {p.price.toFixed(2)}</span>
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
                    <span className="price-label">Subtotal</span>
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
                      <span className="price-value small">- R$ {desconto.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <hr className="payment-divider" />
                  
                  <div className="price-row">
                    <span className="price-label">Total</span>
                    <span className="price-value bold">R$ {total.toFixed(2)}</span>
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
                  Comprar agora
                </button>
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