import React from 'react';
import './ModalIdiomas.css';
import { useTranslation } from 'react-i18next';

function ModalIdiomas({ onClose, isOpen }) {
  const { i18n } = useTranslation();

  if (!isOpen) return null;

  const stopPropagation = (e) => e.stopPropagation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    onClose(); // fecha o modal após mudar o idioma
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={stopPropagation}>
        <h3 className='Selecione-idi'>Selecione o idioma</h3>
        <div className="idiomas-options">
          <button onClick={() => changeLanguage('pt')}>Português</button>
          <button onClick={() => changeLanguage('en')}>English</button>
          <button onClick={() => changeLanguage('es')}>Español</button>
        </div>
      </div>
    </div>
  );
}

export default ModalIdiomas;
