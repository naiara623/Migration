import React, { useState, useEffect } from 'react';
import './ProductEdit.css';

function ProductEdit({ product, onUpdateProduct, onCancel }) {
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    nome_produto: '',
    descricao: '',
    valor_produto: '',
    categoria: '',
    estoque: '',
    imagem_url: null,
    imagePreview: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Carregar categorias
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/categorias');
        if (response.ok) {
          const data = await response.json();
          setCategorias(data);
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    fetchCategorias();
  }, []);

  // Preencher formulário quando o produto chegar
  useEffect(() => {
    if (product) {
      console.log('Produto recebido para edição:', product);
      setFormData({
        nome_produto: product.nome_produto || '',
        descricao: product.descricao || '',
        valor_produto: product.valor_produto || '',
        categoria: product.nome_categoria || '',
        estoque: product.estoque || '',
        imagem_url: null,
        imagePreview: product.imagem_url || ''
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('A imagem deve ter menos de 10MB');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imagem_url: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome_produto || !formData.valor_produto || !formData.categoria) {
      setErrorMessage('Preencha os campos obrigatórios.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (parseFloat(formData.valor_produto) <= 0) {
      setErrorMessage('O preço deve ser maior que zero.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      await onUpdateProduct(formData);
      setSuccessMessage('Produto atualizado com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Erro ao atualizar produto');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  if (!product) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="product-edit-screen">
      <div className="product-edit-container">
        <main className="product-edit-main">
          <div className="product-edit-content">
            <h2 className="product-edit-title">Editar Produto</h2>
            
            <form onSubmit={handleSubmit} className="product-edit-form">
              <div className="form-group">
                <label htmlFor="nome_produto">Nome do Produto*</label>
                <input 
                  type="text" 
                  id="nome_produto" 
                  name="nome_produto" 
                  value={formData.nome_produto} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="descricao">Descrição</label>
                <textarea 
                  id="descricao" 
                  name="descricao" 
                  value={formData.descricao} 
                  onChange={handleChange} 
                  rows="3" 
                />
              </div>

              <div className="form-group">
                <label htmlFor="valor_produto">Preço* (R$)</label>
                <input 
                  type="number" 
                  id="valor_produto" 
                  name="valor_produto" 
                  value={formData.valor_produto} 
                  onChange={handleChange} 
                  step="0.01" 
                  min="0.01" 
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoria">Categoria*</label>
                <select 
                  id="categoria" 
                  name="categoria" 
                  value={formData.categoria} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id_categoria} value={categoria.nome_categoria}>
                      {categoria.nome_categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="estoque">Estoque</label>
                <input 
                  type="number" 
                  id="estoque" 
                  name="estoque" 
                  value={formData.estoque} 
                  onChange={handleChange} 
                  min="0" 
                />
              </div>

              <div className="form-group image-group">
                <label>Imagem do Produto</label>
                <input 
                  type="file" 
                  id="imagem_url" 
                  name="imagem_url" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
                {formData.imagePreview && (
                  <img 
                    src={formData.imagePreview} 
                    alt="Prévia do Produto" 
                    className="product-image-preview" 
                  />
                )}
              </div>

              {errorMessage && <div className="error-message">{errorMessage}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}

              <div className="form-actions">
                <button type="submit" className="update-btn">
                  Atualizar Produto
                </button>
                <button type="button" className="cancel-btn" onClick={onCancel}>
                  Cancelar Edição
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProductEdit;