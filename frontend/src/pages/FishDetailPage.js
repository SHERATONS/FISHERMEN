import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './FishMarket.css';

const MOCK_FISH_DATA = [
    { id: 1, name: 'Salmon Fillet', price: 12.99, species: 'Salmon', freshness: 'Caught Today', location: 'Seattle', quantity: 15, description: 'Freshly caught wild salmon, rich in omega-3, perfect for grilling or sashimi.', image: '/images/salmon.jpg' },
    { id: 2, name: 'Tuna Steak', price: 18.50, species: 'Tuna', freshness: 'Frozen', location: 'Boston', quantity: 22, description: 'Premium tuna steaks, frozen to lock in flavor. Excellent for searing or sushi.', image: '/images/tuna.jpg' },
    { id: 3, name: 'Red Snapper', price: 9.75, species: 'Snapper', freshness: 'Caught Yesterday', location: 'Miami', quantity: 8, description: 'Sweet and tender red snapper, ideal for baking or pan-frying.', image: '/images/snapper.jpg' },
    { id: 4, name: 'Mackerel', price: 5.50, species: 'Mackerel', freshness: 'Caught Today', location: 'Tokyo', quantity: 30, description: 'Rich and oily mackerel, great for smoking or grilling.', image: '/images/mackerel.jpg' },
    { id: 5, name: 'Halibut Steak', price: 15.20, species: 'Halibut', freshness: 'Caught Yesterday', location: 'Anchorage', quantity: 10, description: 'Firm and meaty halibut steaks, versatile for frying, baking, or poaching.', image: '/images/halibut.jpg' },
];

const FishDetailPage = ({ cart, setCart }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const fish = MOCK_FISH_DATA.find(f => f.id === parseInt(id));
    if (!fish) return <p>Fish not found! 🐟</p>;

    const addToCart = () => {
        setCart(prev => {
            const existing = prev.find(item => item.id === fish.id);
            if (existing) return prev.map(item => item.id === fish.id ? { ...item, quantity: item.quantity + 1 } : item);
            return [...prev, { ...fish, quantity: 1 }];
        });
    };

    return (
        <div className="fish-detail-page" style={{ maxWidth: '800px', margin: '20px auto' }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>← Back to Market</button>

            <div style={{ display: 'flex', gap: '20px' }}>
                {/* Image */}
                <img src={fish.image} alt={fish.name} style={{ width: '300px', borderRadius: '10px' }} />

                {/* Info */}
                <div>
                    <h1>{fish.name}</h1>
                    <p><strong>Price:</strong> ${fish.price.toFixed(2)}/lb</p>
                    <p><strong>Species:</strong> {fish.species}</p>
                    <p><strong>Freshness:</strong> {fish.freshness}</p>
                    <p><strong>Location:</strong> {fish.location}</p>
                    <p><strong>Available Quantity:</strong> {fish.quantity}</p>
                    <p><strong>Description:</strong> {fish.description}</p>

                    <div style={{ marginTop: '20px' }}>
                        <button onClick={addToCart} style={{ padding: '10px 20px', backgroundColor: '#ff9900', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                            Add to Cart 🛒
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FishDetailPage;
