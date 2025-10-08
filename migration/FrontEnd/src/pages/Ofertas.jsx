import React, { useState, useEffect } from 'react';
import './Ofertas.css';
import Header from '../components/Header';
import ModalConfig from '../components/ModalConfig';
import Categorias from '../components/Categorias';
import { ThemeProvider } from '../ThemeContext';
import { ThemeEffect } from '../ThemeEffect';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function OfertasContext() {
  ThemeEffect();
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // Novo estado para produto selecionado
  const [products, setProducts] = useState([]);
  const [openCategoriaModal, setOpenCategoriaModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Pega a categoria da URL
  const queryParams = new URLSearchParams(location.search);
  const categoria = queryParams.get('categoria');

  // Busca produtos ao carregar ou ao mudar categoria
  useEffect(() => {
    if (categoria) {
      const fetchProductsByCategoria = async () => {
        try {
          const response = await axios.get('http://localhost:3001/api/produtos', {
            params: { categoria }
          });
          setProducts(response.data);
        } catch (error) {
          console.error('Erro ao buscar produtos:', error);
          setProducts([]);
        }
      };
      fetchProductsByCategoria();
    } else {
      fetchAllProducts();
    }
  }, [categoria]);

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/produtos');
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao buscar todos os produtos:', error);
      setProducts([]);
    }
  };

  // Botão para resetar filtro e mostrar todos os produtos
  const resetarFiltro = () => {
    navigate('/ofertas');
    fetchAllProducts();
  };

  // Função para abrir o modal com o produto selecionado
  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedProduct(null);
  };

  // Função para adicionar ao carrinho
const handleAddToCart = async (product) => {
  try {
    const response = await fetch('http://localhost:3001/api/carrinho', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        id_produto: product.id_produto,
        quantidade: 1,
        tamanho: product.tamanho || '',
        cor: product.cor || ''
      }),
    });

    if (response.status === 401) {
      alert("Você precisa estar logado para adicionar ao carrinho.");
      return;
    }

    if (response.ok) {
      alert('Produto adicionado ao carrinho!');
      handleCloseModal();
    } else {
      const errorData = await response.json();
      alert(errorData.erro || 'Erro ao adicionar ao carrinho');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao adicionar ao carrinho');
  }
};


  // Controle do modal de categorias
  const [modalAberto, setModalAberto] = useState(false);

  const categoriasValidas = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleCategoriaSelecionada = async (id_categoria, nome_categoria) => {
    if (!categoriasValidas.includes(id_categoria)) {
      console.warn("Categoria inválida:", id_categoria);
      return;
    }

    try {
      const response = await axios.get('http://localhost:3001/api/produtos', {
        params: { categoria: nome_categoria }
      });
      setProducts(response.data);
      setModalAberto(false);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setProducts([]);
    }
  };

  return (
    <div className='amarela-Ofertas'>
      <div className='Navbar-global'>
        <Header />
      </div>

      <div className='DivGlobal-Ofertas'>
        <button onClick={() => setModalAberto(true)}>Abrir Categorias</button>
        <button onClick={resetarFiltro}>Mostrar Todos os Produtos</button>

        <Categorias 
          isOpen={modalAberto} 
          onClose={() => setModalAberto(false)} 
          onCategoriaSelecionada={handleCategoriaSelecionada}
        />

        <div className="produtos1-Ofertas">
          <section className="featured-products">
            <div className="container2">
              <h2 className='oiTest'>
                {categoria ? `Promoções em ${categoria}` : 'Promoções do Dia'}
              </h2>
              <div className="products-grid">
                {products.length === 0 ? (
                  <p>Nenhum produto encontrado para esta categoria.</p>
                ) : (
                  products.map(product => (
                    <div key={product.id_produto} className="product-card">
                      <div className="product-image">
                        <img 
                          src={product.imagem_url ? `http://localhost:3001${product.imagem_url}` : 'placeholder-image.jpg'} 
                          alt={product.nome_produto} 
                        />
                        <div className="product-badge">Oferta</div>
                      </div>
                      <div className="product-info">
                        <h3>{product.nome_produto}</h3>
                        <div className="product-rating">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fas fa-star ${i < (product.avaliacao_produto || 3) ? 'filled' : ''}`}></i>
                          ))}
                        </div>
                        <div className="product-price">R$ {parseFloat(product.valor_produto).toFixed(2)}</div>
                        <button 
                          onClick={() => handleOpenModal(product)} 
                          className="btn btn-primary"
                        >
                          Adicionar ao Carrinho
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modal com produto selecionado */}
      <ModalConfig
        isOpen={openModal}
        onClose={handleCloseModal}
        product={selectedProduct}
        onAddCarrinho={handleAddToCart}
      />
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