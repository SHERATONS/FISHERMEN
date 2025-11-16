import React, { useState } from 'react';
import './BuyerReviews.css';
import { useCart } from "../CartContext";
import { useNavigate } from "react-router-dom";


const BuyerReviews = () => {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showReviewFormFor, setShowReviewFormFor] = useState(null);
  const [showReviewHistory, setShowReviewHistory] = useState(false);
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [reviews, setReviews] = useState({});

  const { addToCart } = useCart();
  const navigate = useNavigate();

  const buyer = { id: 'BUY12345', name: 'Ray Wesker' };
  const statuses = ['All', 'Pending', 'Completed', 'Cancelled'];

  const orders = [
    { id: 'ORD101', seller: 'Ocean Fish Co.', product: 'Salmon', quantity: 2, price: 360, status: 'Completed' },
    { id: 'ORD102', seller: 'Blue Sea Market', product: 'Tuna', quantity: 1, price: 380, status: 'Completed' },
    { id: 'ORD103', seller: 'Fresh Catch Ltd.', product: 'Cod', quantity: 4, price: 240, status: 'Completed' },
    { id: 'ORD104', seller: 'Ocean Fish Co.', product: 'Mackerel', quantity: 1, price: 110, status: 'Completed' },
    { id: 'ORD105', seller: 'Seafood Hub', product: 'Sea Bass', quantity: 2, price: 420, status: 'Completed' },
  ];

  const filteredOrders = orders.filter(order =>
    selectedStatus === 'All' || order.status === selectedStatus
  );

  const handleSubmitReview = (orderId) => {
    if (!ratingInput || !commentInput.trim()) {
      alert("Please select a rating and write a comment!");
      return;
    }
    setReviews({ ...reviews, [orderId]: { rating: ratingInput, comment: commentInput } });
    setShowReviewFormFor(null);
    setRatingInput(0);
    setCommentInput('');
  };

  return (
    <div className="buyer-reviews-page">
      {/* Buyer Info */}
      <div className="buyer-info">
        <div className="buyer-avatar">👤</div>
        <div>
          <h2>{buyer.name}</h2>
          <p>Buyer ID: {buyer.id}</p>
        </div>
      </div>

      <h2>My Orders</h2>

      {/* Filter Bar + Review History */}
      <div className="filter-bar">
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {statuses.map(status => (
            <button
              key={status}
              className={`filter-tab ${selectedStatus === status ? 'active' : ''}`}
              onClick={() => { setSelectedStatus(status); setShowReviewHistory(false); }}
            >
              {status}
            </button>
          ))}
          <button
            className={`filter-tab ${showReviewHistory ? 'active' : ''}`}
            onClick={() => setShowReviewHistory(!showReviewHistory)}
          >
            Review History
          </button>
        </div>
      </div>

      {/* Orders / Reviews List */}
      <div className="orders-list">
        {showReviewHistory ? (
          Object.keys(reviews).length > 0 ? (
            Object.entries(reviews).map(([orderId, review]) => {
              const order = orders.find(o => o.id === orderId);
              return (
                <div key={orderId} className="order-card">
                  <div className="order-info">
                    <p><strong>Order ID:</strong> {orderId}</p>
                    <p><strong>Product:</strong> {order.product}</p>
                    <p><strong>Seller:</strong> {order.seller}</p>
                    <p><strong>Rating:</strong> {"★".repeat(review.rating)} ({review.rating}/5)</p>
                    <p><strong>Comment:</strong> {review.comment}</p>
                  </div>
                  <div className="order-actions">
                    <button className="btn rate" onClick={() => {
                      setShowReviewFormFor(orderId);
                      setRatingInput(review.rating);
                      setCommentInput(review.comment);
                    }}>Edit Review</button>
                  </div>

                  {/* Review Form */}
                  {showReviewFormFor === orderId && (
                    <div className="review-form">
                      <p>Select overall rating:</p>
                      <div className="star-input">
                        {[1, 2, 3, 4, 5].map(i => (
                          <span
                            key={i}
                            className={`star ${i <= ratingInput ? 'selected' : ''}`}
                            onClick={() => setRatingInput(i)}
                          >★</span>
                        ))}
                      </div>
                      <textarea
                        placeholder="Write your review..."
                        value={commentInput}
                        onChange={e => setCommentInput(e.target.value)}
                      />
                      <button className="btn submit" onClick={() => handleSubmitReview(orderId)}>Submit Review</button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>No reviews yet.</p>
          )
        ) : (
          filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-info">
                  <p><strong>Seller:</strong> {order.seller}</p>
                  <p><strong>Product:</strong> {order.product}</p>
                  <p><strong>Quantity:</strong> {order.quantity}</p>
                  <p><strong>Subtotal:</strong> {(order.quantity * order.price).toFixed(2)} THB</p>
                </div>
                <div className="order-actions">
                  {reviews[order.id] ? (
                    <button className="btn view-review" onClick={() => alert(`Rating: ${reviews[order.id].rating}\nComment: ${reviews[order.id].comment}`)}>
                      See Review
                    </button>
                  ) : (
                    <button className="btn rate" onClick={() => setShowReviewFormFor(order.id)}>Rate</button>
                  )}
                  {/* <button className="btn buy-again">Buy Again</button> */}
                  <button
                    className="btn buy-again"
                    onClick={() => {
                      const fish = {
                        id: order.id,
                        fishType: order.product,
                        price: order.price,
                        quantity: 1,
                      };

                      addToCart(fish);
                      navigate("/market");
                    }}
                  >
                    Buy Again
                  </button>

                </div>

                {/* Review Form */}
                {showReviewFormFor === order.id && (
                  <div className="review-form">
                    <p>Select overall rating:</p>
                    <div className="star-input">
                      {[1, 2, 3, 4, 5].map(i => (
                        <span
                          key={i}
                          className={`star ${i <= ratingInput ? 'selected' : ''}`}
                          onClick={() => setRatingInput(i)}
                        >★</span>
                      ))}
                    </div>
                    <textarea
                      placeholder="Write your review..."
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                    />
                    <button className="btn submit" onClick={() => handleSubmitReview(order.id)}>Submit Review</button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No orders in this category.</p>
          )
        )}
      </div>
    </div>
  );
};

export default BuyerReviews;



