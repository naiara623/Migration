import React from 'react';
import './ProductCategories.css';
import { useTranslation } from 'react-i18next';
import "../i18n"

const categories = [
  { id: 1, name: 'Moda de Viagem', image: 'https://media.istockphoto.com/id/1499540657/pt/foto/blue-suitcase.jpg?s=612x612&w=0&k=20&c=QCz1q6bJwu1MgPsRwDiHpD40gnt7gYW5mNjEoNkXlXQ=' },
  { id: 2, name: 'Lembrancas', image: 'https://i.pinimg.com/474x/89/6a/b6/896ab6aafcf72358c83feffa375d7481.jpg' },
  { id: 3, name: 'Trilhas', image: 'https://trilhaserumos.com.br/wp-content/uploads/2014/11/Commuter-35-frente-1200x1200-768x768.jpg' },
  { id: 4, name: 'Tecnologia de viagem', image: 'https://zyrontech.com.au/cdn/shop/files/powaflex-20000mah-power-bank-941913.jpg?v=1726767719' },
];

const ProductCategories = () => {
  const { t } = useTranslation();
  return (
    <section className="product-categories">
      <div className="container">
        <h2 className="section-title">{t("productcategories.produtos.nossas")}</h2>
        <div className="categories-grid">
          {categories.map(category => (
            <div key={category.id} className="category-card">
              <img src={category.image} alt={category.name} />
              <div className="category-overlay">
                <h3>{category.name}</h3>
                <button className="btn btn-primary">{t("productcategories.produtos.vermai")}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;