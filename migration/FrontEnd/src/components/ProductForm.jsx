import React, { useState, useEffect } from 'react';
import './ProductForm.css';

function ProductForm({ onAddProduct, editingProduct, onCancel }) {
  const [product, setProduct] = useState({
    nome_produto: '',
    descricao: '',
    valor_produto: '',
    categoria: '',
    estoque: '',
    imagem_url: null,
    imagePreview: ''
  });
  
  const [categorias, setCategorias] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Carregar categorias do banco
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/categorias', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setCategorias(data);
        } else if (response.status === 401) {
          setErrorMessage('Usuário não autorizado. Faça login novamente.');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar categorias:', error);
        setErrorMessage('Erro ao carregar categorias.');
      }
    };

    fetchCategorias();
  }, []);

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (editingProduct) {
      setProduct({
        nome_produto: editingProduct.nome_produto || '',
        descricao: editingProduct.descricao || '',
        valor_produto: editingProduct.valor_produto || '',
        categoria: editingProduct.nome_categoria || '', // Nome da categoria
        estoque: editingProduct.estoque || '',
        imagem_url: null,
        imagePreview: editingProduct.imagem_url ? `http://localhost:3001${editingProduct.imagem_url}` : ''
      });
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
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
        setProduct(prev => ({
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
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Validações
    if (!product.nome_produto || !product.valor_produto || !product.categoria) {
      setErrorMessage('Preencha os campos obrigatórios.');
      setLoading(false);
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (parseFloat(product.valor_produto) <= 0) {
      setErrorMessage('O preço deve ser maior que zero.');
      setLoading(false);
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nome_produto", product.nome_produto);
      formData.append("descricao", product.descricao || '');
      formData.append("valor_produto", product.valor_produto);
      formData.append("categoria", product.categoria); // Enviar o NOME da categoria
      formData.append("estoque", product.estoque || 0);
      
      if (product.imagem_url) {
        formData.append("imagem_url", product.imagem_url);
      }

      let response;
      let url;

      if (editingProduct) {
        // Editar produto existente
        url = `http://localhost:3001/api/produtos/${editingProduct.id_produto}`;
        response = await fetch(url, {
          method: "PUT",
          body: formData,
          credentials: "include"
        });
      } else {
        // Criar novo produto
        url = "http://localhost:3001/api/produtos";
        response = await fetch(url, {
          method: "POST",
          body: formData,
          credentials: "include"
        });
      }

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Produto salvo com sucesso:', result);
        
        setSuccessMessage(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
        
        // Limpar formulário após sucesso
        setTimeout(() => {
          setSuccessMessage('');
          if (!editingProduct) {
            setProduct({
              nome_produto: '',
              descricao: '',
              valor_produto: '',
              categoria: '',
              estoque: '',
              imagem_url: null,
              imagePreview: ''
            });
          }
          // Chamar callback do componente pai
          if (onAddProduct) {
            onAddProduct(result.product || result);
          }
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.erro || "Erro ao salvar produto");
      }
    } catch (error) {
      console.error('❌ Erro ao salvar produto:', error);
      setErrorMessage(error.message || 'Erro ao salvar produto.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProduct({
      nome_produto: '',
      descricao: '',
      valor_produto: '',
      categoria: '',
      estoque: '',
      imagem_url: null,
      imagePreview: ''
    });
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="product-screen">
      <div className="product-container">
        <main className="product-main">
          <div className="product-content">
            <h2 className="product-title">
              {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
            </h2>
            
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label htmlFor="nome_produto">Nome do Produto*</label>
                <input 
                  type="text" 
                  id="nome_produto" 
                  name="nome_produto" 
                  value={product.nome_produto} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="descricao">Descrição</label>
                <textarea 
                  id="descricao" 
                  name="descricao" 
                  value={product.descricao} 
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
                  value={product.valor_produto} 
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
                  value={product.categoria} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(categoria => (
                    // Corrigido: usar nome_categoria como value
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
                  value={product.estoque} 
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
                {product.imagePreview && (
                  <img 
                    src={product.imagePreview} 
                    alt="Prévia do Produto" 
                    className="product-image-preview" 
                  />
                )}
              </div>

              {errorMessage && <div className="error-message">{errorMessage}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : (editingProduct ? 'Atualizar Produto' : 'Cadastrar Produto')}
                </button>
                
                {editingProduct && (
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProductForm;