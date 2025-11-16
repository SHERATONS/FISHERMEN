import React, { useState, useEffect } from 'react';
import './BuyerReviews.css';
import { useAuth } from "../AuthContext";

const BuyerReviews = () => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('Not Reviewed');
  const [showReviewFormFor, setShowReviewFormFor] = useState(null);
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [orders, setOrders] = useState([]);
  const [existingReviews, setExistingReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchUserDetails();
      fetchData();
    }
  }, [user?.id]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${user.id}`);
      if (response.ok) {
        const userData = await response.json();
        setUserDetails(userData);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Fetch both orders and reviews together
  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOrders(),
        fetchExistingReviews()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/orders/buyer/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      console.log('Fetched orders:', data);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchExistingReviews = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/buyer/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      console.log('Fetched existing reviews:', data);
      setExistingReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // Get all reviewable order items (SHIPPED or COMPLETED)
  const getAllReviewableItems = () => {
    const items = [];
    orders.forEach(order => {
      if (order.status === 'SHIPPED' || order.status === 'COMPLETED') {
        order.items?.forEach(item => {
          items.push({ ...item, order });
        });
      }
    });
    console.log('All reviewable items:', items);
    return items;
  };

  // Check if an orderItem has a review by comparing orderItem IDs
  const hasReview = (orderItemId) => {
    const hasIt = existingReviews.some(review => 
      review.orderItem?.id === orderItemId || review.orderItemId === orderItemId
    );
    console.log(`Checking review for orderItemId ${orderItemId}: ${hasIt}`);
    return hasIt;
  };

  // Filter items based on review status
  const getFilteredItems = () => {
    const allItems = getAllReviewableItems();
    let filtered = [];
    
    if (selectedFilter === 'Reviewed') {
      filtered = allItems.filter(item => hasReview(item.id));
    } else {
      filtered = allItems.filter(item => !hasReview(item.id));
    }
    
    console.log(`Filtered items for "${selectedFilter}":`, filtered);
    return filtered;
  };

  // Get existing review for an order item
  const getExistingReview = (orderItemId) => {
    return existingReviews.find(review => 
      review.orderItem?.id === orderItemId || review.orderItemId === orderItemId
    );
  };

  const handleSubmitReview = async (orderItemId) => {
    if (!ratingInput || !commentInput.trim()) {
      alert("Please select a rating and write a comment!");
      return;
    }

    try {
      let reviewData = {
        rating: ratingInput,
        comment: commentInput
      };

      if (!editingReviewId) {
        reviewData.buyerId = user.id;
        reviewData.orderItemId = orderItemId;
      }

      const endpoint = editingReviewId 
        ? `http://localhost:8080/api/reviews/update/${editingReviewId}`
        : `http://localhost:8080/api/reviews/create`;

      const method = editingReviewId ? 'PUT' : 'POST';

      console.log('Submitting review:', { endpoint, method, reviewData });

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (response.ok) {
        if (editingReviewId) {
          setExistingReviews(prevReviews =>
            prevReviews.map(review =>
              review.id === editingReviewId
                ? { ...review, rating: ratingInput, comment: commentInput }
                : review
            )
          );
        } else {
          const newReview = {
            id: responseData.id,
            rating: responseData.rating,
            comment: responseData.comment,
            buyerId: responseData.buyerId,
            orderItemId: responseData.orderItemId, // Add this field
            orderItem: { id: responseData.orderItemId },
            reviewDate: responseData.reviewDate
          };
          setExistingReviews(prevReviews => [...prevReviews, newReview]);
        }

        alert(editingReviewId ? 'Review updated successfully!' : 'Review submitted successfully!');
        setShowReviewFormFor(null);
        setEditingReviewId(null);
        setRatingInput(0);
        setCommentInput('');
      } else {
        alert(`Failed to submit review: ${responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review: ' + error.message);
    }
  };

  const handleEditReview = (item) => {
    const review = getExistingReview(item.id);
    if (review) {
      setEditingReviewId(review.id);
      setRatingInput(review.rating);
      setCommentInput(review.comment);
      setShowReviewFormFor(item.id);
    }
  };

  const filteredItems = getFilteredItems();

  if (loading) {
    return <div className="buyer-reviews-page"><p>Loading...</p></div>;
  }

  return (
    <div className="buyer-reviews-page">
      {/* Buyer Info */}
      <div className="buyer-info">
        <div className="buyer-avatar">👤</div>
        <div>
          <h2>{userDetails?.firstName || user?.firstName || 'User'} {userDetails?.lastName || user?.lastName || ''}</h2>
          <p>Buyer ID: {user?.id}</p>
        </div>
      </div>

      <h2>My Reviews</h2>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['Not Reviewed', 'Reviewed'].map(filter => (
            <button
              key={filter}
              className={`filter-tab ${selectedFilter === filter ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="orders-list">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const existingReview = getExistingReview(item.id);
            const isEditing = showReviewFormFor === item.id && editingReviewId;

            return (
              <div key={item.id} className="order-card">
                <div className="order-info">
                  <p><strong>Order ID:</strong> {item.order.id}</p>
                  <p><strong>Seller:</strong> {item.fishListing?.fisherman?.firstName} {item.fishListing?.fisherman?.lastName}</p>
                  <p><strong>Product:</strong> {item.fishListing?.fishType}</p>
                  <p><strong>Quantity:</strong> {item.quantity}</p>
                  <p><strong>Subtotal:</strong> {(item.quantity * item.fishListing?.price).toFixed(2)} THB</p>
                  <p><strong>Status:</strong> {item.order.status}</p>

                  {existingReview && !isEditing && (
                    <>
                      <p><strong>Your Rating:</strong> {"★".repeat(existingReview.rating)} ({existingReview.rating}/5)</p>
                      <p><strong>Your Comment:</strong> {existingReview.comment}</p>
                      <p><strong>Review Date:</strong> {new Date(existingReview.reviewDate).toLocaleDateString()}</p>
                    </>
                  )}
                </div>

                <div className="order-actions">
                  {existingReview && !isEditing ? (
                    <button className="btn edit-review" onClick={() => handleEditReview(item)}>Edit Review</button>
                  ) : !existingReview && showReviewFormFor !== item.id ? (
                    <button className="btn rate" onClick={() => setShowReviewFormFor(item.id)}>Rate</button>
                  ) : null}
                </div>

                {/* Review Form */}
                {showReviewFormFor === item.id && (
                  <div className="review-form">
                    <p>Select overall rating:</p>
                    <div className="star-input">
                      {[1,2,3,4,5].map(i => (
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn submit" onClick={() => handleSubmitReview(item.id)}>
                        {editingReviewId ? 'Update Review' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>No items to display.</p>
        )}
      </div>
    </div>
  );
};

export default BuyerReviews;
