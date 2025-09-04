import React, { useState } from 'react'
import './Ofertas.css';
import Header from '../components/Header';
import ModalConfig from '../components/ModalConfig';
// import EditarProduct from '../components/EditarProduct';
// import Header from '../components/Header';

const products = [
  { id: 1, name: 'Mochila Viagem Pro', price: 299.90, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', rating: 5 },
  { id: 2, name: 'Jaqueta Impermeável', price: 199.90, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', rating: 4 },
  { id: 3, name: 'Mala de Viagem 20"', price: 499.90, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', rating: 5 },
  { id: 4, name: 'Tênis Caminhada', price: 249.90, image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', rating: 4 },
];


function Ofertas() {

  // const [open, setOpen] = useState(false);
  const  [openModal, setOpenModal] = useState(false);

  return (
      <div className='amarela-Ofertas'>

        <div className='Navbar-global'>
            <Header />
        </div>

        <div className='DivGlobal-Ofertas'>
            <div className="produtos1-Ofertas">
                 <section className="featured-products">

        <div className="container">

            <h2 className="section-title">Produtos em Destaque</h2>
            <div className="products-grid">
                
              {products.map(product => (
                <div key={product.id} className="product-card">
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                      <div className="product-badge">Novo</div>
                    </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <div className="product-rating">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`fas fa-star ${i < product.rating ? 'filled' : ''}`}></i>
                      ))}
                    </div>
                    <div className="product-price">R$ {product.price.toFixed(2)}</div>
                    <button onClick={() => setOpenModal(true)} className="btn btn-primary">Adicionar ao Carrinho</button>
               
                  </div>
                </div>
              ))}

                 <ModalConfig 
  isOpen={openModal}
  onClose={() => setOpenModal(false)} 
  onAddCarrinho={(config) => console.log("Config recebida:", config)}
/>
            </div>
        </div>
    </section>
                

             
        </div>
      

    </div>
    </div>
  )
}

export default Ofertas
