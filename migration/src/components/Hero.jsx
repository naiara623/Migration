import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h2>Prepare-se para sua próxima aventura</h2>
          <p>Os melhores equipamentos e acessórios para suas viagens</p>
          <button className="btn btn-primary">Explorar Produtos</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;