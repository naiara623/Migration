import React from "react";
import { useTranslation } from "react-i18next";
import "../i18n"; // importa a inicialização do i18n
import Header from "../components/Header";
import "./Testidioma.css";

function Testeidioma() {
  const { t } = useTranslation();

  return (
    <div>
      <Header />
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>{t("footer.brand.title")}</h3>
              <p>{t("footer.brand.description")}</p>
              <div className="social-icons">
                <a href="#">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#">
                  <i className="fab fa-pinterest-p"></i>
                </a>
              </div>
            </div>
            <div className="footer-section">
              <h4>{t("footer.links.title")}</h4>
              <ul>
                <li>
                  <a href="#">{t("footer.links.about")}</a>
                </li>
                <li>
                  <a href="#">{t("footer.links.stores")}</a>
                </li>
                <li>
                  <a href="#">{t("footer.links.blog")}</a>
                </li>
                <li>
                  <a href="#">{t("footer.links.work")}</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>{t("footer.help.title")}</h4>
              <ul>
                <li>
                  <a href="#">{t("footer.help.faq")}</a>
                </li>
                <li>
                  <a href="#">{t("footer.help.returns")}</a>
                </li>
                <li>
                  <a href="#">{t("footer.help.privacy")}</a>
                </li>
                <li>
                  <a href="#">{t("footer.help.terms")}</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>{t("footer.contact.title")}</h4>
              <ul>
                <li>
                  <i className="fas fa-map-marker-alt"></i> {t("footer.contact.address")}
                </li>
                <li>
                  <i className="fas fa-phone"></i> {t("footer.contact.phone")}
                </li>
                <li>
                  <i className="fas fa-envelope"></i> {t("footer.contact.email")}
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{t("footer.bottom")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Testeidioma;
