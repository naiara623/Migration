// NovoProduct.jsx
import React from 'react';
import { FaShoppingCart } from "react-icons/fa";
import './NovoProduct.css';

function NovoProduct({ products, isSelectionMode, selectedProducts, toggleProductSelection }) {
  
  // Se não tiver avaliação no banco, deixar espaço vazio
  const renderRating = (product) => {
    // Se não tiver avaliação, retorna espaço vazio
    if (!product.avaliacao_produto) {
      return <div style={{ height: '16px' }}></div>;
    }
    
    // Se tiver avaliação, mostra as estrelas (opcional)
    return (
      <div className="product-rating">
        ⭐ {product.avaliacao_produto}/5
      </div>
    );
  };

  return (
    <div className="products-grid">
      {products.map((product) => (
        <div key={product.id_produto ?? `fallback-${index}`} className="product-card">
          {isSelectionMode && (
            <div className="selection-checkbox">
              <input
                type="checkbox"
                checked={selectedProducts.has(product.id_produto)}
                onChange={() => toggleProductSelection(product.id_produto)}
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
                  e.target.nextSibling.style.display = 'flex';
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
            
            <button className="add-to-cart-btn">
              <FaShoppingCart /> Carrinho
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NovoProduct;