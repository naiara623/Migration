import React, { useState, useEffect } from 'react';
import './Ofertas.css';
import Header from '../components/Header';
import ModalConfig from '../components/ModalConfig';
import Categorias from '../components/Categorias';
import { ThemeProvider } from '../ThemeContext';
import { ThemeEffect } from '../ThemeEffect';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "../i18n"

function OfertasContext() {
  ThemeEffect();
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [openCategoriaModal, setOpenCategoriaModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const {t} = useTranslation();

  // Pega a categoria da URL
  const queryParams = new URLSearchParams(location.search);
  const categoria = queryParams.get('categoria');

  // ✅ ATUALIZADO: Busca produtos públicos
  const fetchAllProducts = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🌐 Buscando todos os produtos públicos...');
      const response = await axios.get('http://localhost:3001/api/produtos/public');
      console.log('✅ Produtos carregados:', response.data.length);
      setProducts(response.data);
    } catch (error) {
      console.error('❌ Erro ao buscar todos os produtos:', error);
      setError('Erro ao carregar produtos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ATUALIZADO: Busca produtos por categoria pública
  const fetchProductsByCategoria = async (categoriaNome) => {
    setLoading(true);
    setError('');
    try {
      console.log(`🌐 Buscando produtos da categoria: ${categoriaNome}`);
      const response = await axios.get(`http://localhost:3001/api/produtos/public/categoria/${categoriaNome}`);
      console.log(`✅ ${response.data.length} produtos encontrados na categoria ${categoriaNome}`);
      setProducts(response.data);
    } catch (error) {
      console.error(`❌ Erro ao buscar produtos da categoria ${categoriaNome}:`, error);
      setError(`Erro ao carregar produtos da categoria ${categoriaNome}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Busca produtos ao carregar ou ao mudar categoria
  useEffect(() => {
    if (categoria) {
      fetchProductsByCategoria(categoria);
    } else {
      fetchAllProducts();
    }
  }, [categoria]);

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

  // ✅ ATUALIZADO: Função para adicionar ao carrinho com verificação de login
  const handleAddToCart = async (product) => {
    try {
      // Primeiro verifica se o usuário está logado
      const sessionResponse = await fetch('http://localhost:3001/api/check-session', {
        credentials: 'include'
      });
      
      const sessionData = await sessionResponse.json();
      
      if (!sessionData.autenticado) {
        alert("Você precisa estar logado para adicionar ao carrinho.");
        // Opcional: redirecionar para login
        // navigate('/login');
        return;
      }

      // Se estiver logado, adiciona ao carrinho
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

      if (response.ok) {
        alert('✅ Produto adicionado ao carrinho!');
        handleCloseModal();
      } else {
        const errorData = await response.json();
        alert('❌ ' + (errorData.erro || 'Erro ao adicionar ao carrinho'));
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar ao carrinho:', error);
      alert('❌ Erro ao adicionar produto ao carrinho');
    }
  };

  // Controle do modal de categorias
  const [modalAberto, setModalAberto] = useState(false);

  const categoriasValidas = [1, 2, 3, 4, 5, 6, 7, 8];

  // ✅ ATUALIZADO: Handler para categoria selecionada
  const handleCategoriaSelecionada = async (id_categoria, nome_categoria) => {
    if (!categoriasValidas.includes(id_categoria)) {
      console.warn("Categoria inválida:", id_categoria);
      return;
    }

    // Navega para a URL com a categoria
    navigate(`/ofertas?categoria=${encodeURIComponent(nome_categoria)}`);
    setModalAberto(false);
  };

  // ✅ NOVO: Função para buscar categorias
  const fetchCategorias = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/categorias/public');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar categorias:', error);
      return [];
    }
  };

  return (
    <div className='amarela-Ofertas'>
      <div className='Navbar-global'>
        <Header />
      </div>

      <div className='DivGlobal-Ofertas'>


       <div className="buttons">
          <button className='btn1 btn-primary1' onClick={() => setModalAberto(true)}>{t('produto.categoria.buton')}</button>
        <button className='btn2 btn-primary2' onClick={resetarFiltro}>{t('produto.mostrar.buton')}</button>
        </div>
        <button onClick={() => setModalAberto(true)}>Abrir Categorias</button>
        <button onClick={resetarFiltro}>Mostrar Todos os Produtos</button>

        <Categorias 
          isOpen={modalAberto} 
          onClose={() => setModalAberto(false)} 
          onCategoriaSelecionada={handleCategoriaSelecionada}
          fetchCategorias={fetchCategorias}
        />

        {/* Mensagens de status */}
        {loading && (
          <div className="loading-message">
            <p>🔄 Carregando produtos...</p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
          </div>
        )}

        <div className="produtos1-Ofertas">
          <section className="featured-products">
            <div className="container2">
              <h2 className='oiTest'>
                {categoria ? `Promoções em ${categoria}` : 'Promoções do Dia'}
              </h2>
              
              {!loading && products.length === 0 && !error && (
                <div className="empty-products">
                  <p>📭 Nenhum produto encontrado</p>
                  <button onClick={fetchAllProducts} className="retry-btn">
                    🔄 Tentar Novamente
                  </button>
                </div>
              )}

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