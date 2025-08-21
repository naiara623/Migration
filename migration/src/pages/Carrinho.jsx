import React from 'react';
import { ThemeProvider } from '../ThemeContext';
import { ThemeEffect } from '../ThemeEffect';
import Header from '../components/Header';
import './Carrinho.css';

function CarrinhoContent() {
  ThemeEffect();
  
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
                <input type="checkbox" id="selectAll" />
                <label htmlFor="selectAll">Selecionar todos os itens (2)</label>
              </div>
              
              <div className="item-card">
                <div className="item-info">
                  <h3>Maleta de Viagem, Bolsa para Armazenamento de Roupas, mala dobrável</h3>
                  <div className="item-details">
                    <span>80L</span>
                    <span className="item-price">R$ 119,99</span>
                  </div>
                </div>
              </div>
              
              <div className="item-card">
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
                  <label className="payment-option">
                    <input type="checkbox" className="payment-checkbox" />
                    Pix
                  </label>
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