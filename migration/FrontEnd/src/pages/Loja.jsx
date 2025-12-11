import React, { useState, useEffect } from 'react';
import { ThemeContext } from '../ThemeContext';
import { ThemeEffect } from '../ThemeEffect';
import Header from '../components/Header';
import { FaPlusCircle, FaBoxOpen, FaChartPie, FaEdit, FaTrash, FaCheckSquare, FaSquare, FaTimes, FaShoppingCart, FaShare, FaHeart, FaStar, FaUserShield } from "react-icons/fa";
import ProductForm from '../components/ProductForm';
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
  const [isAdmin, setIsAdmin] = useState(false); // Nova state para verificar se é admin
  const [userData, setUserData] = useState(null);

  // Dados de desempenho (mockados para demonstração)
  const [performanceData, setPerformanceData] = useState({
    earning: 628,
    share: 2434,
    likes: 1259,
    rating: 8.5,
    salesData: [45, 30, 25, 40, 35, 50, 45, 60, 55, 50, 65, 70],
    salesLabels: ['Jan 15', 'Feb 16', 'Mar 17', 'Apr 18', 'May 19', 'Jun 21', 'Jul 22', 'Aug 23', 'Sep 24', 'Oct 25', 'Nov 26', 'Dec 27']
  });

  // Verificar se usuário é administrador
  const checkAdminStatus = async () => {
    try {
      console.log('👑 Verificando se é administrador...');
      const response = await fetch('http://localhost:3001/api/check-admin', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('👑 Status de admin:', data);
        setIsAdmin(data.isAdmin);
        return data.isAdmin;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar admin:', error);
      return false;
    }
  };

  // Adicionar verificação de sessão
  const checkSession = async () => {
    try {
      console.log('🔐 Verificando sessão...');
      const response = await fetch('http://localhost:3001/api/check-session-detailed', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      console.log('📋 Resposta da sessão:', data);
      
      if (response.ok && data.autenticado) {
        // Verificar se é admin
        await checkAdminStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar sessão:', error);
      return false;
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const isAuthenticated = await checkSession();
      
      // Usuários autenticados podem ver produtos
      if (!isAuthenticated) {
        console.log('❌ Usuário não autenticado');
        setProducts([]);
        return;
      }

      // ✅ AGORA: Usando rota pública para visualizar produtos
      const response = await fetch('http://localhost:3001/api/produtos/public', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || 'Erro ao carregar produtos');
      }

      const data = await response.json();
      console.log('📦 Dados recebidos do backend:', data);

      // Normalização dos produtos
      const normalizedProducts = data.map(product => ({
        ...product,
        id: Number(product.id_produto),
        id_produto: Number(product.id_produto)
      }));

      setProducts(normalizedProducts);
      console.log('🎯 Produtos normalizados:', normalizedProducts);

    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
      alert('Erro ao carregar produtos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Carregar produtos ao iniciar
  useEffect(() => {
    const loadInitialData = async () => {
      await checkSession();
      if (activeSection === 'itens' || activeSection === 'produtos' || activeSection === 'desempenho') {
        await fetchProducts();
      }
    };
    loadInitialData();
  }, [activeSection]);

  // ✅ ATUALIZADA: Função para adicionar/editar produto (apenas admin)
  const handleAddProduct = async (newProduct) => {
    // Verificar se é admin
    if (!isAdmin) {
      alert('❌ Apenas administradores podem cadastrar produtos!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nome_produto', newProduct.nome_produto);
      formData.append('descricao', newProduct.descricao || '');
      formData.append('valor_produto', newProduct.valor_produto);
      formData.append('categoria', newProduct.categoria);
      formData.append('estoque', newProduct.estoque || 0);

      if (newProduct.imagem_url && newProduct.imagem_url !== editingProduct?.imagem_url) {
        formData.append('imagem_url', newProduct.imagem_url);
      }

      let response;
      let url;

      if (editingProduct) {
        // ✅ Rota protegida para admin
        url = `http://localhost:3001/api/produtos/${editingProduct.id_produto}`;
        response = await fetch(url, {
          method: 'PUT',
          body: formData,
          credentials: 'include'
        });
      } else {
        // ✅ Rota protegida para admin
        url = 'http://localhost:3001/api/produtos';
        response = await fetch(url, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
      }

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Produto salvo com sucesso:', result);
        
        await fetchProducts();
        setEditingProduct(null);
        setActiveSection(null);
        
        alert(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
      } else if (response.status === 401 || response.status === 403) {
        alert('❌ Acesso negado! Apenas administradores podem realizar esta ação.');
        setIsAdmin(false); // Re-verificar status
      } else {
        const errorData = await response.json();
        console.error('❌ Erro na resposta:', errorData);
        alert('Erro ao salvar produto: ' + (errorData.erro || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('❌ Erro ao salvar produto:', error);
      alert('Erro ao conectar com o servidor: ' + error.message);
    }
  };

  // ✅ ATUALIZADA: Função para deletar produtos (apenas admin)
  const deleteSelectedProducts = async () => {
    if (!isAdmin) {
      alert('❌ Apenas administradores podem excluir produtos!');
      return;
    }

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
            // ✅ Rota protegida para admin
            const response = await fetch(`http://localhost:3001/api/produtos/${productId}`, {
              method: 'DELETE',
              credentials: 'include'
            });
            
            if (response.ok) {
              successCount++;
            } else if (response.status === 401 || response.status === 403) {
              alert('❌ Acesso negado! Apenas administradores podem excluir produtos.');
              errorCount++;
              break;
            } else {
              const errorData = await response.json();
              console.error(`❌ Erro ao deletar produto ${productId}:`, errorData.erro);
              errorCount++;
            }
          } catch (error) {
            console.error(`❌ Erro ao deletar produto ${productId}:`, error);
            errorCount++;
          }
        }
        
        await fetchProducts();
        exitSelectionMode();
        
        if (errorCount === 0) {
          alert(`${successCount} produto(s) excluído(s) com sucesso!`);
        } else if (successCount > 0) {
          alert(`${successCount} produto(s) excluído(s), ${errorCount} falha(s).`);
        }
        
      } catch (error) {
        console.error('❌ Erro geral ao excluir produtos:', error);
        alert('Erro ao excluir produtos. Verifique o console.');
      }
    }
  };

  // ✅ ATUALIZADA: Função para editar produto (apenas admin)
  const editSelectedProduct = () => {
    if (!isAdmin) {
      alert('❌ Apenas administradores podem editar produtos!');
      return;
    }

    if (selectedProducts.size === 1) {
      const productId = Array.from(selectedProducts)[0];
      const productToEdit = products.find(p => 
        Number(p.id) === Number(productId) || 
        Number(p.id_produto) === Number(productId)
      );
      
      if (productToEdit) {
        setEditingProduct(productToEdit);
        setActiveSection('produtos');
        exitSelectionMode();
      } else {
        alert('Produto não encontrado para edição.');
      }
    } else if (selectedProducts.size > 1) {
      alert('Por favor, selecione apenas um produto para editar.');
    } else {
      alert('Por favor, selecione um produto para editar.');
    }
  };

  const toggleProductSelection = (productId) => {
    const id = Number(productId);
    const newSelected = new Set(selectedProducts);
    
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      const allIds = new Set(products.map(product => Number(product.id)));
      setSelectedProducts(allIds);
    }
  };

  const enterSelectionMode = () => {
    if (!isAdmin) {
      alert('❌ Apenas administradores podem gerenciar produtos!');
      return;
    }
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

  const handleRefreshProducts = () => {
    fetchProducts();
  };

  // Componente do Dashboard de Desempenho (apenas admin)
  const PerformanceDashboard = () => {
    if (!isAdmin) {
      return (
        <div className="not-admin-message">
          <FaUserShield className="admin-icon" />
          <h2>🔒 Acesso Restrito</h2>
          <p>Esta área é apenas para administradores do sistema.</p>
        </div>
      );
    }

    const maxSales = Math.max(...performanceData.salesData);
    
    return (
      <div className="performance-dashboard">
        <div className="topo">
          <h2>📊 Dashboard de Desempenho (Admin)</h2>
          <span className="admin-badge">👑 Administrador</span>
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
              <button className="check-now-btn" onClick={handleRefreshProducts}>
                🔄 Atualizar Dados
              </button>
              <button className="check-now-btn2">
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
                  {isAdmin && <span className="admin-badge-small">👑 Admin</span>}
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
              
              {!isAdmin ? (
                <div className="not-admin-message">
                  <FaUserShield className="admin-icon" />
                  <h2>🔒 Acesso Restrito</h2>
                  <p>Apenas administradores podem cadastrar ou editar produtos.</p>
                  <button 
                    className="back-btn" 
                    onClick={() => setActiveSection(null)}
                  >
                    Voltar ao Menu
                  </button>
                </div>
              ) : (
                <ProductForm 
                  onAddProduct={handleAddProduct}
                  editingProduct={editingProduct}
                  onCancel={cancelEdit}
                />
              )}
            </div>
          ) : (
            <div className="menu-lateral">
              <h2>My Store</h2>
              {isAdmin && <div className="admin-status">👑 Administrador</div>}
              <div className="menu-options">
                {isAdmin && (
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
                )}

                {isAdmin && (
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
                )}

                <div 
                  className={`menu-option ${activeSection === 'desempenho' ? 'active' : ''}`}
                  onClick={() => setActiveSection('desempenho')}
                >
                  <FaChartPie className="option-icon"/>
                  <span className="option-text">
                    {isAdmin ? 'Desempenho Dos Itens' : 'Ver Produtos'}
                  </span>
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
                {isAdmin && (
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
                )}
              </div>
              <NovoProduct 
                products={products} 
                isSelectionMode={isSelectionMode} 
                selectedProducts={selectedProducts} 
                toggleProductSelection={toggleProductSelection}
                isAdmin={isAdmin}
              />         
            </div>
          ) : loading ? (
            <div className="loading">Carregando produtos...</div>
          ) : products.length === 0 ? (
            <div className="placeholder-image1">
              <img className='imagg' src="io.png" alt="My Store" />
              <button 
                onClick={handleRefreshProducts}
                className='recarregarButon'
              >
                🔄 Recarregar Produtos
              </button>
            </div>
          ) : (
            <div className="featured-products">
              <div className="section-header">
                <h2 className="section-title">
                  {isAdmin ? 'Produtos Cadastrados' : 'Produtos Disponíveis'}
                  {!isAdmin && <span className="user-view-badge">👤 Visualização Usuário</span>}
                </h2>
                <button 
                  onClick={handleRefreshProducts}
                  className="refresh-btn"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--accent-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  🔄 Atualizar
                </button>
              </div>
              <NovoProduct 
                products={products}
                isSelectionMode={isSelectionMode}
                selectedProducts={selectedProducts}
                toggleProductSelection={toggleProductSelection}
                isAdmin={isAdmin}
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