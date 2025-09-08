import React from 'react';
import './ProductCategories.css';

const categories = [
  { id: 1, name: 'Malas e Mochilas', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
  { id: 2, name: 'Roupas', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
  { id: 3, name: 'Acessórios', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
  { id: 4, name: 'Calçados', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
];

const ProductCategories = () => {
  return (
    <section className="product-categories">
      <div className="container">
        <h2 className="section-title">Nossas Categorias</h2>
        <div className="categories-grid">
          {categories.map(category => (
            <div key={category.id} className="category-card">
              <img src={category.image} alt={category.name} />
              <div className="category-overlay">
                <h3>{category.name}</h3>
                <button className="btn btn-primary">Ver Mais</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;