import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UploadForm() {
  const navigate = useNavigate();
  const [fisherName, setFisherName] = useState("");
  const [fishType, setFishType] = useState([]);
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);

  const [marketPrices, setMarketPrices] = useState([]);
  const [selectedFish, setSelectedFish] = useState("");
  const [calcWeight, setCalcWeight] = useState("");
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  useEffect(() => {
      const fetchMarketPrices = async () => {
          try {
              // mock data
              const data = [
                  { fishType: "Anchovy", fairPrice: 80 },
                  { fishType: "Bluefin Tuna", fairPrice: 1000 },
                  { fishType: "Carp", fairPrice: 120 },
                  { fishType: "Catfish", fairPrice: 160 },
                  { fishType: "Cod", fairPrice: 240 },
                  { fishType: "Eel", fairPrice: 400 },
                  { fishType: "Herring", fairPrice: 100 },
                  { fishType: "Kingfish", fairPrice: 440 },
                  { fishType: "Mackerel", fairPrice: 110 },
                  { fishType: "Pollock", fairPrice: 150 },
                  { fishType: "Pomfret", fairPrice: 320 },
                  { fishType: "Salmon", fairPrice: 360 },
                  { fishType: "Sea Bass", fairPrice: 420 },
                  { fishType: "Snapper", fairPrice: 180 },
                  { fishType: "Swordfish", fairPrice: 500 },
                  { fishType: "Trout", fairPrice: 240 },
                  { fishType: "Tuna", fairPrice: 380 },
                  { fishType: "Yellowtail", fairPrice: 400 }
              ];
              setMarketPrices(data);
                  // const res = await axios.get("http://localhost:8080/api/fish/fair-prices");
                  // setMarketPrices(res.data);
                  // console.log(res.data);
              } catch (err) {
                  console.error("Error fetching market prices:", err);
              }
          };
    fetchMarketPrices();
  }, []);

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    marginBottom: "10px",
    fontSize: "16px",
  };

  const handleFishTypeChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setFishType(selected);
  };

const handleSubmit = (e) => {
  e.preventDefault();

  if (!fisherName.trim()) return alert("Please enter fisher's name");
  if (!selectedFish) return alert("Please select at least one species");
  if (!location.trim()) return alert("Please enter location");
  if (!weight || weight <= 0) return alert("Weight must be greater than 0!");
  if (!price || price <= 0) return alert("Price must be greater than 0!");
  if (!image) return alert("Please select an image");

  // แสดง popup
  setShowPopup(true);
  setTimeout(() => setPopupVisible(true), 100);
  setTimeout(() => setPopupVisible(false), 2300);
  setTimeout(() => setShowPopup(false), 3000);

  // reset form
  setFisherName("");
  setSelectedFish("");
  setWeight("");
  setPrice("");
  setLocation("");
  setImage(null);

  // redirect ไป /manage หลัง popup
  setTimeout(() => navigate("/manage"), 3000);
};

  const calculateFairPrice = () => {
    if (!selectedFish || !calcWeight) {
      alert("Please select a fish and enter weight!");
      return;
    }

    const fishData = marketPrices.find(
      (item) => item.fishType.toLowerCase() === selectedFish.toLowerCase()
    );

    if (!fishData) {
      alert("Fish type not found in market data!");
      return;
    }

    const totalFair = fishData.fairPrice * parseFloat(calcWeight);
    setCalculatedPrice(totalFair.toFixed(2));
  };

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "50px auto",
        padding: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* === Left: Upload Form === */}
      <div
        style={{
          flex: 1,
          background: "#fff",
          padding: "25px",
          borderRadius: "20px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#023047",
            fontWeight: "bold",
            fontSize: "22px",
          }}
        >
          Upload Daily Catch
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Fisher Name"
            value={fisherName}
            onChange={(e) => setFisherName(e.target.value)}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={inputStyle}
          />

          <label style={{ fontWeight: "bold", color: "#023047", fontSize: "15px" }}>

          </label>
          <select
                      value={selectedFish}
                      onChange={(e) => setSelectedFish(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">-- Select Species --</option>
                      {marketPrices.map((fish, index) => (
                        <option key={index} value={fish.fishType}>
                          {fish.fishType}
                        </option>
                      ))}
                    </select>

          <input
            type="number"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Price (THB)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={inputStyle}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            style={inputStyle}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "#0077b6",
              color: "#fff",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "10px",
              transition: "0.3s",
            }}
          >
            Upload
          </button>

          {message && (
            <p
              style={{
                marginTop: "15px",
                fontWeight: "bold",
                color: message.includes("successful") ? "#2a9d8f" : "red",
                textAlign: "center",
              }}
            >
              {message}
            </p>
          )}
        </form>
      </div>

      {/* === Right: Market Prices + Calculator === */}
      <div
        style={{
          flex: 0.6,
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Market Table */}
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "20px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ textAlign: "center", color: "#023047" }}>Fair Market Prices</h3>
            <div
                style={{
                    maxHeight: "220px", // roughly fits ~5 rows
                    overflowY: "auto",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                }}
            >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr style={{ background: "#f1f1f1" }}>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Species</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Fair Price (THB/kg)</th>
              </tr>
            </thead>
            <tbody>
              {marketPrices.map((fish, index) => (
                <tr key={index}>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{fish.fishType}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{fish.fairPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>

        {/* Fair Price Calculator */}
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "20px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: "#023047", textAlign: "center" }}>Fair Price Calculator</h3>
          <p style={{ fontSize: "14px", color: "#555", textAlign: "center" }}>
            Select fish type and enter weight to estimate fair total price.
          </p>

          <select
            value={selectedFish}
            onChange={(e) => setSelectedFish(e.target.value)}
            style={inputStyle}
          >
            <option value="">-- Select Species --</option>
            {marketPrices.map((fish, index) => (
              <option key={index} value={fish.fishType}>
                {fish.fishType}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Weight (kg)"
            value={calcWeight}
            onChange={(e) => setCalcWeight(e.target.value)}
            style={inputStyle}
          />

          <button
            type="button"
            onClick={calculateFairPrice}
            style={{
              width: "100%",
              padding: "10px",
              background: "#2a9d8f",
              color: "#fff",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Calculate Fair Value
          </button>

          {calculatedPrice && (
            <div
              style={{
                marginTop: "15px",
                textAlign: "center",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#1b4332",
              }}
            >
              💰 Estimated Fair Total Price: {calculatedPrice} THB
            </div>
          )}
        </div>
      </div>

      {/* === Popup === */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: popupVisible
              ? "translate(-50%, -50%) scale(1)"
              : "translate(-50%, -50%) scale(0.7)",
            background: "#2a9d8f",
            borderRadius: "30px",
            width: "340px",
            height: "340px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 25px rgba(42,157,143,0.3)",
            zIndex: 1000,
            color: "#fff",
            textAlign: "center",
            opacity: popupVisible ? 1 : 0,
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <CheckCircle size={80} />
          <p style={{ marginTop: "20px", fontWeight: "bold", fontSize: "18px" }}>
            Upload Successful
          </p>
          <p style={{ fontSize: "14px", marginTop: "5px" }}>
            Your daily catch has been recorded.
          </p>
        </div>
      )}
    </div>
  );
}