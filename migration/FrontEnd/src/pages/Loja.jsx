import React, { useState, useEffect } from 'react';
import { ThemeContext } from '../ThemeContext';
import { ThemeEffect } from '../ThemeEffect';
import Header from '../components/Header';
import { FaPlusCircle, FaBoxOpen, FaChartPie, FaEdit, FaTrash, FaCheckSquare, FaSquare, FaTimes, FaShoppingCart, FaShare, FaHeart, FaStar } from "react-icons/fa";
import ProductForm from '../components/ProductForm';
import './Loja.css';


function Lojacontext() {
  ThemeEffect();

  const [activeSection, setActiveSection] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Dados de desempenho (mockados para demonstração)
  const [performanceData, setPerformanceData] = useState({
    earning: 628,
    share: 2434,
    likes: 1259,
    rating: 8.5,
    salesData: [45, 30, 25, 40, 35, 50, 45, 60, 55, 50, 65, 70],
    salesLabels: ['Jan 15', 'Feb 16', 'Mar 17', 'Apr 18', 'May 19', 'Jun 21', 'Jul 22', 'Aug 23', 'Sep 24', 'Oct 25', 'Nov 26', 'Dec 27']
  });

  // Carregar produtos do localStorage ao iniciar
  useEffect(() => {
    const savedProducts = localStorage.getItem("products");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const handleAddProduct = (newProduct) => {
    if (editingProduct) {
      const updatedProducts = products.map(product =>
        product.id === editingProduct.id
          ? { ...newProduct, id: editingProduct.id }
          : product
      );
      setProducts(updatedProducts);
      setEditingProduct(null);
    } else {
      setProducts([...products, { id: Date.now(), ...newProduct }]);
    }
    setActiveSection(null);
  };

  // Funções para seleção de produtos
  const toggleProductSelection = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      const allIds = new Set(products.map(product => product.id));
      setSelectedProducts(allIds);
    }
  };

  const enterSelectionMode = () => {
    setIsSelectionMode(true);
    setSelectedProducts(new Set());
    setEditingProduct(null);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedProducts(new Set());
    setEditingProduct(null);
  };

  const deleteSelectedProducts = () => {
    if (window.confirm(`Tem certeza que deseja excluir ${selectedProducts.size} produto(s)?`)) {
      const updatedProducts = products.filter(product => !selectedProducts.has(product.id));
      setProducts(updatedProducts);
      exitSelectionMode();
    }
  };

  const editSelectedProduct = () => {
    if (selectedProducts.size === 1) {
      const productId = Array.from(selectedProducts)[0];
      const productToEdit = products.find(p => p.id === productId);
      setEditingProduct(productToEdit);
      setActiveSection('produtos');
    } else if (selectedProducts.size > 1) {
      alert('Por favor, selecione apenas um produto para editar.');
    } else {
      alert('Por favor, selecione um produto para editar.');
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setActiveSection(null);
  };

  // Componente do Dashboard de Desempenho
  const PerformanceDashboard = () => {
    const maxSales = Math.max(...performanceData.salesData);
    
// No componente PerformanceDashboard, substitua o return por este:
return (
  <div className="performance-dashboard">
    <div className="topo">
    <h2>📊 Dashboard de Desempenho</h2>
     </div>

     <div className="fim">

<div className="utensilios">
  
   <div className='quatro4'>

    <div className="metrics-grid">
      <div className="metric-card">
        <div className="metric-icon earning">
          <FaShoppingCart />
        </div>
        <div className="metric-info">
          <h3>Faturamento</h3>
          <span className="metric-value">R$ {performanceData.earning}</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon share">
          <FaShare />
        </div>
        <div className="metric-info">
          <h3>Compartilhamentos</h3>
          <span className="metric-value">{performanceData.share}</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon likes">
          <FaHeart />
        </div>
        <div className="metric-info">
          <h3>Curtidas</h3>
          <span className="metric-value">{performanceData.likes}</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon rating">
          <FaStar />
        </div>
        <div className="metric-info">
          <h3>Avaliação</h3>
          <span className="metric-value">{performanceData.rating}/10</span>
        </div>
      </div>
    </div>

 

    </div>


    <div className="performance-summary">
      <div className="summary-card">
        <h4>📋 Resumo Mensal</h4>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Maior Venda</span>
            <span className="stat-number">{maxSales}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Média</span>
            <span className="stat-number">
              {Math.round(performanceData.salesData.reduce((a, b) => a + b, 0) / performanceData.salesData.length)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-number">
              {performanceData.salesData.reduce((a, b) => a + b, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="dashboard-actions">
      <button className="check-now-btn">
        📋 Ver Relatório Completo
      </button>
    </div>
</div>
   



<div className="grafico">
  <div className="chart-main-section">
    <h3>📊 Resultados de Vendas</h3>
    <div className="horizontal-chart">
      {performanceData.salesData.map((value, index) => {
        const widthPercentage = (value / maxSales) * 100;
        return (
          <div key={index} className="chart-row">
            <div className="chart-label">{performanceData.salesLabels[index]}</div>
            <div className="chart-bar-container">
              <div
                className="chart-bar-horizontal"
                style={{ width: `${widthPercentage}%` }}
              ></div>
              <span className="chart-value">{value}</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
</div>



  </div>  
</div>
);
  };

  return (
    <div className='container-loja'>
      <div className='navebar-ok'>
        <Header/>
      </div>
      
      <div className='lojaa-ok'>
        <div className='opções-ok'> 
          {activeSection === 'produtos' ? (
            <div className="form-container">
              <div className="form-header">
                <h2>{editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</h2>
                {editingProduct && (
                  <button className="cancel-edit-btn" onClick={cancelEdit}>
                    <FaTimes /> Cancelar Edição
                  </button>
                )}
              </div>
              <ProductForm 
                onAddProduct={handleAddProduct}
                editingProduct={editingProduct}
              />
            </div>
          ) : (
            <div className="menu-lateral">
              <h2>My Store</h2>
              <div className="menu-options">
                <div 
                  className={`menu-option ${activeSection === 'produtos' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection('produtos');
                    setEditingProduct(null);
                  }}
                >
                  <FaPlusCircle className="option-icon"/>
                  <span className="option-text">Adicionar Um Novo Produto</span>
                  <div className={`selection-indicator ${activeSection === 'produtos' ? 'visible' : ''}`}></div>
                </div>

                <div 
                  className={`menu-option ${activeSection === 'itens' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection('itens');
                    enterSelectionMode();
                  }}
                >
                  <FaBoxOpen className="option-icon"/>
                  <span className="option-text">Selecionar Itens</span>
                  <div className={`selection-indicator ${activeSection === 'itens' ? 'visible' : ''}`}></div>
                </div>

                <div 
                  className={`menu-option ${activeSection === 'desempenho' ? 'active' : ''}`}
                  onClick={() => setActiveSection('desempenho')}
                >
                  <FaChartPie className="option-icon"/>
                  <span className="option-text">Desempenho Dos Itens</span>
                  <div className={`selection-indicator ${activeSection === 'desempenho' ? 'visible' : ''}`}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='produtos-ok'>
          {activeSection === 'desempenho' ? (
            <PerformanceDashboard />
          ) : isSelectionMode ? (
            <div className="selection-mode">
              <div className="selection-header">
                <h2>({selectedProducts.size}) Selecionada/s</h2>
                <div className="selection-actions">
                  <button 
                    className="select-all-btn"
                    onClick={toggleSelectAll}
                  >
                    {selectedProducts.size === products.length ? 
                      <FaCheckSquare /> : <FaSquare />
                    }
                    {selectedProducts.size === products.length ? 
                      " Desmarcar Todos" : " Selecionar Todos"
                    }
                  </button>
                  
                  {selectedProducts.size > 0 && (
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={editSelectedProduct}>
                        <FaEdit /> Editar
                      </button>
                      <button className="delete-btn" onClick={deleteSelectedProducts}>
                        <FaTrash /> Excluir
                      </button>
                    </div>
                  )}
                  
                  <button className="cancel-btn" onClick={exitSelectionMode}>
                    Cancelar
                  </button>
                </div>
              </div>

              <div className="products-grid selection-grid">
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className={`product-card ${selectedProducts.has(product.id) ? 'selected' : ''}`}
                    onClick={() => toggleProductSelection(product.id)}
                  >
                    <div className="selection-checkbox">
                      {selectedProducts.has(product.id) ? <FaCheckSquare /> : <FaSquare />}
                    </div>
                    
                    <img src={product.imagePreview} alt={product.name} className="product-image" />
                    <h3 className="product-title">{product.name}</h3>
                    
                    <div className="product-rating">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star ${i < product.rating ? 'filled' : ''}`}
                        ></i>
                      ))}
                    </div>

                    <p className="product-price">R$ {product.price}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="placeholder-image">
              <img className='imagg' src="io.png" alt="My Store" />
            </div>
          ) : (
            <div className="featured-products">
              <h2 className="section-title">Produtos Cadastrados</h2>
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product.id} className="product-card">
                    <img src={product.imagePreview} alt={product.name} className="product-image" />
                    <h3 className="product-title">{product.name}</h3>
                    
                    <div className="product-rating">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star ${i < product.rating ? 'filled' : ''}`}
                        ></i>
                      ))}
                    </div>

                    <p className="product-price">R$ {product.price}</p>
                    <button className="add-to-cart">Adicionar ao Carrinho</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Loja() {
  return (
    <ThemeContext>
      <Lojacontext />
    </ThemeContext>
  )
}

export default Loja;