import React, { useState } from 'react';
import { ThemeProvider } from '../ThemeContext';
import { ThemeEffect } from '../ThemeEffect';
import Header from '../components/Header';
import './Carrinho.css';

// Componente de Checkbox Customizado para Selecionar Todos
const CustomCheckbox = ({ id, label, checked, onChange }) => {
  return (
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
};

// Componente de Checkbox para Pagamento Pix (área toda clicável)
const PaymentCheckbox = ({ id, label, checked, onChange }) => {
  return (
    <div className="content-pix" onClick={() => onChange(!checked)}>
      <label className="checkBox-pix-new">
        <input 
          type="checkbox" 
          id={id}
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
          <p className="desc-pix">Pagamento instantâneo</p>
        </span>
      </div>
    </div>
  );
};

// Componente de Checkbox para Produtos (mesmo estilo do "Selecionar todos")
const ProductCheckbox = ({ id, checked, onChange }) => {
  return (
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
};

function CarrinhoContent() {
  ThemeEffect();
  
  // Estado para controlar os checkboxes
  const [selectAll, setSelectAll] = useState(false);
  const [products, setProducts] = useState([
    { id: "product1", checked: false },
    { id: "product2", checked: false }
  ]);
  const [pixSelected, setPixSelected] = useState(false);

  // Função para lidar com a seleção de todos os produtos
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    // Atualiza todos os produtos
    setProducts(products.map(product => ({
      ...product,
      checked: newSelectAll
    })));
  };

  // Função para lidar com a seleção individual de produtos
  const handleProductSelect = (productId) => {
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, checked: !product.checked } 
        : product
    );
    
    setProducts(updatedProducts);
    
    // Verifica se todos os produtos estão selecionados
    const allChecked = updatedProducts.every(product => product.checked);
    setSelectAll(allChecked);
  };

  return (
    <div className='contener-Carrinho'>
      <div className='contener-carrinho'>
        <div className='contener-navbar'>
          <Header/>
        </div>
        <div className='contener-contener-Carrinho'>
          {/* Seção de itens do carrinho */}
          <div className='carrinho-mostrar-itens'>
            <div className='carrinho-pedidos'>
              <div className="select-all">
                <CustomCheckbox 
                  id="selectAll" 
                  label={`Selecionar todos os itens (${products.length})`}
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </div>
              
              <div className="item-card">
                <div className="item-header">
                  <ProductCheckbox 
                    id="product1" 
                    checked={products[0].checked}
                    onChange={() => handleProductSelect("product1")}
                  />
                </div>
                <div className="item-info">
                  <h3>Maleta de Viagem, Bolsa para Armazenamento de Roupas, mala dobrável</h3>
                  <div className="item-details">
                    <span>80L</span>
                    <span className="item-price">R$ 119,99</span>
                  </div>
                </div>
              </div>
              
              <div className="item-card">
                <div className="item-header">
                  <ProductCheckbox 
                    id="product2" 
                    checked={products[1].checked}
                    onChange={() => handleProductSelect("product2")}
                  />
                </div>
                <div className="item-info">
                  <h3>Outro Produto</h3>
                  <div className="item-details">
                    <span>Tamanho Único</span>
                    <span className="item-price">R$ 247,51</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Seção de pagamento */}
          <div className='carrinho-pagar-o-itens'>
            <div className='carrinho-pagamento'>
              <div className="payment-container">
                <h1 className="payment-title">Produtos selecionados</h1>
                <hr className="payment-divider" />
                
                <div className="price-section">
                  <div className="price-row">
                    <span className="price-label">Preço sem desconto</span>
                    <span className="price-value bold">R$ 367,50</span>
                  </div>
                  
                  <div className="price-row">
                    <span className="price-label small">Cupom</span>
                    <span className="price-value small">R$ -60,86</span>
                  </div>
                  
                  <hr className="payment-divider" />
                  
                  <div className="price-row">
                    <span className="price-label">Preço total</span>
                    <span className="price-value bold">R$306,64</span>
                  </div>
                </div>
                
                <hr className="payment-divider" />
                
                <div className="payment-method">
                  <h3>Forma de pagamento</h3>
                  <PaymentCheckbox 
                    id="pixPayment" 
                    label="Pix"
                    checked={pixSelected}
                    onChange={setPixSelected}
                  />
                </div>
                
                <button className="buy-button">Comprar agora</button>
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