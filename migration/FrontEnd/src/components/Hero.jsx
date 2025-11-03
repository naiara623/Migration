import React from 'react';
import './Hero.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "../i18n"; // importa a inicialização do i18n

const Hero = () => {

  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h2>{t("hero.oi.title")}</h2>
          <p>{t("hero.oi.infor")}</p>
          <button onClick={() => navigate('/cadastro')} className="btn btn-primary">{t("hero.oi.button")}</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;