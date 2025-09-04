import React from "react";
import "./NovoProduct.css";

function NovoProduct({ product }) {
  return (
    <div className="products-grid">
  {products.map((product, index) => (
    <div key={index} className="product-card">
      <img src={product.imagePreview} alt={product.name} className="product-image" />

      <h3 className="product-title">{product.name}</h3>

      {/* Estrelas de avaliação */}
      <div className="product-rating">
        {[...Array(5)].map((_, i) => (
          <i
            key={i}
            className={`fas fa-star ${i < product.rating ? 'filled' : ''}`}
          ></i>
        ))}
      </div>

      <p className="product-price">R$ {product.price}</p>

      <button className="add-to-cart">Adicionar ao Carrinho</button>
    </div>
  ))}
</div>

  );
}

export default NovoProduct;