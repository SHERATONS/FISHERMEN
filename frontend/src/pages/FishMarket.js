import React, { useState, useEffect } from 'react';
import './FishMarket.css'; // Assuming this file exists in the same directory

// --- Placeholder Data for Demonstration ---
const MOCK_FISH_DATA = [
  { id: 1, name: 'Salmon Fillet', price: 12.99, species: 'Salmon', freshness: 'Caught Today', location: 'Seattle', quantity: 15 },
  { id: 2, name: 'Tuna Steak', price: 18.50, species: 'Tuna', freshness: 'Frozen', location: 'Boston', quantity: 22 },
  { id: 3, name: 'Red Snapper', price: 9.75, species: 'Snapper', freshness: 'Caught Yesterday', location: 'Miami', quantity: 8 },
  { id: 4, name: 'Mackerel', price: 5.50, species: 'Mackerel', freshness: 'Caught Today', location: 'Tokyo', quantity: 30 },
  { id: 5, name: 'Halibut Steak', price: 15.20, species: 'Halibut', freshness: 'Caught Yesterday', location: 'Anchorage', quantity: 10 },
];

const FishMarket = () => {
  // State to hold the original list of fish (static for this demo)
  const [fishList] = useState(MOCK_FISH_DATA);
  // State to hold the list currently being displayed
  const [filteredList, setFilteredList] = useState(MOCK_FISH_DATA);
  // States for search/filter input values
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedFreshness, setSelectedFreshness] = useState(''); // New state for freshness filter

  // useEffect hook handles all filtering logic whenever dependencies change
  useEffect(() => {
    let updatedList = fishList;

    // 1. Apply Search Term
    if (searchTerm) {
      updatedList = updatedList.filter(fish =>
        fish.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Apply Species Filter
    if (selectedSpecies) {
      updatedList = updatedList.filter(fish =>
        fish.species === selectedSpecies
      );
    }

    // 3. Apply Freshness Filter
    if (selectedFreshness) {
      updatedList = updatedList.filter(fish =>
        fish.freshness === selectedFreshness
      );
    }

    setFilteredList(updatedList);
    
  // Dependencies: The filtering runs every time one of these state variables changes
  }, [searchTerm, selectedSpecies, selectedFreshness, fishList]); 


  return (
    <div className="fish-market-page">
      <h1>Fresh Fish Market 🎣</h1>

      {/* --- SEARCH BAR (Full Width) --- */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for fish (e.g., Salmon, Tuna)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- CONTAINER FOR 2-COLUMN LAYOUT (Filter & List) --- */}
      <div className="fish-list-container">
          
          {/* --- FILTER PANEL (Left Column on wide screens) --- */}
          <div className="filter-panel">
            <h3>Filters</h3>
            
            {/* Species Filter */}
            <label htmlFor="species-select">Species:</label>
            <select
              id="species-select"
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
            >
              <option value="">All Species</option>
              {/* Dynamically get unique species */}
              {Array.from(new Set(MOCK_FISH_DATA.map(f => f.species))).map(species => (
                <option key={species} value={species}>{species}</option>
              ))}
            </select>
            
            {/* Freshness Filter */}
            <label htmlFor="freshness-select">Freshness:</label>
            <select
              id="freshness-select"
              value={selectedFreshness}
              onChange={(e) => setSelectedFreshness(e.target.value)}
            >
              <option value="">Any Freshness</option>
              {/* Dynamically get unique freshness options */}
              {Array.from(new Set(MOCK_FISH_DATA.map(f => f.freshness))).map(freshness => (
                <option key={freshness} value={freshness}>{freshness}</option>
              ))}
            </select>
            
            {/* Price Range Filter (Placeholder) */}
            <div className="filter-placeholder">
              <p>Price Range Filter coming soon...</p>
            </div>
          </div>
          
          {/* --- LIST OF FISH (Right Column on wide screens) --- */}
          <div className="fish-display-area">
              <h2>Available Listings ({filteredList.length})</h2>
              
              <div className="fish-list">
                {filteredList.length > 0 ? (
                  filteredList.map(fish => (
                    <div key={fish.id} className="fish-card">
                      <h3>{fish.name}</h3>
                      <p>Price: <strong>${fish.price.toFixed(2)}</strong>/lb</p>
                      <p>Species: {fish.species}</p>
                      <p>Freshness: <strong>{fish.freshness}</strong></p>
                      <p>Location: {fish.location}</p>
                      <button>View Details</button>
                    </div>
                  ))
                ) : (
                  <p className="no-results-message">No fish found matching your criteria. Try widening your search! 🔎</p>
                )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default FishMarket;