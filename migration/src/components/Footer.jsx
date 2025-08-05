import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>TravelGear</h3>
            <p>Sua loja completa de produtos para viagem. Qualidade e conforto para suas aventuras.</p>
            <div className="social-icons">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-pinterest-p"></i></a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Links Úteis</h4>
            <ul>
              <li><a href="#">Sobre Nós</a></li>
              <li><a href="#">Nossas Lojas</a></li>
              <li><a href="#">Blog de Viagens</a></li>
              <li><a href="#">Trabalhe Conosco</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Ajuda</h4>
            <ul>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Trocas e Devoluções</a></li>
              <li><a href="#">Política de Privacidade</a></li>
              <li><a href="#">Termos de Serviço</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contato</h4>
            <ul>
              <li><i className="fas fa-map-marker-alt"></i> Av. das Viagens, 1234</li>
              <li><i className="fas fa-phone"></i> (11) 98765-4321</li>
              <li><i className="fas fa-envelope"></i> contato@travelgear.com</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} TravelGear. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;