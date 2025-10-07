import React, { useState, useEffect } from 'react';
import './Ofertas.css';
import Header from '../components/Header';
import ModalConfig from '../components/ModalConfig';
import { ThemeProvider } from '../ThemeContext';
import { ThemeEffect } from '../ThemeEffect';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function OfertasContext() {
  ThemeEffect();
const location = useLocation();

const queryParams = new URLSearchParams(location.search);
const categoria = queryParams.get('categoria');

  const [openModal, setOpenModal] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Buscar os produtos da API
    const fetchProducts = async () => {
      try {
     const response = await axios.get('http://localhost:3001/api/produtos', {
  params: { categoria }
});

        setProducts(response.data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className='amarela-Ofertas'>
      <div className='Navbar-global'>
        <Header />
      </div>

      <div className='DivGlobal-Ofertas'>
        <div className="produtos1-Ofertas">
          <section className="featured-products">
            <div className="container2">
              <h2 className='oiTest'>Promoções do Dia</h2>
              <div className="products-grid">
                {products.map(product => (
                  <div key={product.id_produto} className="product-card">
                    <div className="product-image">
                      <img src={`http://localhost:3001${product.image_url}`} alt={product.nome_produto} />
                      <div className="product-badge">Oferta</div>
                    </div>
                    <div className="product-info">
                      <h3>{product.nome_produto}</h3>
                      <div className="product-rating">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`fas fa-star ${i < 3 ? 'filled' : ''}`}></i>
                        ))}
                      </div>
                      <div className="product-price">R$ {parseFloat(product.valor_produto).toFixed(2)}</div>
                      <button onClick={() => setOpenModal(true)} className="btn btn-primary">
                        Adicionar ao Carrinho
                      </button>
                    </div>
                  </div>
                ))}

                <ModalConfig
                  isOpen={openModal}
                  onClose={() => setOpenModal(false)}
                  onAddCarrinho={(config) => console.log("Config recebida:", config)}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Ofertas() {
  return (
    <ThemeProvider>
      <OfertasContext />
    </ThemeProvider>
  );
}

export default Ofertas;
