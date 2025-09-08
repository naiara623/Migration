import React from 'react';
import './Hero.css';
import { useNavigate } from 'react-router-dom';

const Hero = () => {

  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h2>Prepare-se para sua próxima aventura</h2>
          <p>Os melhores equipamentos e acessórios para suas viagens</p>
          <button onClick={() => navigate('/cadastro')} className="btn btn-primary">Explorar Produtos</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;