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

function CarrinhoContent() {
  ThemeEffect();

  const [products, setProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  // Cupom
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Buscar produtos do localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setProducts(savedCart);
  }, []);

  // Selecionar todos
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    const updated = products.map(p => ({ ...p, checked: newSelectAll }));
    setProducts(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // Selecionar individual
  const handleProductSelect = (id) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, checked: !p.checked } : p
    );
    setProducts(updated);
    setSelectAll(updated.every(p => p.checked));
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // Remover produto
  const handleRemoveProduct = (id) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // Calcular valores
  const subtotal = products
    .filter(p => p.checked)
    .reduce((acc, p) => acc + p.price, 0);

  const desconto = appliedCoupon ? subtotal * appliedCoupon.discount : 0;
  const total = subtotal - desconto;

  // Função aplicar cupom
  const handleApplyCoupon = () => {
    if (couponInput.toLowerCase() === "desconto15") {
      setAppliedCoupon({ code: "DESCONTO15", discount: 0.15 });
    } else if (couponInput.toLowerCase() === "migration20") {
      setAppliedCoupon({ code: "MIGRATION20", discount: 0.20 });
    } else {
      alert("Cupom inválido!");
    }
  };

  // Função remover cupom
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
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
      <CarrinhoContent/>
    </ThemeProvider>
  );
}

export default Carrinho;
