import React, { useState, useEffect } from 'react';
import './Manage.css';

const Manage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/orders/list-dto')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched Orders:', data);
        setOrders(data);
      })
      .catch(err => console.error('Error fetching orders:', err));
  }, []);

  const statuses = ['All', 'PENDING', 'UNSHIPPED', 'SHIPPED'];

  // ฟิลเตอร์ตามสถานะและ Order ID
  const filteredOrders = orders.filter(order => {
    const matchStatus =
      selectedStatus === 'All' || order.status === selectedStatus;
    const matchSearch = order.id
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  // คำนวณสรุปยอดรวม
  const openOrders = orders.filter(o => o.status !== 'SHIPPED').length;
  const totalBalance = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const reviews = 4; // mock

  return (
    <div className="manage-container">
      <h2>Order Management</h2>

      {/* Filter bar + Search */}
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

      {/* Summary Boxes */}
      <div className="summary-boxes">
        <div className="summary-box">
          <h3>{openOrders}</h3>
          <p>Available</p>
        </div>
        <div className="summary-box">
          <h3>{totalBalance.toFixed(2)} THB</h3>
          <p>Total Balance</p>
        </div>
        <div className="summary-box">
          <h3>{reviews}</h3>
          <p>Customer Reviews</p>
        </div>
      </div>

      {/* Table */}
      <table className="order-table">
        <thead>
          <tr>
            <th>Order Date</th>
            <th>Product Detail</th>
            <th>Delivery Status</th>
            <th>Availability</th>
            <th>Order Detail</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => {
              const isAvailable = order.status !== 'SHIPPED';

              return (
                <tr key={order.id}>
                  <td>
                    {new Date(order.orderDate).toLocaleDateString('th-TH', {
                      dateStyle: 'medium',
                    })}
                  </td>

                  {/* แสดงทุก order item */}
                  <td className="product-detail">
                    {order.items?.map((item, idx) => {
                      const fishName = item.fishName || 'N/A';
                      const price = item.priceAtPurchase || 0;
                      const qty = item.quantity || 0;
                      const subtotal = price * qty;
                      return (
                        <div key={idx}>
                          <strong>{fishName}</strong><br />
                          Price: {price.toFixed(2)} THB/Kg<br />
                          Quantity: {qty}<br />
                          Subtotal: {subtotal.toFixed(2)} THB
                        </div>
                      );
                    })}
                  </td>

                  <td>
                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>

                  <td>
                    <span className={isAvailable ? 'available' : 'soldout'}>
                      {isAvailable ? 'Available' : 'Sold Out'}
                    </span>
                  </td>

                  <td className="order-info">
                    <strong>ID:</strong> {order.id}<br />
                    <strong>Buyer:</strong> {order.buyer?.username || 'Unknown'}<br />
                  </td>

                  <td className="action-buttons">
                    <button className="btn light">Cancel Order</button>
                    <button className="btn light" >Confirm Shipment</button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', color: '#666' }}>
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Manage;




    
