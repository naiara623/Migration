import React, { useState, useEffect } from 'react';
import './Categorias.css';

function Categorias({ isOpen, onClose, onCategoriaSelecionada }) {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buscar categorias do banco quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      fetchCategorias();
    }
  }, [isOpen]);

  const fetchCategorias = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/categorias');
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Resposta não é JSON:', text.substring(0, 100));
        throw new Error('Resposta não é JSON');
      }
      
      const categoriasData = await response.json();
      console.log('Categorias recebidas:', categoriasData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      setError('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

// Mapeamento de nomes e imagens para categorias
const categoriaMap = {
  'Viagens': {
    nome: 'Viagens',
    imagem: '/Pass.jpg'
  },
  'Trilhas': {
    nome: 'Trilhas',
    imagem: '/trilhas.jpg'
  },
  'Lembranças': {
    nome: 'Lembranças',
    imagem: '/Lembranças.jpg'
  },
  'Acessorios': {
    nome: 'Acessórios',
    imagem: '/Almofada.jpg'
  },
  'camping': {
    nome: 'Camping',
    imagem: '/Camping.jpg'
  },
  'tdv': {
    nome: 'Tecnologia de Viagem',
    imagem: '/Tecnologia.jpg'
  },
  'mdv': {
    nome: 'Moda de Viagem',
    imagem: '/Moda.jpg'
  },
  'outros': {
    nome: 'Outros',
    imagem: '/outros.jpg'
  }
};

// Função para obter imagem
const getImagemCategoria = (nome_categoria) => {
  return categoriaMap[nome_categoria]?.imagem || '/default.jpg';
};

// Função para formatar nome
const formatarnome_categoria = (nome_categoria) => {
  return categoriaMap[nome_categoria]?.nome || nome_categoria;
};


  const handleClick = (id_categoria, nome_categoria) => {
    onCategoriaSelecionada(id_categoria, nome_categoria);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className='modal-contente' onClick={(e) => e.stopPropagation()}>
        {loading && <div className="loading">Carregando categorias...</div>}
        
        {error && (
          <div className="error">
            <p>{error}</p>
            <button onClick={fetchCategorias}>Tentar novamente</button>
          </div>
        )}
        
        {!loading && !error && (
          <div className='grid-categorias'>
            {categorias.length > 0 ? (
              categorias.map((categoria) => (
                <div
                  className='categoria-card'
                  key={categoria.id_categoria}
                  onClick={() => handleClick(categoria.id_categoria, categoria.nome_categoria)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { 
                    if (e.key === 'Enter') handleClick(categoria.id_categoria, categoria.nome_categoria); 
                  }}
                >
                  <img 
                    src={getImagemCategoria(categoria.nome_categoria)} 
                    alt={categoria.nome_categoria} 
                    className='icone' 
                  />
                  <span>{formatarnome_categoria(categoria.nome_categoria)}</span>
                </div>
              ))
            ) : (
              <p>Nenhuma categoria encontrada</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Categorias;