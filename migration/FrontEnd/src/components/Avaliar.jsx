
import React, { useState } from 'react';
import './Avaliar.css'

function Avaliar({isOpen, onClose}) {

    if (!isOpen) return null;

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [titulo, setTitulo] = useState('');
    const [comentario, setComentario] = useState('');
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    
    const [avaliacoes, setAvaliacoes] = useState([
      {
        id: 1,
        nome: 'João Silva',
        verificado: true,
        data: '15/03/2024',
        rating: 5,
        titulo: 'Produto excelente!',
        comentario: 'Superou minhas expectativas. Qualidade impressionante.',
        util: 12
      }
    ]);

    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (rating === 0) {
        alert('Por favor, selecione uma nota');
        return;
      }
      
      const novaAvaliacao = {
        id: avaliacoes.length + 1,
        nome: nome || 'Anônimo',
        verificado: false,
        data: new Date().toLocaleDateString('pt-BR'),
        rating: rating,
        titulo: titulo,
        comentario: comentario,
        util: 0
      };
      
      setAvaliacoes([novaAvaliacao, ...avaliacoes]);
      
      // Limpar formulário
      setRating(0);
      setTitulo('');
      setComentario('');
      setNome('');
      setEmail('');
    };

    const handleUtilClick = (id) => {
      setAvaliacoes(avaliacoes.map(avaliacao => 
        avaliacao.id === id 
          ? { ...avaliacao, util: avaliacao.util + 1 }
          : avaliacao
      ));
    };

    const renderStars = (currentRating, isInteractive = false) => {
      return (
        <div className="stars-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= (isInteractive ? (hoverRating || rating) : currentRating) ? 'filled' : ''}`}
              onClick={isInteractive ? () => setRating(star) : undefined}
              onMouseEnter={isInteractive ? () => setHoverRating(star) : undefined}
              onMouseLeave={isInteractive ? () => setHoverRating(0) : undefined}
              style={{ cursor: isInteractive ? 'pointer' : 'default' }}
            >
              ★
            </span>
          ))}
        </div>
      );
    };
    
  return (
     <div className='englobaTudo-Modal' onClick={onClose}>
      
         <div className='grande-modal1' onClick={(e) => e.stopPropagation()}>
      
           <div className="avaliacao-container">
             <div className="formulario-secao">
               <h2 className="titulo-principal">Deixe sua avaliação</h2>
               
               <form onSubmit={handleSubmit}>
                 <div className="campo-grupo">
                   <label className="label">Sua nota:</label>
                   <div className="rating-input">
                     {renderStars(rating, true)}
                     <span className="rating-text">Selecione uma nota</span>
                   </div>
                 </div>

                 <div className="campo-grupo">
                   <label className="label">
                     Título da avaliação <span className="obrigatorio">*</span>
                   </label>
                   <input
                     type="text"
                     className="input-campo"
                     placeholder="Resuma sua experiência"
                     value={titulo}
                     onChange={(e) => setTitulo(e.target.value)}
                     required
                   />
                 </div>

                 <div className="campo-grupo">
                   <label className="label">
                     Comentário <span className="obrigatorio">*</span>
                   </label>
                   <textarea
                     className="textarea-campo"
                     placeholder="Descreva sua experiência com o produto..."
                     value={comentario}
                     onChange={(e) => setComentario(e.target.value)}
                     required
                     rows="4"
                   />
                 </div>

                 <div className="campo-grupo">
                   <label className="label">
                     Seu nome <span className="obrigatorio">*</span>
                   </label>
                   <input
                     type="text"
                     className="input-campo"
                     placeholder="Como quer ser chamado"
                     value={nome}
                     onChange={(e) => setNome(e.target.value)}
                     required
                   />
                 </div>

                 <div className="campo-grupo">
                   <label className="label">
                     E-mail <span className="obrigatorio">*</span>
                   </label>
                   <input
                     type="email"
                     className="input-campo"
                     placeholder="seu@email.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                   />
                 </div>

                 <button type="submit" className="botao-enviar">
                   Enviar Avaliação
                 </button>
               </form>
             </div>

             <div className="avaliacoes-secao">
               <h2 className="titulo-avaliacoes">Avaliações dos clientes</h2>
               
               {avaliacoes.map((avaliacao) => (
                 <div key={avaliacao.id} className="avaliacao-card">
                   <div className="avaliacao-header">
                     <div className="usuario-info">
                       <span className="usuario-nome">{avaliacao.nome}</span>
                       {avaliacao.verificado && (
                         <span className="badge-verificado">✓ Verificado</span>
                       )}
                     </div>
                     <span className="avaliacao-data">{avaliacao.data}</span>
                   </div>
                   
                   <div className="avaliacao-rating">
                     {renderStars(avaliacao.rating)}
                   </div>
                   
                   <h3 className="avaliacao-titulo">{avaliacao.titulo}</h3>
                   <p className="avaliacao-comentario">{avaliacao.comentario}</p>
                   
                   <div className="avaliacao-acoes">
                     <button 
                       className="botao-util"
                       onClick={() => handleUtilClick(avaliacao.id)}
                     >
                       👍 Útil ({avaliacao.util})
                     </button>
                     <button className="botao-denunciar">Denunciar</button>
                   </div>
                 </div>
               ))}
             </div>
           </div>
      
         </div>

      </div>

  );
};

export default Avaliar;
