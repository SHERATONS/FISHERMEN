import React, { useState, useEffect } from 'react';
import './Manage.css';

const STATUS_LABEL = {
  PENDING: { text: 'Pending', className: 'badge-warning' },
  UNSHIPPED: { text: 'Unshipped', className: 'badge-un' },
  SHIPPED: { text: 'Shipped', className: 'badge-success' },
};

const placeholderImg = '/images/placeholder.png';

const Toast = ({ toasts, removeToast }) => (
  <div className="toast-wrapper">
    {toasts.map(t => (
      <div key={t.id} className={`toast toast-${t.type}`}>
        <div className="toast-message">{t.message}</div>
        <button className="toast-close" onClick={() => removeToast(t.id)}>✕</button>
      </div>
    ))}
  </div>
);

const Manage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState({});
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/orders/list-dto');
        const data = await res.json();
        console.log('Fetched Orders:', data);

        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };
    fetchOrders();
  }, []);

  const statuses = ['All', 'PENDING', 'UNSHIPPED', 'SHIPPED'];

  const filteredOrders = orders.filter(order => {
    const matchStatus = selectedStatus === 'All' || order.status === selectedStatus;
    const matchSearch = order.id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pushToast = (message, type = 'info', timeout = 3500) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    if (timeout > 0) setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), timeout);
  };

  const removeToast = id => setToasts(prev => prev.filter(t => t.id !== id));

  const handleCancel = orderId => {
    pushToast(`Order ${orderId} has been cancelled`, 'error');
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
  };

  const handleConfirmShipment = orderId => {
    pushToast(`Shipment confirmed for order ${orderId}`, 'success');
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'SHIPPED' } : o));
  };

  const toggleExpand = orderId => setExpanded(prev => ({ ...prev, [orderId]: !prev[orderId] }));

  const formatDate = iso => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="manage-container">
      <h2>Order Management</h2>

      {/* Filter */}
      <div className="filter-bar">
        <div className="status-navbar">
          {statuses.map(status => (
            <button
              key={status}
              className={`status-tab ${selectedStatus === status ? 'active' : ''}`}
              onClick={() => setSelectedStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by Order ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Cards */}
      <div className="cards-grid">
        {filteredOrders.length > 0 ? filteredOrders.map(order => {
          const firstItem = order.items?.[0] || null;
          const moreCount = Math.max(0, (order.items?.length || 0) - 1);
          const total = parseFloat(order.totalPrice || 0);
          const statusMeta = STATUS_LABEL[order.status] || {
            text: order.status || 'N/A',
            className: 'badge-muted'
          };

          return (
            <div key={order.id} className="order-card">
              {/* Header */}
              <div className="card-header">
                <div className="header-left">
                  <div className="order-id">{order.id}</div>
                  <div className="order-date">{formatDate(order.orderDate)}</div>
                </div>
                <div className="header-right">
                  <span className={`status-badge ${statusMeta.className}`}>
                    {statusMeta.text}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="card-body">
                {firstItem && (
                  <div className="item-row">
                    <img
                      src={firstItem.photoUrl || placeholderImg}
                      alt={firstItem.fishName}
                      className="item-image"
                      onError={e => { e.target.src = placeholderImg; }}
                    />
                    <div className="item-info">
                      <div className="item-name">{firstItem.fishName}</div>
                      <div className="item-qty-price">
                        {firstItem.quantity} Kg × {parseFloat(firstItem.priceAtPurchase).toFixed(2)} THB
                      </div>
                    </div>
                  </div>
                )}
                {moreCount > 0 && (
                  <button className="expand-btn" onClick={() => toggleExpand(order.id)}>
                    {expanded[order.id] ? `Hide ▲` : `+ ${moreCount} more item(s) ▼`}
                  </button>
                )}
                {expanded[order.id] && (
                  <div className="expanded-items">
                     {order.items.slice(1).map((item, idx) => (   
                      <div key={idx} className="expanded-item">
                         <img
                          src={item.photoUrl || placeholderImg}
                          alt={item.fishName}
                          className="expanded-item-img"
                          onError={e => e.target.src = placeholderImg}   
                          />
                          <div className="expanded-item-info">
                             <div className="expanded-title">{item.fishName}</div>
                             <div className="expanded-meta">
                              {item.quantity} Kg × {parseFloat(item.priceAtPurchase).toFixed(2)} THB  
                              = {(item.quantity * item.priceAtPurchase).toFixed(2)} THB
                             </div>
                           </div>
                         </div>
                       ))}
                   </div>
                  )}
              </div>

              {/* Divider */}
              <div className="divider"></div>

              {/* Buyer & SubTotal */}
              <div className="buyer-subtotal-row">
                <div className="buyer">
                  <span className="buyer-label">Buyer</span>
                  <span className="buyer-name">{order.buyer?.username || 'Unknown'}</span>
                </div>
                <div className="subtotal">
                  <span className="subtotal-label">SubTotal</span>
                  <span className="subtotal-amount">{total.toFixed(2)} THB</span>
                </div>
              </div>

              {/* Actions */}
              <div className="card-actions">
                {order.status === 'PENDING' && (
                  <button className="destructive" onClick={() => handleCancel(order.id)}>
                    Cancel Order
                  </button>
                )}
                {order.status === 'UNSHIPPED' && (
                  <>
                    <button className="primary" onClick={() => handleConfirmShipment(order.id)}>
                      Confirm Shipment
                    </button>
                    <button className="destructiv" onClick={() => handleCancel(order.id)}>
                      Cancel Order
                    </button>
                  </>
                )}
              
              </div>

            </div>
          );
        }) : (
          <div className="no-orders">No orders found</div>
        )}
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Manage;









    
