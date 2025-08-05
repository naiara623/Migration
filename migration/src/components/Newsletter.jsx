import React from 'react';
import './Newsletter.css';

const Newsletter = () => {
  return (
    <section className="newsletter">
      <div className="container">
        <div className="newsletter-content">
          <h2>Receba nossas ofertas especiais</h2>
          <p>Assine nossa newsletter e fique por dentro das novidades e promoções</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Seu melhor e-mail" required />
            <button type="submit" className="btn btn-primary">Assinar</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;