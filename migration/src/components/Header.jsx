// Header.js
import React, { useState } from 'react';
import './Header.css';
import { useTheme } from '../ThemeContext';
import { Link } from 'react-router-dom';
import Categorias from "./Categorias";



const Header = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const { darkMode, toggleTheme } = useTheme();
   const [openCategorias, setOpenCategorias] = useState(false);

  const toggleSearch = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setSearchValue('');
    }
  };

  const SearchIcon = () => (
    <svg viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"></path>
    </svg>
  );

  return (
    <header className="header" data-theme={darkMode ? "dark" : "light"}>
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1 className='migrati'>Migrati</h1><h1 className='on'>On</h1>
          </div>
          <nav className="nav">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/produtos">Produtos</Link></li>
              <li><Link  onClick={() => setOpenCategorias(true)}>Categorias</Link></li>
              <li><Link to="/ofertas">Ofertas</Link></li>
              <li><Link>Contato</Link></li>
                <li><Link to="/loja">MinhaLoja</Link></li>
            </ul>

             {/* Modal de Categorias */}
      <Categorias 
        isOpen={openCategorias} 
        onClose={() => setOpenCategorias(false)} 
      />
          </nav>
          <div className="header-actions">
            <label className="switch">
              <span className="sun">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g fill="#ffd43b">
                    <circle r="5" cy="12" cx="12"></circle>
                    <path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z"></path>
                  </g>
                </svg>
              </span>
              <span className="moon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                  <path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path>
                </svg>
              </span>   
              <input 
                type="checkbox" 
                className="input" 
                checked={darkMode}
                onChange={toggleTheme}
              />
              <span className="slider"></span>
            </label>
            
            <div className="search-container">
              <input 
                checked={isCollapsed}
                onChange={toggleSearch}
                className="search-checkbox" 
                type="checkbox" 
              /> 
              <div className={`search-box ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="search-icon-container">
                  <SearchIcon className="search-icon" />
                </div>
                <input 
                  className="search-input" 
                  placeholder="Pesquisar produtos..." 
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </div>
            <button className="cart-btn">
              <i className="fas fa-shopping-cart"></i>
              <span className="cart-count">0</span>
            </button>

            <button className='Perfil-btn'>
              <Link to="/Perfil-usuario" ><img className='perfilUser' src="user.png" alt="Perfil de usuario" /></Link>
              
            </button>


          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;