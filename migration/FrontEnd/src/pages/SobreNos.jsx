import React from 'react'
import "./SobreNos.css"
import { ThemeProvider } from '../ThemeContext';
import { ThemeEffect } from '../ThemeEffect';
import { useNavigate } from 'react-router-dom';

const teamMembers = [
  {
    name: "Naiara Rodrigues",
    role: "Desenvolvedora Full Stack",
    focus: "Frontend",
    emoji: "💻",
    description: "Especializada em desenvolvimento de interfaces modernas e responsivas, criando experiências visuais intuitivas para os usuários.",
  },
  {
    name: "Laura Melek",
    role: "Desenvolvedora Full Stack",
    focus: "Backend",
    emoji: "⚙️",
    description: "Focada na arquitetura e desenvolvimento do servidor, garantindo uma base sólida e segura para toda a aplicação.",
  },
  {
    name: "Kayllany Ketylly",
    role: "Desenvolvedora Full Stack",
    focus: "Frontend",
    emoji: "🎨",
    description: "Responsável pelo design visual e implementação frontend, transformando conceitos em interfaces atraentes e funcionais.",
  },
];

const values = [
  {
    title: "Qualidade",
    emoji: "✨",
    description: "Comprometidas com código limpo, bem estruturado e mantível.",
  },
  {
    title: "Inovação",
    emoji: "🚀",
    description: "Sempre buscando novas tecnologias e melhores práticas.",
  },
  {
    title: "Colaboração",
    emoji: "🤝",
    description: "Trabalhando juntas para alcançar objetivos comuns.",
  },
];

 function SobreNosContext() {
 const navigate = useNavigate();

return (
    <div className="about-us-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Sobre Nós</h1>
          <p className="hero-subtitle">
            Somos um time de desenvolvedoras apaixonadas por criar soluções inovadoras
          </p>
          <p className="hero-description">
            Migration é um projeto de e-commerce desenvolvido por três desenvolvedoras full stack dedicadas a entregar qualidade e excelência.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision-section">
        <div className="mission-vision-container">
          <div className="mission-vision-grid">
            {/* Mission Card */}
            <div className="card">
              <h2 className="card-title">Nossa Missão</h2>
              <p className="card-text">
                Desenvolver uma plataforma de vendas moderna, intuitiva e segura que proporcione uma experiência excepcional aos usuários, combinando design elegante com funcionalidade robusta.
              </p>
            </div>

            {/* Vision Card */}
            <div className="card">
              <h2 className="card-title">Nossa Visão</h2>
              <p className="card-text">
                Ser reconhecidas como um time de desenvolvimento que cria soluções de alta qualidade, priorizando a experiência do usuário e a excelência técnica em cada projeto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="team-container">
          <div className="team-header">
            <h2 className="team-title">👥 Nossa Equipe</h2>
            <p className="team-subtitle">
              Três desenvolvedoras talentosas trabalhando juntas para criar o Migration
            </p>
          </div>

          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-emoji">{member.emoji}</div>

                <h3 className="team-name">{member.name}</h3>

                <p className="team-role">{member.role}</p>

                <div className="team-focus-badge">
                  <p className="team-focus-text">Foco: {member.focus}</p>
                </div>

                <p className="team-description">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="values-container">
          <h2 className="values-title">Nossos Valores</h2>

          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-emoji">{value.emoji}</div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Conheça nosso Projeto</h2>
          <p className="cta-description">
            Explore a plataforma Migration e descubra a qualidade do nosso trabalho
          </p>
          <button 
           className="cta-button"
            onClick={() => navigate('/cadastro')}
          >Visitar Migration</button>
        </div>
      </section>
    </div>
  );
}


function SobreNos() {
  return (
    <ThemeProvider>
        <SobreNosContext />
    </ThemeProvider>
  )
}

export default SobreNos;

