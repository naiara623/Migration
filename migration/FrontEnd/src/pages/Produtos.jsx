import React, { useState, useEffect } from 'react';
import './Produtos.css';
import Header from '../components/Header';
import ModalConfig from '../components/ModalConfig';
import Categorias from '../components/Categorias';  // Importe o modal Categorias
import { ThemeProvider } from '../ThemeContext';
import { ThemeEffect } from '../ThemeEffect';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function ProdutosContext() {
  ThemeEffect();
  const [openModal, setOpenModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [openCategoriaModal, setOpenCategoriaModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Pega a categoria da URL
  const queryParams = new URLSearchParams(location.search);
  const categoria = queryParams.get('categoria');

useEffect(() => {
  console.log('Buscando produtos para categoria:', categoria);
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
}, [categoria]);




// No componente pai (Header, Home, etc.)
const [modalAberto, setModalAberto] = useState(false);

const categoriasValidas = [1, 2, 3, 4, 5, 6, 7, 8];

const handleCategoriaSelecionada = async (id_categoria, nome_categoria) => {
  if (!categoriasValidas.includes(id_categoria)) {
    console.warn("Categoria inválida:", id_categoria);
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/api/produtos/categoria/id/${id_categoria}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

    const produtos = await response.json();
    setProducts(produtos);
    setModalAberto(false);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
  }
};

  return (
    <div className='amarela-Ofertas'>
      <div className='Navbar-global'>
        <Header />
      </div>
      <div className='DivGlobal-Ofertas'>

<button onClick={() => setModalAberto(true)}>Abrir Categorias</button>

<Categorias 
  isOpen={modalAberto} 
  onClose={() => setModalAberto(false)} 
  onCategoriaSelecionada={handleCategoriaSelecionada}
/>

        <div className="produtos1-Ofertas">
          <section className="featured-products">
            <div className="container2">
              <h2 className='oiTest'>
                {categoria ? `Produtos em ${categoria}` : 'Produtos em alta'}
              </h2>
              <div className="products-grid">
                {products.length === 0 && (
                  <p>Nenhum produto encontrado para esta categoria.</p>
                )}
                {products.map(product => (
                  <div key={product.id_produto} className="product-card">
                    <div className="product-image">
                      <img src={`http://localhost:3001${product.image_url}`} alt={product.nome_produto} />
                      <div className="product-badge">Novo</div>
                    </div>
                    <div className="product-info">
                      <h3>{product.nome_produto}</h3>
                      <div className="product-rating">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`fas fa-star ${i < 3 ? 'filled' : ''}`}></i>
                        ))}
                      </div>
                      <div className="product-price">R$ {parseFloat(product.valor_produto).toFixed(2)}</div>
                      <button onClick={() => setOpenModal(true)} className="btn btn-primary">Adicionar ao Carrinho</button>
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

      {/* Modal de categorias */}
      <Categorias
        isOpen={openCategoriaModal}
        onClose={() => setOpenCategoriaModal(false)}
        onCategoriaSelecionada={handleCategoriaSelecionada}
      />
    </div>
  );
}


function Produtos() {
  return (
    <ThemeProvider>
      <ProdutosContext />
    </ThemeProvider>
  );
}

export default Produtos;
