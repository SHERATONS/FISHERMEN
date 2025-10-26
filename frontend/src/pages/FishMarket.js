import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FishMarket.css';

// --- Mock Data (ตัวอย่างสินค้า) ---
const MOCK_FISH_DATA = [
    { id: 1, name: 'Salmon', price: 380, species: 'Salmon', freshness: 'Caught Today', location: 'Seattle', quantity: 15, description: 'Fresh, wild-caught salmon fillet, perfect for grilling or pan-searing.', images: ['/images/salmon1.jpg','/images/salmon2.jpg'] },
    { id: 2, name: 'Tuna', price: 400, species: 'Tuna', freshness: 'Frozen', location: 'Boston', quantity: 22, description: 'High-quality tuna steak, ideal for sushi or searing.', images: ['/images/tuna1.jpg','/images/tuna2.jpg'] },
    { id: 3, name: 'Snapper', price: 200, species: 'Snapper', freshness: 'Caught Yesterday', location: 'Miami', quantity: 8, description: 'Delicious red snapper, perfect for baking with herbs.', images: ['/images/snapper1.jpg','/images/snapper2.jpg'] },
    { id: 4, name: 'Mackerel', price: 140, species: 'Mackerel', freshness: 'Caught Today', location: 'Tokyo', quantity: 30, description: 'Fresh mackerel with rich flavor, great for grilling.', images: ['/images/mackerel1.jpg','/images/mackerel2.jpg'] },
    { id: 5, name: 'Cod', price: 260, species: 'Cod', freshness: 'Caught Yesterday', location: 'Anchorage', quantity: 10, description: 'Tender halibut steak, ideal for pan-frying or broiling.', images: ['/images/halibut1.jpg','/images/halibut2.jpg'] },
];

const FishMarket = () => {
    const [fishList] = useState(MOCK_FISH_DATA);
    const [filteredList, setFilteredList] = useState(MOCK_FISH_DATA);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecies, setSelectedSpecies] = useState('');
    const [selectedFreshness, setSelectedFreshness] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    // Modal State
    const [selectedFish, setSelectedFish] = useState(null);
    const [galleryIndex, setGalleryIndex] = useState(0);

    // Filtering logic
    useEffect(() => {
        let updatedList = fishList;
        if (searchTerm) {
            updatedList = updatedList.filter(fish =>
                fish.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedSpecies) {
            updatedList = updatedList.filter(fish =>
                fish.species === selectedSpecies
            );
        }
        if (selectedFreshness) {
            updatedList = updatedList.filter(fish =>
                fish.freshness === selectedFreshness
            );
        }

        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);

        // Filter by Min Price
        if (!isNaN(min) && min >= 0) {
            updatedList = updatedList.filter(fish => fish.price >= min);
        }
        
        // Filter by Max Price
        if (!isNaN(max) && max >= 0) {
            updatedList = updatedList.filter(fish => fish.price <= max);
        }
        setFilteredList(updatedList);
    }, [searchTerm, selectedSpecies, selectedFreshness, minPrice, maxPrice,fishList]);

    // Cart functions
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

    // Checkout function (ไปหน้า payment เหมือนเดิม)
    const handleCheckout = () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        navigate("/payment", { state: { totalAmount: totalPrice } });
    };

    // Modal functions
    const openModal = (fish) => {
        setSelectedFish(fish);
        setGalleryIndex(0);
    };
    const closeModal = () => setSelectedFish(null);
    const nextImage = () => setGalleryIndex((prev) => (prev + 1) % selectedFish.images.length);
    const prevImage = () => setGalleryIndex((prev) => (prev - 1 + selectedFish.images.length) % selectedFish.images.length);

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
                        {Array.from(new Set(fishList.map(f => f.species))).map(species => (
                            <option key={species} value={species}>{species}</option>
                        ))}
                    </select>
                    <label>Freshness:</label>
                    <select value={selectedFreshness} onChange={(e) => setSelectedFreshness(e.target.value)}>
                        <option value="">Any Freshness</option>
                        {Array.from(new Set(fishList.map(f => f.freshness))).map(freshness => (
                            <option key={freshness} value={freshness}>{freshness}</option>
                        ))}
                    </select>
                    <label>Price Range (฿/Kg):</label>
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
                                style={{ cursor: 'pointer' }}
                                onClick={() => openModal(fish)}
                            >
                                <h3>{fish.name}</h3>
                                <p>Price: <strong> ฿ {fish.price.toFixed(2)}</strong>/Kg</p>
                                <p>Species: {fish.species}</p>
                                <p>Freshness: <strong>{fish.freshness}</strong></p>
                                <p>Location: {fish.location}</p>
                                <button onClick={(e) => { e.stopPropagation(); addToCart(fish); }}>
                                    Add to Cart 
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cart Panel */}
                <div className="cart-panel">
                    <h3>🛒 Your Cart</h3>
                    {cart.length === 0 ? <p>Your cart is empty.</p> : (
                        <ul>
                            {cart.map(item => (
                                <li key={item.id}>
                                    {item.name} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                                    <button onClick={() => removeFromCart(item.id)}>✕</button>
                                </li>
                            ))}
                        </ul>
                    )}
                    {cart.length > 0 && (
                        <div className="cart-total">
                            <strong>Total: ${totalPrice.toFixed(2)}</strong>
                            <button className="checkout-btn" onClick={handleCheckout}>Checkout</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {selectedFish && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal}>✕</button>
                        <h2>{selectedFish.name}</h2>
                        <div className="modal-gallery">
                            <button className="gallery-btn" onClick={prevImage}>‹</button>
                            <img src={selectedFish.images[galleryIndex]} alt={selectedFish.name} />
                            <button className="gallery-btn" onClick={nextImage}>›</button>
                        </div>
                        <p><strong>Price:</strong> ${selectedFish.price.toFixed(2)}/lb</p>
                        <p><strong>Species:</strong> {selectedFish.species}</p>
                        <p><strong>Freshness:</strong> {selectedFish.freshness}</p>
                        <p><strong>Location:</strong> {selectedFish.location}</p>
                        <p><strong>Available Quantity:</strong> {selectedFish.quantity}</p>
                        <p><strong>Description:</strong> {selectedFish.description}</p>
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
