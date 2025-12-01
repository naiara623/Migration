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
      <div className="modal-content1" onClick={stopPropagation}>
        <div className="titulo">
          <h3 className='Selecione-idi'>Selecione o idioma desejado</h3>
        </div>

        <div className='butons-idi'>
           <button className='pt' onClick={() => changeLanguage('pt')}>Português</button>
          <button className='en' onClick={() => changeLanguage('en')}>English</button>
          <button className='es' onClick={() => changeLanguage('es')}>Español</button>
        </div>
        {/* <h3 className='Selecione-idi'>Selecione o idioma desejado</h3>
        <div className="idiomas-options">
          <button className='pt' onClick={() => changeLanguage('pt')}>Português</button>
          <button className='en' onClick={() => changeLanguage('en')}>English</button>
          <button className='es' onClick={() => changeLanguage('es')}>Español</button>
        </div> */}
      </div>
    </div>
  );
}

export default ModalIdiomas;
