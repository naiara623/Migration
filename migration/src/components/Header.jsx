import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1 className='migrati'>Migrati</h1><h1 className='on'>On</h1>
          </div>
          <nav className="nav">
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">Produtos</a></li>
              <li><a href="#">Coleções</a></li>
              <li><a href="#">Ofertas</a></li>
              <li><a href="#">Contato</a></li>
            </ul>
          </nav>
          <div className="header-actions">
            <button className="search-btn">
              <i className="fas fa-search"></i>
            </button>
            <button className="cart-btn">
              <i className="fas fa-shopping-cart"></i>
              <span className="cart-count">0</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;