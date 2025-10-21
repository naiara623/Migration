// src/App.js
import React, { useState } from "react";
import { translations } from "./translations";

function TestIdioma() {
  const [language, setLanguage] = useState("en");

  // Função de tradução
  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <div>
      <h1>{t("greeting")}!</h1>
      <p>{t("farewell")}!</p>

      <div>
        <label>{t("language")}: </label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="pt">Português</option>
          <option value="es">Español</option>
        </select>
      </div>
    </div>
  );
}

export default TestIdioma;
