import React, { useState, useEffect } from 'react';
import './ProdutosAlta.css'
import Header from '../components/Header';
import ModalConfig from '../components/ModalConfig';
import Categorias from '../components/Categorias';
import { ThemeProvider } from '../ThemeContext';
import { ThemeEffect } from '../ThemeEffect';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "../i18n"
import axios from 'axios';

function ProdutosAlta() {
   ThemeEffect();
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const {t} = useTranslation();

  // Pega parâmetros da URL
  const queryParams = new URLSearchParams(location.search);
  const categoria = queryParams.get('categoria');
  const termoBusca = queryParams.get('search');

  // ✅ Busca produtos públicos
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

  // ✅ Busca produtos por categoria pública
  const fetchProductsByCategoria = async (nome_categoria) => {
    setLoading(true);
    setError('');
    try {
      console.log(`🌐 Buscando produtos da categoria: ${nome_categoria}`);
      const response = await axios.get(`http://localhost:3001/api/produtos/public/categoria/${nome_categoria}`);
      console.log(`✅ ${response.data.length} produtos encontrados na categoria ${nome_categoria}`);
      setProducts(response.data);
    } catch (error) {
      console.error(`❌ Erro ao buscar produtos da categoria ${nome_categoria}:`, error);
      setError(`Erro ao carregar produtos da categoria ${nome_categoria}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Busca produtos por nome ou descrição
  const fetchProductsBySearch = async (termo) => {
    setLoading(true);
    setError('');
    try {
      console.log(`🔍 Buscando produtos com termo: "${termo}"`);
      const response = await axios.get(`http://localhost:3001/api/produtos/public/search?q=${encodeURIComponent(termo)}`);
      console.log(`✅ ${response.data.length} resultados encontrados para "${termo}"`);
      setProducts(response.data);
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      setError('Erro ao buscar produtos.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Busca produtos ao carregar ou ao mudar categoria / termo
  useEffect(() => {
    if (termoBusca) {
      fetchProductsBySearch(termoBusca);
    } else if (categoria) {
      fetchProductsByCategoria(categoria);
    } else {
      fetchAllProducts();
    }
  }, [categoria, termoBusca]);

  // Botão para resetar filtro e mostrar todos os produtos
  const resetarFiltro = () => {
    navigate('/produtos');
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

  // ✅ Função para adicionar ao carrinho com verificação de login
  const handleAddToCart = async (product) => {
    try {
      const sessionResponse = await fetch('http://localhost:3001/api/check-session', {
        credentials: 'include'
      });
      
      const sessionData = await sessionResponse.json();
      
      if (!sessionData.autenticado) {
        alert("Você precisa estar logado para adicionar ao carrinho.");
        return;
      }

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

  const handleCategoriaSelecionada = async (id_categoria, nome_categoria) => {
    if (!categoriasValidas.includes(id_categoria)) {
      console.warn("Categoria inválida:", id_categoria);
      return;
    }

    navigate(`/produtos?categoria=${encodeURIComponent(nome_categoria)}`);
    setModalAberto(false);
  };

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
    <div className='DivTudo'>
        <div className="NavBar">
            <Header />
        </div>

        <div className="produtos">
            <div className="butons"> 
          <button className='ButtonCate' onClick={() => setModalAberto(true)} >
             {t('produto.categoria.buton')}
          </button>

          <button className='ButtonFiltro' onClick={resetarFiltro} >
          {t('produto.mostrar.buton')}
          </button>

           <Categorias 
          isOpen={modalAberto} 
          onClose={() => setModalAberto(false)} 
          onCategoriaSelecionada={handleCategoriaSelecionada}
          fetchCategorias={fetchCategorias}
        />
            </div>

            <div className="titulo-alta">
           {!error && (
    <h2 className='ProdutosEmAlta'>
      {categoria 
        ? `Produtos em ${categoria}` 
        : termoBusca
          ? `Resultados para "${termoBusca}"`
          : 'Produtos em alta'
      }
    </h2>
  )}

  {error && (
    <div className="error-message">
      <p>❌ {error}</p>
    </div>
  )}

  {loading && (
    <div className="loading-message">
      <p>🔄 Carregando produtos...</p>
    </div>
  )}

            </div>

            <div className="ProdutosemAlta">

              <section className='Section1-produtos'>
                <div className="slavei">
                {/* {!loading && products.length === 0 && !error && (
                 
                  )} */}

                  <div className="products-grid">
                {products.length === 0 && !loading ? (
                   <div className="escritas-produto">
                    <div className="empty-products">
                  <p>Nenhum produto encontrado</p>
                  <button className="retry-btn">
                    🔄 Tentar Novamente
                  </button>
                </div>
                  </div>
                ) : (
                  products.map(product => (
                    <div key={product.id_produto} className="card-produto">
                      <div className="product-image">
                        <img 
                          src={product.imagem_url 
                            ? `http://localhost:3001${product.imagem_url}` 
                            : '/placeholder-image.jpg'
                          } 
                          alt={product.nome_produto}
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                        <div className="product-badge">Produto</div>
                        {product.estoque <= 0 && (
                          <div className="out-of-stock-badge">Esgotado</div>
                        )}
                      </div>
       
                      <div className="info-produtos">

                         <div className="nome-categoria">
                          <div className='nome-div'>
                            <h3 className='nome_produto1'>{product.nome_produto}</h3>
                          </div>

                          <div className="categoria-produto">
                            <span className="category-tag1">{product.nome_categoria}</span>
                          </div>
        </div>

         <div className="avaliação-produto">
                          {[...Array(5)].map((_, i) => (
                            <i 
                              key={i} 
                              className={`fas fa-star ${i < (product.avaliacao_produto || 3) ? 'filled' : ''}`}
                            ></i>
                          ))}
                          <span className="rating-text">
                            ({product.avaliacao_produto || 'Sem avaliação'})
                          </span>
                        </div>
                        
                        
                       
                      <div className="estoque-preco">
                         <div className="product-stock">
                          {product.estoque > 0 
                            ? `🟢 ${product.estoque} em estoque` 
                            : '🔴 Esgotado'
                          }
                        </div>
                        <div className="produto-valor">
                          R$ {parseFloat(product.valor_produto).toFixed(2)}
                        </div>
                      </div>
                       
                      
                      <div className="button-carinho">
                        <button 
                          onClick={() => handleOpenModal(product)} 
                          className="button-adicionar-carrinho"
                          disabled={product.estoque <= 0}
                        >
                          {product.estoque > 0 ? '🛒 Adicionar ao Carrinho' : 'Esgotado'}
                        </button>
                      </div>
                        
                      </div>
                    </div>
                  ))
                )}
              </div>
                </div>



              </section>
            </div>
        </div>
         <ModalConfig
                isOpen={openModal}
                onClose={handleCloseModal}
                product={selectedProduct}
                onAddCarrinho={handleAddToCart}
              />
    </div>
  )
}

export default ProdutosAlta