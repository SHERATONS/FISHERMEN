import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../AuthContext";
import { CheckCircle, User, Mail, Lock } from "lucide-react";

const FishMarket = () => {
  const [fishList, setFishList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedFreshness, setSelectedFreshness] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedFish, setSelectedFish] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    const loadFish = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/fishListings/list");
        const data = await res.json();
        setFishList(data);
        setFilteredList(data);
      } catch (err) {
        console.error("Error fetching fish listings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFish();
  }, []);


  useEffect(() => {
    let updated = [...fishList];
    if (searchTerm)
      updated = updated.filter(f => f.fishType?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedSpecies)
      updated = updated.filter(f => f.fishType === selectedSpecies);
    if (selectedFreshness)
      updated = updated.filter(f => f.status === selectedFreshness);

    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) updated = updated.filter(f => f.price >= min);
    if (!isNaN(max)) updated = updated.filter(f => f.price <= max);

    setFilteredList(updated);
  }, [searchTerm, selectedSpecies, selectedFreshness, minPrice, maxPrice, fishList]);

  const addToCart = (fish) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === fish.id);
      return existing
        ? prev.map(i => i.id === fish.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...fish, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleCheckout = () => {
    if (!cart.length) return alert("Your cart is empty!");
    navigate("/payment", { state: { totalAmount: totalPrice } });
  };

  const openModal = (fish) => setSelectedFish(fish);
  const closeModal = () => setSelectedFish(null);
  const formatDate = (d) => new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="fish-market-page">
      <style>{`
        .fish-img-wrapper {
          width: 100%;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .fish-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 10px;
          transition: transform 0.3s ease;
        }

        .fish-image:hover {
          transform: scale(1.05);
        }

        .loading-text {
          text-align: center;
          font-size: 1rem;
          color: #555;
          padding: 20px;
        }

        .fish-market-page {
          font-family: 'Inter', 'Segoe UI', sans-serif;
          background-color: #f5f8fa;
          min-height: 100vh;
          padding: 20px;
          color: #023047;
        }

        .fish-market-page h1 {
          text-align: center;
          color: #023047;
          margin-bottom: 25px;
          font-size: 2rem;
          letter-spacing: 0.5px;
        }

        .search-bar {
          text-align: center;
          margin-bottom: 25px;
        }

        .search-bar input {
          width: 60%;
          max-width: 500px;
          padding: 12px 15px;
          border-radius: 25px;
          border: 1.5px solid #ccc;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .search-bar input:focus {
          outline: none;
          border-color: #219ebc;
          box-shadow: 0 0 6px rgba(33, 158, 188, 0.3);
        }

        .fish-list-container {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 20px;
        }

        .filter-panel {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          height: fit-content;
        }

        .filter-panel h3 {
          margin-bottom: 15px;
          color: #0077b6;
        }

        .filter-panel label {
          display: block;
          font-weight: bold;
          margin-top: 10px;
        }

        .price-inputs {
          display: flex;
          gap: 10px;
        }

        .price-inputs input {
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #ccc;
          width: 50%;
          box-sizing: border-box;
        }

        .filter-panel select {
          width: 100%;
          padding: 8px 10px;
          border-radius: 6px;
          border: 1px solid #ccc;
          margin-top: 5px;
        }

        .fish-display-area {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .fish-display-area h2 {
          color: #0077b6;
          margin-bottom: 15px;
        }

        .fish-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
        }

        .fish-card {
          background-color: #f0f9ff;
          border-radius: 13px;
          padding: 9px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid #dbe9f5;
        }

        .fish-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .fish-card p {
          margin: 3px 0;
          color: #333;
          font-size: 0.9rem;
        }

        .fish-card button {
          margin-top: 10px;
          width: 100%;
          padding: 8px;
          border: none;
          border-radius: 8px;
          background-color: #0077b6;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .fish-card button:hover {
          background-color: #023e8a;
        }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          max-width: 700px;
          width: 90%;
          max-height: 90%;
          overflow-y: auto;
          position: relative;
        }

        .modal-close-btn {
          position: absolute;
          top: 10px; right: 10px;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }

        .modal-image {
          width: 100%;
          border-radius: 10px;
          margin-bottom: 15px;
        }

        .add-to-cart-btn {
          margin-top: 10px;
          width: 20%;
          padding: 8px;
          border: none;
          border-radius: 8px;
          background-color: #0077b6;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .add-to-cart-btn:hover {
          background-color: #023e8a;
        }

        .cart-panel {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          height: fit-content;
          max-height: 600px;
          overflow-y: auto;
        }

        .cart-panel h3 {
          color: #0077b6;
          margin-bottom: 10px;
        }

        .cart-panel ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .cart-panel li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
          font-size: 0.95rem;
        }

        .cart-panel li button {
          border: none;
          background: none;
          color: #d90429;
          cursor: pointer;
          font-size: 1rem;
        }

        .cart-total {
          margin-top: 15px;
          text-align: center;
          font-size: 1.1rem;
        }

        .checkout-btn {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background-color: #219ebc;
          color: white;
          font-weight: bold;
          cursor: pointer;
          margin-top: 10px;
        }

        .checkout-btn:hover {
          background-color: #0077b6;
        }

        @media (max-width: 992px) {
          .fish-list-container {
            grid-template-columns: 1fr;
          }

          .filter-panel,
          .fish-display-area,
          .cart-panel {
            width: 100%;
          }

          .search-bar input {
            width: 90%;
          }

          .cart-panel {
            max-height: none;
          }
          
        }
        .fish-list-container.full-width-display {
          /* Set a 1fr filter panel and a 3fr display area */
          grid-template-columns: 1fr 3fr; 
        }
        
        /* Optional: Make the fish display area take up the remaining space */
        .fish-list-container.full-width-display .fish-display-area {
          grid-column: 2 / -1; /* Stretch across the second and last column */
        }
        
        /* Ensure the filter panel takes the first column */
        .fish-list-container.full-width-display .filter-panel {
          grid-column: 1 / 2;
        }
          `}</style>

      <h1>Fresh Fish Market 🎣</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for fish (e.g., Salmon, Tuna)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={`fish-list-container ${user?.role !== "BUYER" ? 'full-width-display' : ''}`}>
        <div className="filter-panel">
          <h3>Filters</h3>
          <label>Species:</label>
          <select value={selectedSpecies} onChange={(e) => setSelectedSpecies(e.target.value)}>
            <option value="">All Species</option>
            {Array.from(new Set(fishList.map(f => f.fishType))).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <label>Status (Freshness):</label>
          <select value={selectedFreshness} onChange={(e) => setSelectedFreshness(e.target.value)}>
            <option value="">Any Status</option>
            {Array.from(new Set(fishList.map(f => f.status))).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <label>Price Range (฿):</label>
          <div className="price-inputs">
            <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
        </div>

        <div className="fish-display-area">
          <h2>Available Listings ({filteredList.length})</h2>
          <div className="fish-list">
            {loading ? (
              <p className="loading-text">🐟 Loading fresh catches...</p>
            ) : filteredList.length === 0 ? (
              <p className="loading-text">No fish listings found.</p>
            ) : (
              filteredList.map(fish => (
                <div key={fish.id} className="fish-card" onClick={() => openModal(fish)}>
                  <div className="fish-img-wrapper">
                    {fish.photoUrl && (
                      <img src={fish.photoUrl} alt={fish.fishType} className="fish-image" loading="lazy" />
                    )}
                  </div>
                  <h2>{fish.fishType}</h2>
                  <p>Price: <strong>฿ {fish.price?.toFixed(2)}</strong></p>
                  <p>Location: {fish.location}</p>
                  <p>Status: {fish.status}</p>
                  <p>Date Caught: {formatDate(fish.catchDate)}</p>
                  {user?.role === "BUYER" && (
              <button onClick={(e) => { e.stopPropagation(); addToCart(fish); }}>Add to Cart</button>
            )}
                </div>
              ))
            )}
          </div>
        </div>

        {user?.role === "BUYER" && (
          <div className="cart-panel">
            <h3>🛒 Your Cart</h3>
            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                <ul>
                  {cart.map(i => (
                    <li key={i.id}>
                      {i.fishType} ({i.weightInKg}kg) x {i.quantity} - ฿{(i.price * i.quantity).toFixed(2)}
                      <button onClick={() => removeFromCart(i.id)}>✕</button>
                    </li>
                  ))}
                </ul>
                <div className="cart-total">
                  <strong>Total: ฿{totalPrice.toFixed(2)}</strong>
                  <button className="checkout-btn" onClick={handleCheckout}>Checkout</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {selectedFish && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>✕</button>
            <h2>{selectedFish.fishType}</h2>
            {selectedFish.photoUrl && (
              <img src={selectedFish.photoUrl} alt={selectedFish.fishType} className="modal-image" />
            )}
            <div className="modal-details">
              <p><strong>Price:</strong> ฿{selectedFish.price?.toFixed(2)}</p>
              <p><strong>Status:</strong> {selectedFish.status}</p>
              <p><strong>Location:</strong> {selectedFish.location}</p>
              <p><strong>Date Caught:</strong> {formatDate(selectedFish.catchDate)}</p>
            </div>
            {user?.role === "BUYER" && (
              <button className="add-to-cart-btn" onClick={() => addToCart(selectedFish)}>Add to Cart</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default FishMarket;
