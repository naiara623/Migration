import React from 'react';
import './HelpSection.css';

const HelpSection = () => {
  return (
    <section className="help-section">
      <div className="container">
        <h2 className="section-title">Precisa de ajuda?</h2>
        
        <div className="help-list">
          <div className="help-item">
            <div className="help-content">
              <h3>Atendimento rápido</h3>
              <p>via chat</p>
            </div>
            <button className="action-link">Fazer agora</button>
          </div>
          
          <div className="help-item">
            <div className="help-content">
              <h3>Menos de R$100</h3>
              <p>Confira produtos com preços baixos</p>
            </div>
            <button className="action-link">Mostrar produtos</button>
          </div>
          
          <div className="help-item">
            <div className="help-content">
              <h3>Mais vendidos</h3>
              <p>Encontre as tendências do momento</p>
            </div>
            <button className="action-link">É para mais vendidos</button>
          </div>
          
          <div className="help-item">
            <div className="help-content">
              <h3>Produtos com frete grátis</h3>
              <p>Economize nas compras</p>
            </div>
            <button className="action-link">Nossas categorias</button>
          </div>
        </div>
        
        <div className="recent-searches">
          <h2 className="section-title">Produtos recentemente procurados</h2>
          <div className="search-tags">
            <span className="tag">Máscara de vapor</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HelpSection;