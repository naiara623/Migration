import React, { useState } from 'react';
import './ProductForm.css';

function ProductForm({ onAddProduct }) { // <-- receber a função via props
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

  // <-- ESTA FUNÇÃO PRECISA EXISTIR
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
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!product.name || !product.price || !product.category) {
      setErrorMessage('Preencha os campos obrigatórios.');
      return;
    }

    if (parseFloat(product.price) <= 0) {
      setErrorMessage('O preço deve ser maior que zero.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
   const newProduct = {
      ...product,
      price: parseFloat(product.price),
      stock: product.stock ? parseInt(product.stock) : 0
    };
  onAddProduct(newProduct); // 🔹 envia para Loja

    setSuccessMessage('Produto cadastrado com sucesso!');
    setProduct({ name:'', description:'', price:'', category:'', stock:'', image:null, imagePreview:'' });

    if (typeof onAddProduct === 'function') {
      onAddProduct(newProduct); // <-- envia o produto para Loja
    }

  e.preventDefault();

  const newProduct1= {
    name,
    price,
    imagePreview, // 🔹 salva a imagem
  };

  onAddProduct(newProduct1);

  // limpa o form depois
  setName("");
  setPrice("");
  setImagePreview("");


    setSuccessMessage('Produto cadastrado com sucesso!');
    setTimeout(() => {
      setSuccessMessage('');
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
    <div className="product-screen">
      <div className="product-container">
        <main className="product-main">
          <div className="product-content">
            <h2 className="product-title">Cadastrar Novo Produto</h2>
            
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label htmlFor="name">Nome do Produto*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
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
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>

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
                <label>Imagem do Produto</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange} // <-- agora está definido
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
              
              <button type="submit" className="submit-btn">Cadastrar Produto</button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProductForm;