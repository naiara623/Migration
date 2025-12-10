import React, { useState } from 'react';
import './AvaliacaoProduto.css';
import { ThemeEffect } from '../ThemeEffect';
import { ThemeProvider } from '../ThemeContext';


const AvaliacaoProdutoContext = () => {
    ThemeEffect();
  const [avaliacao, setAvaliacao] = useState({
    nota: 0,
    titulo: '',
    comentario: '',
    nome: '',
    email: ''
  });

  const [avaliacoesExistentes, setAvaliacoesExistentes] = useState([
    {
      id: 1,
      nome: 'João Silva',
      nota: 5,
      titulo: 'Produto excelente!',
      comentario: 'Superou minhas expectativas. Qualidade impressionante.',
      data: '15/03/2024',
      verificado: true
    },
    {
      id: 2,
      nome: 'Maria Santos',
      nota: 4,
      titulo: 'Muito bom',
      comentario: 'Gostei bastante, mas poderia ter mais cores disponíveis.',
      data: '10/03/2024',
      verificado: true
    },
    {
      id: 3,
      nome: 'Pedro Oliveira',
      nota: 3,
      titulo: 'Regular',
      comentario: 'Produto ok, mas a entrega atrasou.',
      data: '05/03/2024',
      verificado: false
    }
  ]);

  const handleNotaClick = (nota) => {
    setAvaliacao({ ...avaliacao, nota });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAvaliacao({ ...avaliacao, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (avaliacao.nota === 0) {
      alert('Por favor, selecione uma nota!');
      return;
    }

    const novaAvaliacao = {
      id: avaliacoesExistentes.length + 1,
      nome: avaliacao.nome || 'Anônimo',
      nota: avaliacao.nota,
      titulo: avaliacao.titulo,
      comentario: avaliacao.comentario,
      data: new Date().toLocaleDateString('pt-BR'),
      verificado: false
    };

    setAvaliacoesExistentes([novaAvaliacao, ...avaliacoesExistentes]);
    
    // Reset form
    setAvaliacao({
      nota: 0,
      titulo: '',
      comentario: '',
      nome: '',
      email: ''
    });

    alert('Avaliação enviada com sucesso!');
  };

  const calcularMedia = () => {
    if (avaliacoesExistentes.length === 0) return 0;
    const soma = avaliacoesExistentes.reduce((acc, curr) => acc + curr.nota, 0);
    return (soma / avaliacoesExistentes.length).toFixed(1);
  };

  const Estrelas = ({ nota, tamanho = 'medio' }) => {
    return (
      <div className={`estrelas ${tamanho}`}>
        {[1, 2, 3, 4, 5].map((estrela) => (
          <span
            key={estrela}
            className={`estrela ${estrela <= nota ? 'preenchida' : ''}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="container-avaliacao">
      <div className="produto-header">
        <div className="produto-imagem">
          <img src="https://via.placeholder.com/150x150/007bff/ffffff?text=Produto" alt="Produto" />
        </div>
        <div className="produto-info">
          <h1>Smartphone XYZ Pro</h1>
          <div className="avaliacao-geral">
            <div className="nota-media">
              <span className="numero-media">{calcularMedia()}</span>
              <Estrelas nota={calcularMedia()} tamanho="grande" />
              <span className="total-avaliacoes">
                {avaliacoesExistentes.length} avaliações
              </span>
            </div>
         
          </div>
        </div>
      </div>


    </div>
  );
};

function AvaliacaoProduto() {
  return (
    <ThemeProvider>
      <AvaliacaoProdutoContext />
    </ThemeProvider>
  );
}

export default AvaliacaoProduto;