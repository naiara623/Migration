import React from 'react';
import { FaShoppingCart } from "react-icons/fa";
import './NovoProduct.css';

function NovoProduct({ products, isSelectionMode, selectedProducts, toggleProductSelection }) {

  const renderRating = (product) => {
    if (!product.avaliacao_produto) {
      return <div style={{ height: '16px' }}></div>;
    }
    return (
      <div className="product-rating">
        ⭐ {product.avaliacao_produto}/5
      </div>
    );
  };

  // ✅ ATUALIZADO: Função para adicionar ao carrinho
  const handleAddToCart = async (product) => {
    try {
      const response = await fetch('http://localhost:3001/api/carrinho', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_produto: product.id_produto,
          quantidade: 1,
          tamanho: '',
          cor: ''
        }),
        credentials: 'include'
      });

      if (response.ok) {
        alert('Produto adicionado ao carrinho!');
      } else {
        const errorData = await response.json();
        alert('Erro ao adicionar ao carrinho: ' + (errorData.erro || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar ao carrinho:', error);
      alert('Erro ao adicionar produto ao carrinho');
    }
  };

  return (
    <div className="products-grid">
      {products.map((product, index) => (
        <div key={product.id_produto ?? `fallback-${index}`} className="product-card1">
          {isSelectionMode && (
            <div className="selection-checkbox">
              <input
                type="checkbox"
                checked={selectedProducts.has(product.id_produto) || selectedProducts.has(product.id)}
                onChange={() => toggleProductSelection(product.id_produto || product.id)}
              />
            </div>
          )}
          
          <div className="product-image">
            {product.imagem_url ? (
              <img 
                src={`http://localhost:3001${product.imagem_url}`} 
                alt={product.nome_produto} 
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div className="placeholder-image" style={{ display: product.imagem_url ? 'none' : 'flex' }}>
              📷
            </div>
          </div>
          
          <div className="product-info">
            <h3 className="product-name">{product.nome_produto}</h3>
            
            {renderRating(product)}
            
            <span className="product-price">
              R$ {parseFloat(product.valor_produto).toFixed(2)}
            </span>
            
            <div className="product-category">
              {product.nome_categoria && (
                <span className="category-badge">{product.nome_categoria}</span>
              )}
            </div>
            
            <div className="product-stock">
              {product.estoque > 0 ? (
                <span className="in-stock">Em estoque: {product.estoque}</span>
              ) : (
                <span className="out-of-stock">Fora de estoque</span>
              )}
            </div>
            
            <button 
              className="add-to-cart-btn"
              onClick={() => handleAddToCart(product)}
              disabled={product.estoque <= 0}
            >
              <FaShoppingCart /> {product.estoque > 0 ? 'Carrinho' : 'Indisponível'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NovoProduct;