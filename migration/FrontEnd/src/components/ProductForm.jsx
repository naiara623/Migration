import React, { useState, useEffect } from 'react';
import './ProductForm.css';


function ProductForm({ onAddCarrinho }) {
  const [product, setProduct] = useState({
   nome_produto: '',
    descricao: '',
    valor_produto: '',
    categoria: '', // Agora usamos o nome da categoria
    estoque: '',
    image_url: null,
    imagePreview: ''
  });
  
  const [categorias, setCategorias] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Carregar categorias do banco
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
          image_url: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação
    if (!product.nome_produto || !product.valor_produto || !product.categoria) {
      setErrorMessage('Preencha os campos obrigatórios.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (parseFloat(product.valor_produto) <= 0) {
      setErrorMessage('O preço deve ser maior que zero.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nome_produto', product.nome_produto);
      formData.append('descricao', product.descricao);
      formData.append('valor_produto', product.valor_produto);
      formData.append('categoria', product.categoria); // Enviamos o nome da categoria
      formData.append('estoque', product.estoque);
      if (product.image_url) {
        formData.append('image_url', product.image_url);
      }

      const response = await fetch('http://localhost:3001/api/produtos', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage('Produto cadastrado com sucesso!');
        
        // Limpa o formulário
        setTimeout(() => {
          setSuccessMessage('');
          setProduct({
            nome_produto: '',
            descricao: '',
            valor_produto: '',
            categoria: '',
            estoque: '',
            image_url: null,
            imagePreview: ''
          });
        }, 3000);
      } else {
        const error = await response.json();
        setErrorMessage(error.erro || 'Erro ao cadastrar produto');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch (error) {
      setErrorMessage('Erro ao conectar com o servidor');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <div className="product-screen">
      <div className="product-container">
        <main className="product-main">
          <div className="product-content">
            <h2 className="product-title">Cadastrar Novo Produto</h2>
            
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label htmlFor="nome_produto">Nome do Produto*</label>
               <input type="text" id="nome_produto" name="nome_produto" value={product.nome_produto} onChange={handleChange} required />
              </div>

              {/* Added descricao field */}
              <div className="form-group">
                <label htmlFor="descricao">Descrição</label>
                    <textarea id="descricao" name="descricao" value={product.descricao} onChange={handleChange} rows="3" />
              </div>

              <div className="form-group">
                 <label htmlFor="valor_produto">Preço* (R$)</label>
                <input type="number" id="valor_produto" name="valor_produto" value={product.valor_produto} onChange={handleChange} step="0.01" min="0.01" required />
              </div>

              <div className="form-group">
                 <label htmlFor="categoria">Categoria*</label>
                <select id="categoria" name="categoria" value={product.categoria} onChange={handleChange} required>
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
                <input type="number" id="estoque" name="estoque" value={product.estoque} onChange={handleChange} min="0" />
              </div>

            <div className="form-group image-group">
                <label>Imagem do Produto</label>
  <input type="file" id="image_url" name="image_url" accept="image_url/*" onChange={handleImageChange} />
                {product.imagePreview && (
                  <img src={product.imagePreview} alt="Prévia do Produto" className="product-image-preview" />
                )}
              </div>

              {errorMessage && <div className="error-message">{errorMessage}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}

              <button type="submit" className="submit-btn">Cadastrar Produto</button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProductForm;