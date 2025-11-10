import React, { useState } from 'react';
import './Avaliar.css'

function Avaliar({isOpen, onClose}) {

    if (!isOpen) return null;

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
     <div className='englobaTudo-Modal' onClick={onClose}>
       <div className='grande-modal' onClick={(e) => e.stopPropagation()}>
      
        
      <div className="conteudo-avaliacao">

        <div className="formulario-avaliacao-avaliar">

        <div  className='conteine-deixe-sua-avaliação'>
          <h2>Deixe sua avaliação</h2>
        </div>
          <div className='conteudo-avaliacao-2'> 

          <form className='Form-ava' onSubmit={handleSubmit}>
            <div className="campo-nota">
              <label>Sua nota:</label>
              <div className="selecao-estrelas">
                {[1, 2, 3, 4, 5].map((estrela) => (
                  <button
                    key={estrela}
                    type="button"
                    className={`estrela-selecionavel ${
                      estrela <= avaliacao.nota ? 'selecionada' : ''
                    }`}
                    onClick={() => handleNotaClick(estrela)}
                  >
                    ★
                  </button>
                ))}
                <span className="texto-nota">
                  {avaliacao.nota === 0 ? 'Selecione uma nota' : 
                   avaliacao.nota === 1 ? 'Péssimo' :
                   avaliacao.nota === 2 ? 'Ruim' :
                   avaliacao.nota === 3 ? 'Regular' :
                   avaliacao.nota === 4 ? 'Bom' : 'Excelente'}
                </span>
              </div>
            </div>

            <div className="campo-grupo">
              <div className="campo">
                <label htmlFor="titulo">Título da avaliação *</label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={avaliacao.titulo}
                  onChange={handleChange}
                  required
                  placeholder="Resuma sua experiência"
                />
              </div>
            </div>

            <div className="campo">
              <label htmlFor="comentario">Comentário *</label>
              <textarea
                id="comentario"
                name="comentario"
                value={avaliacao.comentario}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Descreva sua experiência com o produto..."
              ></textarea>
            </div>

            <div className="campo-duplo">
              <div className="campo">
                <label htmlFor="nome">Seu nome *</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={avaliacao.nome}
                  onChange={handleChange}
                  required
                  placeholder="Como quer ser chamado"
                />
              </div>
              <div className="campo">
                <label htmlFor="email">E-mail *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={avaliacao.email}
                  onChange={handleChange}
                  required
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className='conteine-botao-enviar' >
              <button type="submit" className="botao-enviar">
                Enviar Avaliação
              </button>
            </div>

          </form>
            </div>



        </div>

        <div className="lista-avaliacoes">
          <h2>Avaliações dos clientes</h2>
          {avaliacoesExistentes.length === 0 ? (
            <p className="sem-avaliacoes">Seja o primeiro a avaliar este produto!</p>
          ) : (
            avaliacoesExistentes.map((avaliacao) => (
              <div key={avaliacao.id} className="card-avaliacao">
                <div className="cabecalho-avaliacao">
                  <div className="info-usuario">
                    <span className="nome-usuario">{avaliacao.nome}</span>
                    {avaliacao.verificado && (
                      <span className="verificado">✓ Verificado</span>
                    )}
                  </div>
                  <div className="data-avaliacao">{avaliacao.data}</div>
                </div>
                <Estrelas nota={avaliacao.nota} />
                <h3 className="titulo-avaliacao">{avaliacao.titulo}</h3>
                <p className="comentario-avaliacao">{avaliacao.comentario}</p>
                <div className="acoes-avaliacao">
                  <button className="botao-util">👍 Útil (12)</button>
                  <button className="botao-denunciar">Denunciar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>





      </div>

  );
};

export default Avaliar;