import React, { useState } from 'react';
import './Manage.css';

const Manage = () => {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const orders = [
    {
      id: 'ORD001',
      date: '2025-10-01',
      buyer: 'John Fisher',
      payment: 'Credit Card',
      product: 'Salmon Fillet',
      price: 12.99,
      species: 'Salmon',
      quantity: 2,
      status: 'Pending',
    },
    {
      id: 'ORD002',
      date: '2025-10-02',
      buyer: 'Alice Ocean',
      payment: 'Bank Transfer',
      product: 'Tuna Steak',
      price: 15.49,
      species: 'Tuna',
      quantity: 3,
      status: 'Unshipped',
    },
    {
      id: 'ORD003',
      date: '2025-10-03',
      buyer: 'Mark Blue',
      payment: 'Cash',
      product: 'Cod Fillet',
      price: 10.99,
      species: 'Cod',
      quantity: 1,
      status: 'Unshipped',
    },
    {
      id: 'ORD004',
      date: '2025-10-04',
      buyer: 'Sophia Net',
      payment: 'Credit Card',
      product: 'Mackerel',
      price: 9.5,
      species: 'Mackerel',
      quantity: 4,
      status: 'Shipped',
    },
    {
      id: 'ORD005',
      date: '2025-10-05',
      buyer: 'Liam Boat',
      payment: 'Bank Transfer',
      product: 'Sea Bass',
      price: 14.75,
      species: 'Sea Bass',
      quantity: 2,
      status: 'Shipped',
    },
  ];

  const statuses = ['All', 'Pending', 'Unshipped', 'Shipped'];

  const filteredOrders = orders.filter(order => {
    const matchStatus =
      selectedStatus === 'All' || order.status === selectedStatus;
    const matchSearch = order.id
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const openOrders = orders.filter(o => o.status !== 'Sold Out').length;
  const totalBalance = orders.reduce((sum, o) => sum + o.price * o.quantity, 0);
  const reviews = 128; // mock number

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
          <h3>${totalBalance.toFixed(2)}</h3>
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
      <th>Availability</th> {/* เพิ่ม column ใหม่ */}
      <th>Order Detail</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {filteredOrders.length > 0 ? (
      filteredOrders.map(order => {
        const isAvailable = order.status !== "Shipped"; // ตัวอย่าง: Shipped = Sold Out
        return (
          <tr key={order.id}>
            <td>{order.date}</td>
            <td className="product-detail">
              <strong>{order.product}</strong><br />
              Price: ${order.price.toFixed(2)}/lb<br />
              Species: {order.species}<br />
              Quantity: {order.quantity}<br />
              <em>Subtotal: ${(order.price * order.quantity).toFixed(2)}</em>
            </td>
            <td>
              <span className={`status-badge status-${order.status.replace(' ', '').toLowerCase()}`}>
                {order.status}
              </span>
            </td>
            <td>
              <span className={isAvailable ? "available" : "soldout"}>
                {isAvailable ? "Available" : "Sold Out"}
              </span>
            </td>
            <td className="order-info">
              <strong>ID:</strong> {order.id}<br />
              <strong>Buyer:</strong> {order.buyer}<br />
              <strong>Payment:</strong> {order.payment}
            </td>
            <td className="action-buttons">
              <button className="btn light">Print Packing Slip</button>
              <button className="btn light">Cancel Order</button>
              <button className="btn light">Confirm Shipment</button>
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


