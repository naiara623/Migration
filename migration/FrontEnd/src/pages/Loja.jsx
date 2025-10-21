import React, { useState, useEffect } from 'react';
import { ThemeContext } from '../ThemeContext';
import { ThemeEffect } from '../ThemeEffect';
import Header from '../components/Header';
import { FaPlusCircle, FaBoxOpen, FaChartPie, FaEdit, FaTrash, FaCheckSquare, FaSquare, FaTimes, FaShoppingCart, FaShare, FaHeart, FaStar } from "react-icons/fa";
import ProductForm from '../components/ProductForm';
// import ProductEdit from '../components/ProductEdit'; // Importar o novo componente
import './Loja.css';
import NovoProduct from '../components/NovoProduct';

function Lojacontext() {
  ThemeEffect();

  const [activeSection, setActiveSection] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Dados de desempenho (mockados para demonstração)
  const [performanceData, setPerformanceData] = useState({
    earning: 628,
    share: 2434,
    likes: 1259,
    rating: 8.5,
    salesData: [45, 30, 25, 40, 35, 50, 45, 60, 55, 50, 65, 70],
    salesLabels: ['Jan 15', 'Feb 16', 'Mar 17', 'Apr 18', 'May 19', 'Jun 21', 'Jul 22', 'Aug 23', 'Sep 24', 'Oct 25', 'Nov 26', 'Dec 27']
  });





// Adicionar verificação de sessão antes de fazer requisições
const checkSession = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/check-session', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Status da sessão:', data);
      return data.autenticado;
    }
    return false;
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return false;
  }
};

// CORREÇÃO: Função para carregar produtos com melhor tratamento de erro
const fetchProducts = async () => {
  setLoading(true);
  try {
    // Verificar se está autenticado primeiro
    const isAuthenticated = await checkSession();
    if (!isAuthenticated) {
      console.log('Usuário não autenticado, redirecionando...');
      setProducts([]);
      // Aqui você pode redirecionar para login se quiser
      return;
    }

    const response = await fetch('http://localhost:3001/api/meus-produtos', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.status === 401) {
      console.log('Não autorizado - sessão expirada');
      setProducts([]);
      return;
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro do servidor:', errorData);
      throw new Error(errorData.erro || 'Erro ao carregar produtos');
    }
    
    const data = await response.json();
    // Garantir que os IDs são números
    const productsWithNumericIds = data.map(product => ({
      ...product,
      id: Number(product.id_produto)
    }));
    setProducts(productsWithNumericIds);
    console.log('Produtos do usuário carregados:', productsWithNumericIds);
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    alert('Erro ao carregar produtos: ' + error.message);
  } finally {
    setLoading(false);
  }
};






   // CORREÇÃO: Função para carregar produtos com tratamento de IDs
 // CORREÇÃO: Função para carregar produtos DO USUÁRIO LOGADO



  // Carregar produtos ao iniciar
  useEffect(() => {
    fetchProducts();
  }, []);

const handleAddProduct = async (newProduct) => {
  try {
    const formData = new FormData();
    formData.append('nome_produto', newProduct.nome_produto); // corrigido
    formData.append('descricao', newProduct.descricao || '');
    formData.append('valor_produto', newProduct.valor_produto); // corrigido
    formData.append('categoria', newProduct.categoria);
    formData.append('estoque', newProduct.estoque || 0);

    if (newProduct.imagem_url && newProduct.imagem_url !== editingProduct?.imagem_url) {
      formData.append('imagem_url', newProduct.imagem_url); // corrigido
    }

    let response;
    if (editingProduct) {
      response = await fetch(`http://localhost:3001/api/produtos/${editingProduct.id_produto}`, {
        method: 'PUT',
        body: formData,
      });
    } else {
      response = await fetch('http://localhost:3001/api/produtos', {
        method: 'POST',
        body: formData,
      });
    }

    if (response.ok) {
      await fetchProducts();
      setEditingProduct(null);
      setActiveSection(null);
    } else {
      const errorData = await response.json();
      alert('Erro ao salvar produto: ' + (errorData.erro || 'Erro desconhecido'));
    }
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    alert('Erro ao conectar com o servidor');
  }
};



// Loja.js - A função deleteSelectedProducts já está correta, mas vou melhorar o tratamento de erro
const deleteSelectedProducts = async () => {
  if (selectedProducts.size === 0) {
    alert('Nenhum produto selecionado para excluir.');
    return;
  }

  if (window.confirm(`Tem certeza que deseja excluir ${selectedProducts.size} produto(s)?`)) {
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const productId of selectedProducts) {
        try {
          const response = await fetch(`http://localhost:3001/api/produtos/${productId}`, {
            method: 'DELETE',
          });
          
          if (response.ok) {
            successCount++;
          } else {
            const errorData = await response.json();
            console.error(`Erro ao deletar produto ${productId}:`, errorData.erro);
            errorCount++;
          }
        } catch (error) {
          console.error(`Erro ao deletar produto ${productId}:`, error);
          errorCount++;
        }
      }
      
      // Recarregar a lista
      await fetchProducts();
      exitSelectionMode();
      
      if (errorCount === 0) {
        alert(`${successCount} produto(s) excluído(s) com sucesso!`);
      } else {
        alert(`${successCount} produto(s) excluído(s), ${errorCount} falha(s). Verifique o console.`);
      }
      
    } catch (error) {
      console.error('Erro geral ao excluir produtos:', error);
      alert('Erro ao excluir produtos. Verifique o console.');
    }
  }
};
 // CORREÇÃO: Função de editar corrigida
// CORREÇÃO: Função de editar corrigida
const editSelectedProduct = () => {
  if (selectedProducts.size === 1) {
    const productId = Array.from(selectedProducts)[0];
    console.log('ID do produto para editar:', productId);
    console.log('Todos os produtos:', products);
    
    // CORREÇÃO: Buscar pelo id_produto que vem do backend
    const productToEdit = products.find(p => Number(p.id_produto) === Number(productId));
    
    if (productToEdit) {
      console.log('Produto encontrado para edição:', productToEdit);
      setEditingProduct(productToEdit);
      setActiveSection('produtos');
      exitSelectionMode();
    } else {
      console.error('Produto não encontrado. IDs disponíveis:', products.map(p => p.id_produto));
      alert('Produto não encontrado.');
    }
  } else if (selectedProducts.size > 1) {
    alert('Por favor, selecione apenas um produto para editar.');
  } else {
    alert('Por favor, selecione um produto para editar.');
  }
};


  const toggleProductSelection = (productId) => {
    // Converter para número para garantir consistência
    const id = Number(productId);
    const newSelected = new Set(selectedProducts);
    
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
    console.log('Produtos selecionados:', Array.from(newSelected));
  };

 const toggleSelectAll = () => {
  if (selectedProducts.size === products.length) {
    setSelectedProducts(new Set());
  } else {
    // CORREÇÃO: Usar id_produto em vez de id
    const allIds = new Set(products.map(product => Number(product.id_produto)));
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
              <div className="form-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ marginRight: '2px' }}>
                  {editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
                </h2>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setEditingProduct(null);
                    setActiveSection(null);
                  }}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  X
                </button>
                {editingProduct && (
                  <button className="cancel-edit-btn" onClick={cancelEdit} style={{ marginLeft: '10px' }}>
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
             <h2 className='h2'>({selectedProducts.size}) {selectedProducts.size === 1 ? 'Selecionada' : 'Selecionadas'}</h2>
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
    <NovoProduct 
      products={products} 
      isSelectionMode={isSelectionMode} 
      selectedProducts={selectedProducts} 
      toggleProductSelection={toggleProductSelection} 
    />         
            </div>
          ) : loading ? (
            <div className="loading">Carregando produtos...</div>
            //oi
          ) :products.length === 0 ? (
  <div className="placeholder-image1">
    <img className='imagg' src="io.png" alt="My Store" />
  </div>
) : (
  <div className="featured-products">
    <h2 className="section-title">Produtos Cadastrados</h2>
  <NovoProduct 
    products={products}
    isSelectionMode={isSelectionMode}
    selectedProducts={selectedProducts}
    toggleProductSelection={toggleProductSelection}
  />

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