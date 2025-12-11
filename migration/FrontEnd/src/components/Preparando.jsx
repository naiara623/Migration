import React from 'react';
import './Preparando.css';
import { CheckCircle2, Clock } from 'lucide-react';

function Preparando({ onClose, isOpen }) {
  if (!isOpen) return null;

  // Mock data - replace with actual data from API
  const orderData = {
    title: "Seu produto está sendo preparado",
    subtitle: "Acompanhe o progresso do seu produto em tempo real",
    status: "Seu pedido está em produção. Você receberá uma notificação quando estiver pronto para envio.",
    product: {
      name: "Kit Organizador de mala",
      image: "IMO", // Placeholder
      size: "M",
      colorOutside: "preto",
      colorInside: "preto",
      material: "poliéster",
      stamp: "✓",
      price: 85.98,
    },
    orderDetails: {
      orderNumber: "PED-2024-001234",
      orderDate: "15/12/2024",
      estimatedTime: "5-7 dias úteis",
      currentStatus: "Em produção",
    },
  };

  return (
    <div className='Modal-overlay1' onClick={onClose}>
      <div className='Modal-ContentPre' onClick={(e) => e.stopPropagation()}>
        <div className='order-tracking-content-wrapper'>
          {/* C1: Header Section */}
          <div className='header-section'>
            <h1 className='header-title'>
              {orderData.title}
            </h1>
            <p className='header-subtitle'>
              {orderData.subtitle}
            </p>
          </div>

          {/* C2: Status Alert Section */}
          <div className='status-alert-section'>
            <div className='status-alert-icon'>
              <Clock size={20} />
            </div>
            <div>
              <p className='status-alert-text'>
                {orderData.status}
              </p>
            </div>
          </div>

          {/* C3: Product Details Section */}
          <div className='product-section'>
            <div className='product-grid'>
              {/* Product Image */}
              <div className='product-image-container'>
                <div className='product-image-text'>
                  <p>Imagem do produto</p>
                </div>
              </div>

              {/* Product Information */}
              <div className='product-info'>
                <h2 className='product-name'>
                  {orderData.product.name}
                </h2>

                <div className='product-details-list'>
                  <div className='product-detail-item'>
                    <span className='product-detail-label'>Tamanho:</span>
                    <span className='product-detail-value'>
                      {orderData.product.size}
                    </span>
                  </div>

                  <div className='product-detail-item'>
                    <span className='product-detail-label'>Cor por fora:</span>
                    <span className='product-detail-value'>
                      {orderData.product.colorOutside}
                    </span>
                  </div>

                  <div className='product-detail-item'>
                    <span className='product-detail-label'>Cor por dentro:</span>
                    <span className='product-detail-value'>
                      {orderData.product.colorInside}
                    </span>
                  </div>

                  <div className='product-detail-item'>
                    <span className='product-detail-label'>Material:</span>
                    <span className='product-detail-value'>
                      {orderData.product.material}
                    </span>
                  </div>

                  <div className='product-detail-item'>
                    <span className='product-detail-label'>Estampa:</span>
                    <span className='product-detail-value'>
                      {orderData.product.stamp}
                    </span>
                  </div>

                  <div className='product-price-container'>
                    <span className='product-price-label'>Valor:</span>
                    <span className='product-price-value'>
                      R$ {orderData.product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* C4: Order Details Section */}
          <div className='order-details-section'>
            <h3 className='order-details-title'>
              Detalhes do Pedido
            </h3>

            <div className='order-details-list'>
              <div className='order-detail-row'>
                <label className='order-detail-label'>
                  Número do Pedido:
                </label>
                <input
                  type="text"
                  value={orderData.orderDetails.orderNumber}
                  readOnly
                  className='order-detail-input'
                />
              </div>

              <div className='order-detail-row'>
                <label className='order-detail-label'>
                  Data do Pedido:
                </label>
                <input
                  type="text"
                  value={orderData.orderDetails.orderDate}
                  readOnly
                  className='order-detail-input'
                />
              </div>

              <div className='order-detail-row'>
                <label className='order-detail-label'>
                  Tempo Estimado:
                </label>
                <input
                  type="text"
                  value={orderData.orderDetails.estimatedTime}
                  readOnly
                  className='order-detail-input'
                />
              </div>

              <div className='order-detail-row'>
                <label className='order-detail-label'>
                  Status Atual:
                </label>
                <div className='order-status-container'>
                  <CheckCircle2 size={16} className='order-status-icon' />
                  {orderData.orderDetails.currentStatus}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Preparando;