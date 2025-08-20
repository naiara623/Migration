import React, { useState } from 'react';
import './ProductForm.css';
import { ThemeProvider } from '../ThemeContext';
import { ThemeEffect } from '../ThemeEffect';


function ProductFormContext() {
  ThemeEffect();

  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: null,
    imagePreview: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setErrorMessage('A imagem deve ter menos de 10MB');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProduct(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!product.name || !product.price || !product.category) {
      setErrorMessage('Por favor, preencha os campos obrigatórios (Nome, Preço e Categoria).');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // Validação do preço
    if (parseFloat(product.price) <= 0) {
      setErrorMessage('O preço deve ser maior que zero.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // Simulação de envio para API
    console.log('Produto enviado:', {
      ...product,
      price: parseFloat(product.price),
      stock: product.stock ? parseInt(product.stock) : 0
    });
    
    setSuccessMessage('Produto cadastrado com sucesso!');
    setTimeout(() => {
      setSuccessMessage('');
      // Reset do formulário
      setProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: null,
        imagePreview: ''
      });
    }, 3000);
  };

  return (
    <div className='product-container'>
    
      
      <main className='product-main'>
        <div className="product-content">
          <h2 className="product-title">Cadastrar Novo Produto</h2>
          
          <div className="product-form-wrapper">
            <div className='product-form-inner'>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nome do Produto*</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    placeholder="Ex: Camiseta Básica"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="price">Preço* (R$)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={product.price}
                    onChange={handleChange}
                    placeholder="Ex: 59.90"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Categoria*</label>
                  <select
                    id="category"
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="roupas">Roupas</option>
                    <option value="acessorios">Acessórios</option>
                    <option value="calcados">Calçados</option>
                    <option value="decoracao">Decoração</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="stock">Quantidade em Estoque</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={product.stock}
                    onChange={handleChange}
                    placeholder="Ex: 50"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Descrição do Produto</label>
                <textarea
                  id="description"
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  placeholder="Descreva detalhes sobre o produto..."
                  rows="4"
                />
              </div>
              
              <div className="form-group">
                <label>Imagem do Produto</label>
                <div className="image-upload-section">
                  <div className="image-upload-container">
                    <label htmlFor="image" className="upload-btn">
                      {product.imagePreview ? 'Alterar Imagem' : 'Selecionar Imagem'}
                    </label>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    <div className="image-preview-container">
                      {product.imagePreview ? (
                        <img src={product.imagePreview} alt="Preview" className="image-preview" />
                      ) : (
                        <div className="empty-preview">
                          <span>Nenhuma imagem selecionada</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="image-hint">Tamanho máximo: 10MB</p>
                </div>
              </div>
              
              {errorMessage && <div className="error-message">{errorMessage}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}
              
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Cadastrar Produto
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProductForm() {
  return (
    <ThemeProvider>
      <ProductFormContext/>
    </ThemeProvider>
  );
}

export default ProductForm;