import React from 'react';
import './HelpSection.css';
import "../i18n"
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const HelpSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();


  return (
    <section className="help-section">
      <div className="container">
        <h2 className="section-title">{ t("helpsaction.ajuda.title")}</h2>
       
        <div className="help-list">
          <div className="help-item">
            <div className="help-content">
              <h3>{ t("helpsaction.ajuda.atendi")}</h3>
              <p>{ t("helpsaction.ajuda.via")}</p>
            </div>
            <button className="action-link" onClick={() => navigate('/chatbot')}>{ t("helpsaction.ajuda.fazer")}</button>
          </div>
          
          <div className="help-item">
            <div className="help-content">
              <h3>{ t("helpsaction.ajuda.menos")}</h3>
              <p>{ t("helpsaction.ajuda.confi")}</p>
            </div>
            <button className="action-link">{ t("helpsaction.ajuda.mostra")}</button>
          </div>
          
          <div className="help-item">
            <div className="help-content">
              <h3>{ t("helpsaction.ajuda.mais")}</h3>
              <p>{ t("helpsaction.ajuda.encon")}</p>
            </div>
            <button className="action-link">{ t("helpsaction.ajuda.vendi")}</button>
          </div>
          
          <div className="help-item">
            <div className="help-content">
              <h3>{ t("helpsaction.ajuda.frete")}</h3>
              <p>{ t("helpsaction.ajuda.econo")}</p>
            </div>
            <button className="action-link">{ t("helpsaction.ajuda.categ")}</button>
          </div>
        </div>
        
        <div className="recent-searches">
          <h2 className="section-title">{ t("helpsaction.ajuda.procu")}</h2>
          <div className="search-tags">
            <span className="tag">{ t("helpsaction.ajuda.tag")}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HelpSection;