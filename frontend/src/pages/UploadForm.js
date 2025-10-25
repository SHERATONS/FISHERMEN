import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle } from "lucide-react";

export default function UploadForm() {
  const [fisherName, setFisherName] = useState("");
  const [kindOfFish, setKindOfFish] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  // for user story 2
  const [marketPrices, setMarketPrices] = useState([]);
  const [selectedFish, setSelectedFish] = useState("");
  const [calcWeight, setCalcWeight] = useState("");
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  // Simulated fetch for fair market prices (you can replace this with a backend API)
  useEffect(() => {
    const fetchMarketPrices = async () => {
      try {
        // Example static data
        const data = [
            { kind: "Tuna", fairPrice: 150 },
            { kind: "Mackerel", fairPrice: 90 },
            { kind: "Snapper", fairPrice: 120 },
            { kind: "Tilapia", fairPrice: 70 },
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
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    marginBottom: "10px",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fisherName.trim()) {
      alert("Please enter fisher's name");
      return;
    }
    if (!kindOfFish.trim()) {
      alert("Please enter kind of fish");
      return;
    }
    if (!image) {
      alert("Please select an image");
      return;
    }
    if (weight <= 0) {
      alert("Weight must be greater than 0!");
      return;
    }
    if (price <= 0) {
      alert("Price must be greater than 0!");
      return;
    }

    const formData = new FormData();
    formData.append("fisherName", fisherName);
    formData.append("kindOfFish", kindOfFish);
    formData.append("weight", weight);
    formData.append("price", price);
    formData.append("image", image);

    try {
      const res = await axios.post("http://localhost:8080/api/fish/upload", formData);

      // Show popup
      setShowPopup(true);
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 2500);
      setTimeout(() => setShowPopup(false), 3000);

      setMessage(`Upload successful: ${res.data.kindOfFish}`);
      // Reset form
      setFisherName("");
      setKindOfFish("");
      setWeight("");
      setPrice("");
      setImage(null);
    } catch (err) {
      console.error(err);
      setMessage("Upload failed: " + (err.response?.data || err.message));
    }
  };

  const fairPriceForFish = marketPrices.find(
      (item) => item.kind.toLowerCase() === kindOfFish.toLowerCase()
  )?.fairPrice;

  const calculateFairPrice = () => {
    if (!selectedFish || !calcWeight) {
      alert("Please select a fish and enter weight!");
      return;
    }

    const fishData = marketPrices.find(
        (item) => item.kind.toLowerCase() === selectedFish.toLowerCase()
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
          }}
      >
        {/* === Left Side: Uploaded Fish Table === */}
        <div style={{ flex: 1, background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#023047" }}>Upload Daily Catch</h2>

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
                placeholder="Kind of Fish"
                value={kindOfFish}
                onChange={(e) => setKindOfFish(e.target.value)}
                style={inputStyle}
            />
            <input
                type="number"
                placeholder="Weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                style={inputStyle}
            />
            <input
                type="number"
                placeholder="Price"
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
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
            >
              Upload
            </button>

            {message && (
                <p style={{ marginTop: "15px", fontWeight: "bold", color: "#1b4332", textAlign: "center" }}>
                  {message}
                </p>
            )}
          </form>
        </div>

        {/* === Right Side: Market Prices + Calculator === */}
        <div style={{ flex: 0.6, display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* === Fair Market Prices Table === */}
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: "10px", color: "#023047", textAlign: "center" }}>Fair Market Prices</h3>
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
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Kind of Fish</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Fair Price (THB/kg)</th>
              </tr>
              </thead>
              <tbody>
              {marketPrices.map((fish, index) => (
                  <tr key={index}>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{fish.kind}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{fish.fairPrice}</td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          {/* === Fair Price Calculator === */}
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <h3 style={{ color: "#023047", textAlign: "center" }}>Fair Price Calculator</h3>
            <p style={{ fontSize: "14px", color: "#555", textAlign: "center" }}>
              Select fish type and enter weight to estimate fair total price.
            </p>

            {/* Fish selection dropdown */}
            <select
                value={selectedFish}
                onChange={(e) => setSelectedFish(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                  marginBottom: "10px",
                }}
            >
              <option value="">-- Select Fish Type --</option>
              {marketPrices.map((fish, index) => (
                  <option key={index} value={fish.kind}>
                    {fish.kind}
                  </option>
              ))}
            </select>

            {/* Weight input */}
            <input
                type="number"
                placeholder="Weight (kg)"
                value={calcWeight}
                onChange={(e) => setCalcWeight(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                  marginBottom: "10px",
                }}
            />

            {/* Calculate button */}
            <button
                type="button"
                onClick={calculateFairPrice}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#2a9d8f",
                  color: "#fff",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginTop: "5px",
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

        {/* Popup */}
        {showPopup && (
            <div
                style={{
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: popupVisible ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.5)",
                  background: "#2a9d8f",
                  borderRadius: "50%",
                  width: "150px",
                  height: "150px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 20px rgba(42,157,143,0.25)",
                  zIndex: 1000,
                  color: "#fff",
                  textAlign: "center",
                  opacity: popupVisible ? 1 : 0,
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                }}
            >
              <CheckCircle size={50} />
              <p style={{ marginTop: "10px", fontWeight: "bold", fontSize: "14px" }}>Upload Successful</p>
            </div>
        )}
      </div>
  );
}