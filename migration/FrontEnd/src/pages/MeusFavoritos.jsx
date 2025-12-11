import React, { useState, useEffect } from 'react'
import { ThemeEffect } from '../ThemeEffect'
import { ThemeProvider } from '../ThemeContext'
import Header from '../components/Header'
import './MeusFavoritos.css'
import { Link } from 'react-router-dom';
import ConteineFino from '../components/ConteineFino'

function MeusFavoritosContext() {
  ThemeEffect();
  
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavoritos();
  }, []);

  const fetchFavoritos = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/favoritos', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setFavoritos(data);
      } else if (response.status === 401) {
        setError('Faça login para ver seus favoritos');
      } else {
        setError('Erro ao carregar favoritos');
      }
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorito = async (id_produto) => {
    try {
      const response = await fetch(`http://localhost:3001/api/favoritos/${id_produto}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Atualizar lista localmente
        setFavoritos(favoritos.filter(item => item.id_produto !== id_produto));
        alert('Produto removido dos favoritos!');
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      alert('Erro ao remover dos favoritos');
    }
  };

  const handleAddToCart = async (produto) => {
    // Similar à função do ModalConfig
    // Implemente a lógica para adicionar ao carrinho aqui
    alert(`Adicionar ${produto.nome_produto} ao carrinho`);
  };

  return (
    <div className='div-inclobaTudo-MF'>
      <div className='nav-bar-MF'>
        <Header />
      </div>

      <div className='conteine-black-MF'>
        <div className='conteine-fino-MF'>
          <ConteineFino />
        </div>

        <div className='conteine-grosso-MF'>
          <div className='informação-pessoais-MF'>
            <h2>Meus Favoritos</h2>
            {favoritos.length > 0 && (
              <span className="contador-favoritos">
                ({favoritos.length} {favoritos.length === 1 ? 'item' : 'itens'})
              </span>
            )}
          </div>

          <div className='conteine-LINHA2-MF'>
            <div className='div-LINHA2-MF'></div>
          </div>

          <div className="lista-favoritos">
            {loading ? (
              <div className="loading">Carregando favoritos...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : favoritos.length === 0 ? (
              <div className="empty-favorites">
                <p>Você ainda não tem produtos favoritos.</p>
                <Link to="/produtos" className="btn-explorar">
                  Explorar Produtos
                </Link>
              </div>
            ) : (
              <div className="grid-favoritos">
                {favoritos.map((item) => (
                  <div key={item.id_favoritos} className="card-favorito">
                    <img 
                      src={item.imagem_url ? `http://localhost:3001${item.imagem_url}` : "image 99.png"} 
                      alt={item.nome_produto}
                      className="imagem-favorito"
                    />
                    <div className="info-favorito">
                      <h3>{item.nome_produto}</h3>
                      <p className="descricao-favorito">{item.descricao}</p>
                      <p className="preco-favorito">R$ {parseFloat(item.valor_produto).toFixed(2)}</p>
                      
                      <div className="acoes-favorito">
                        <button 
                          onClick={() => handleAddToCart(item)}
                          className="btn-adicionar-carrinho"
                        >
                          🛒 Adicionar ao Carrinho
                        </button>
                        <button 
                          onClick={() => handleRemoveFavorito(item.id_produto)}
                          className="btn-remover-favorito"
                        >
                          ❌ Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MeusFavoritos() {
  return (
    <ThemeProvider>
      <MeusFavoritosContext/>
    </ThemeProvider>
  )
}

export default MeusFavoritos