import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FishMarket.css';

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
    const navigate = useNavigate();

    // Fetch data from API
    useEffect(() => {
        fetch("http://localhost:8080/api/fishListings/list")
            .then(res => res.json())
            .then(data => {
                setFishList(data);
                setFilteredList(data);
            })
            .catch(err => console.error("Error fetching fish listings:", err));
    }, []);

    // Filter Logic
    useEffect(() => {
        let updatedList = [...fishList];

        if (searchTerm) {
            updatedList = updatedList.filter(fish =>
                fish.fishType?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedSpecies) {
            updatedList = updatedList.filter(fish =>
                fish.fishType === selectedSpecies
            );
        }

        if (selectedFreshness) {
            updatedList = updatedList.filter(fish =>
                fish.status === selectedFreshness
            );
        }

        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);

        if (!isNaN(min) && min >= 0) {
            updatedList = updatedList.filter(fish => fish.price >= min);
        }

        if (!isNaN(max) && max >= 0) {
            updatedList = updatedList.filter(fish => fish.price <= max);
        }

        setFilteredList(updatedList);
    }, [searchTerm, selectedSpecies, selectedFreshness, minPrice, maxPrice, fishList]);

    // Cart Functions
    const addToCart = (fish) => {
        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === fish.id);
            if (existing) {
                return prevCart.map(item =>
                    item.id === fish.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { ...fish, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (id) => {
        setCart(prevCart => prevCart.filter(item => item.id !== id));
    };

    const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const handleCheckout = () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        navigate("/payment", { state: { totalAmount: totalPrice } });
    };

    // Modal Functions
    const openModal = (fish) => setSelectedFish(fish);
    const closeModal = () => setSelectedFish(null);

    // Helper: Date Formatter
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    return (
        <div className="fish-market-page">
            <h1>Fresh Fish Market 🎣</h1>

            {/* Search Bar */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search for fish (e.g., Salmon, Tuna)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="fish-list-container">
                {/* Filter Panel */}
                <div className="filter-panel">
                    <h3>Filters</h3>
                    <label>Species:</label>
                    <select value={selectedSpecies} onChange={(e) => setSelectedSpecies(e.target.value)}>
                        <option value="">All Species</option>
                        {Array.from(new Set(fishList.map(f => f.fishType))).map(species => (
                            <option key={species} value={species}>{species}</option>
                        ))}
                    </select>

                    <label>Status (Freshness):</label>
                    <select value={selectedFreshness} onChange={(e) => setSelectedFreshness(e.target.value)}>
                        <option value="">Any Status</option>
                        {Array.from(new Set(fishList.map(f => f.status))).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>

                    <label>Price Range (Total ฿):</label>
                    <div className="price-inputs">
                        <input
                            type="number"
                            placeholder="Min Price"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            min="0"
                        />
                        <input
                            type="number"
                            placeholder="Max Price"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            min="0"
                        />
                    </div>
                </div>

                {/* Fish List */}
                <div className="fish-display-area">
                    <h2>Available Listings ({filteredList.length})</h2>
                    <div className="fish-list">
                        {filteredList.map(fish => (
                            <div
                                key={fish.id}
                                className="fish-card"
                                onClick={() => openModal(fish)}
                                style={{ cursor: 'pointer' }}
                            >
                                <h2>{fish.fishType}</h2>
                                {/* --- ส่วนที่เพิ่มและแก้ไข --- */}
                                <p>Price: <strong>฿ {fish.price?.toFixed(2)}</strong></p>
                                <p>Location: {fish.location}</p>
                                <p>Status: {fish.status}</p>
                                <p>Date Caught: {formatDate(fish.catchDate)}</p>
                                <button onClick={(e) => { e.stopPropagation(); addToCart(fish); }}>
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/*  Cart Panel */}
                <div className="cart-panel">
                    <h3>🛒 Your Cart</h3>
                    {cart.length === 0 ? (
                        <p>Your cart is empty.</p>
                    ) : (
                        <ul>
                            {cart.map(item => (
                                <li key={item.id}>
                                    {item.fishType} ({item.weightInKg}kg) x {item.quantity} - ฿{(item.price * item.quantity).toFixed(2)}
                                    <button onClick={() => removeFromCart(item.id)}>✕</button>
                                </li>
                            ))}
                        </ul>
                    )}
                    {cart.length > 0 && (
                        <div className="cart-total">
                            <strong>Total: ฿{totalPrice.toFixed(2)}</strong>
                            <button className="checkout-btn" onClick={handleCheckout}>
                                Checkout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/*  Modal */}
            {selectedFish && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal}>✕</button>
                        <h2>{selectedFish.fishType}</h2>    
                        {/* --- Modal --- */}
                        <div className="modal-details">
                            <p><strong>Price:</strong> ฿{selectedFish.price?.toFixed(2)}</p>
                            <p><strong>Status:</strong> {selectedFish.status}</p>
                            <p><strong>Location:</strong> {selectedFish.location}</p>
                            <p><strong>Date Caught:</strong> {formatDate(selectedFish.catchDate)}</p>
                        </div>
                        {/* ------------------------ */}

                        <button className="add-to-cart-btn" onClick={() => addToCart(selectedFish)}>
                            Add to Cart
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FishMarket;