import React from 'react'
import "./Featured.css"
import { useTranslation } from 'react-i18next';
import "../i18n";

const products = [
  { id: 1, name: 'Mochila Viagem Pro', price: 299.90, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', rating: 5 },
  { id: 2, name: 'Jaqueta Impermeável', price: 199.90, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', rating: 4 },
  { id: 3, name: 'Mala de Viagem 20"', price: 499.90, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', rating: 5 },
  { id: 4, name: 'Tênis Caminhada', price: 249.90, image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', rating: 4 },
];

function Featured() {

      const { t } = useTranslation();

  return (
    <div className='Vermelho-Produtcs'>
      <div className="test-produtis">
          <h2 className="Textc">{t("featuredproduct.produto.title")}</h2>
      </div>

      <div className="produtos-featured">
         {products.map(product => (
                <div key={product.id} className="product-cardmun">
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                      <div className="product-badge">{t("featuredproduct.produto.novo")}</div>
                    </div>
                  <div className="product-info1">
                    <h3 className='name-product'>{product.name}</h3>
                    <div className="product-rating">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`fas fa-star ${i < product.rating ? 'filled' : ''}`}></i>
                      ))}
                    </div>
                    <div className="product-price">R$ {product.price.toFixed(2)}</div>
                    <button className="button-carrinho">{t("featuredproduct.produto.button")}</button>
                  </div>
                </div>
              ))}
      </div>
    </div>
  )
}

export default Featured