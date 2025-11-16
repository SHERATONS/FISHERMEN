import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function UploadForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fisherName, setFisherName] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("SENT_FRESH"); // Default status
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);

  const [marketPrices, setMarketPrices] = useState([]);
  const [selectedFish, setSelectedFish] = useState("");
  const [calcWeight, setCalcWeight] = useState("");
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [catchDate, setCatchDate] = useState(() => {
    const now = new Date();
    const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 10);
    return localISOTime;
  });

  useEffect(() => {
    const fetchMarketPrices = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/fishListings/list");
        const fetchedData = res.data;
        const priceMap = {};
        fetchedData.forEach((item) => {
          if (!priceMap[item.fishType]) {
            priceMap[item.fishType] = { total: 0, count: 0 };
          }
          priceMap[item.fishType].total += item.price;
          priceMap[item.fishType].count += 1;
        });

        const averagedPrices = Object.keys(priceMap).map((fishType) => ({
          fishType,
          fairPrice: parseFloat(
            (priceMap[fishType].total / priceMap[fishType].count).toFixed(2)
          ),
        }));

        setMarketPrices(averagedPrices);
      } catch (err) {
        console.error("Error fetching market prices:", err);
      }
    };
    fetchMarketPrices();
  }, []);

  useEffect(() => {
    if (user?.id) {
      setFisherName(user.id);
    }
  }, [user]);

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    marginBottom: "10px",
    fontSize: "16px",
  };

  const labelStyle = {
    display: "block",
    fontWeight: "bold",
    color: "#023047",
    fontSize: "15px",
    marginBottom: "5px",
    marginTop: "10px",
    textAlign: "left"
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!fisherName.trim()) return alert("Please enter fisher's id");
    if (!selectedFish) return alert("Please select at least one species");
    if (!location.trim()) return alert("Please enter location");
    if (!weight || weight <= 0) return alert("Weight must be greater than 0!");
    if (!price || price <= 0) return alert("Price must be greater than 0!");
    if (!image) return alert("Please select an image");

    try {
      const formData = new FormData();
      formData.append("fishType", selectedFish);
      formData.append("weightInKg", parseFloat(weight));
      formData.append("price", parseFloat(price));
      formData.append("catchDate", new Date(catchDate).toISOString());
      formData.append("fishermanId", fisherName);
      formData.append("location", location);
      formData.append("status", status);
      formData.append("image", image);

      console.log("Sending data:", {
        fishType: selectedFish,
        weightInKg: weight,
        price: price,
        status: status,
        location: location
      });

      const res = await axios.post(
        "http://localhost:8080/api/fishListings/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload successful:", res.data);
      setMessage("Upload successful!");
      
      setShowPopup(true);
      setTimeout(() => setPopupVisible(true), 100);
      setTimeout(() => setPopupVisible(false), 2300);
      setTimeout(() => setShowPopup(false), 3000);

      // Reset form
      setFisherName(user?.id || "");
      setSelectedFish("");
      setWeight("");
      setPrice("");
      setLocation("");
      setStatus("SENT_FRESH");
      setImage(null);
      setImagePreview(null);

      setTimeout(() => navigate("/market"), 3000);
    } catch (err) {
      console.error("Error uploading:", err);
      alert("Error uploading fish: " + (err.response?.data || err.message));
    }
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
      {/* LEFT SIDE - Upload Form */}
      <div
        style={{
          flex: 1,
          background: "#fff",
          padding: "25px",
          borderRadius: "20px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
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
          {/* Fisher ID */}
          <label style={labelStyle}>Fisher ID:</label>
          <input
            type="text"
            value={user?.id || ""}
            onChange={(e) => setFisherName(e.target.value)}
            style={{...inputStyle, backgroundColor: "#f5f5f5"}}
            disabled
          />

          {/* Location */}
          <label style={labelStyle}>Location:</label>
          <input
            type="text"
            placeholder="e.g., Phuket, Krabi"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={inputStyle}
          />

          {/* Fish Species */}
          <label style={labelStyle}>Fish Species:</label>
          <input
            list="fishOptions"
            type="text"
            value={selectedFish}
            onChange={(e) => {
              const inputValue = e.target.value.trim();
              if (inputValue === "") {
                setSelectedFish("");
              } else {
                const formatted =
                  inputValue.charAt(0).toUpperCase() + inputValue.slice(1).toLowerCase();
                setSelectedFish(formatted);
              }
            }}
            placeholder="Enter or select fish type"
            style={inputStyle}
          />
          <datalist id="fishOptions">
            {marketPrices.map((fish, index) => (
              <option key={index} value={fish.fishType} />
            ))}
          </datalist>

          {/* Weight */}
          <label style={labelStyle}>Weight (kg):</label>
          <input
            type="number"
            placeholder="Weight in kilograms"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            min="0"
            step="0.01"
            style={inputStyle}
          />

          {/* Price */}
          <label style={labelStyle}>Price (THB):</label>
          <input
            type="number"
            placeholder="Price per kg"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
            style={inputStyle}
          />

          {/* STATUS DROPDOWN */}
          <label style={labelStyle}>
            Delivery Status: <span style={{ color: "red" }}>*</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              ...inputStyle,
              cursor: "pointer",
              backgroundColor: "#fff",
            }}
          >
            <option value="SENT_FRESH">Sent Fresh</option>
            <option value="SENT_FROZEN">Sent Frozen</option>
          </select>

          {/* Catch Date */}
          <label style={labelStyle}>Catch Date:</label>
          <input
            type="date"
            value={catchDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setCatchDate(e.target.value)}
            style={inputStyle}
          />

          {/* Fish Photo */}
          <label style={labelStyle}>
            Fish Photo: <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={inputStyle}
            required
          />

          {/* Image Preview */}
          {imagePreview && (
            <div style={{ marginBottom: "15px", textAlign: "center" }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "250px",
                  borderRadius: "10px",
                  border: "3px solid #0077b6",
                  objectFit: "cover"
                }}
              />
              <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                📸 Preview of selected image
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              background: "#0077b6",
              color: "#fff",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "15px",
              border: "none",
              transition: "background 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.background = "#005f8a")}
            onMouseOut={(e) => (e.target.style.background = "#0077b6")}
          >
             Upload Daily Catch
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

      {/* RIGHT SIDE - Market Prices & Calculator */}
      <div
        style={{
          flex: 0.6,
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Market Prices Table */}
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "20px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ textAlign: "center", color: "#023047", marginBottom: "15px" }}>
             Fair Market Prices
          </h3>
          <div
            style={{
              maxHeight: "250px",
              overflowY: "auto",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead style={{position: "sticky", top: 0, background: "#f8f9fa"}}>
                <tr style={{ background: "#e9ecef" }}>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Species</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "right" }}>Price (THB/kg)</th>
                </tr>
              </thead>
              <tbody>
                {marketPrices.map((fish, index) => (
                  <tr key={index} style={{backgroundColor: index % 2 === 0 ? "#fff" : "#f8f9fa"}}>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{fish.fishType}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right", fontWeight: "bold" }}>
                      ฿{fish.fairPrice}
                    </td>
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
          <h3 style={{ color: "#023047", textAlign: "center", marginBottom: "10px" }}>
            Fair Price Calculator
          </h3>
          <p style={{ fontSize: "13px", color: "#666", textAlign: "center", marginBottom: "15px" }}>
            Calculate estimated fair total price
          </p>

          <label style={{...labelStyle, marginTop: "0"}}>Select Fish:</label>
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

          <label style={labelStyle}>Enter Weight (kg):</label>
          <input
            type="number"
            placeholder="Weight in kg"
            value={calcWeight}
            onChange={(e) => setCalcWeight(e.target.value)}
            min="0"
            step="0.01"
            style={inputStyle}
          />

          <button
            type="button"
            onClick={calculateFairPrice}
            style={{
              width: "100%",
              padding: "12px",
              background: "#2a9d8f",
              color: "#fff",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "15px",
              cursor: "pointer",
              border: "none",
              transition: "background 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.background = "#238276")}
            onMouseOut={(e) => (e.target.style.background = "#2a9d8f")}
          >
            Calculate
          </button>

          {calculatedPrice && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                background: "#d4f1dc",
                borderRadius: "10px",
                textAlign: "center",
                border: "2px solid #2a9d8f"
              }}
            >
              <p style={{ fontSize: "14px", color: "#1b4332", marginBottom: "5px" }}>
                Estimated Fair Total Price:
              </p>
              <p style={{ fontSize: "24px", fontWeight: "bold", color: "#1b4332", margin: 0 }}>
                ฿{calculatedPrice}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: popupVisible
              ? "translate(-50%, -50%) scale(1)"
              : "translate(-50%, -50%) scale(0.7)",
            background: "linear-gradient(135deg, #2a9d8f 0%, #238276 100%)",
            borderRadius: "30px",
            width: "340px",
            height: "340px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 12px 40px rgba(42,157,143,0.4)",
            zIndex: 1000,
            color: "#fff",
            textAlign: "center",
            opacity: popupVisible ? 1 : 0,
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <CheckCircle size={80} strokeWidth={2.5} />
          <p style={{ marginTop: "20px", fontWeight: "bold", fontSize: "20px" }}>
            Upload Successful! 
          </p>
          <p style={{ fontSize: "14px", marginTop: "8px", opacity: 0.9 }}>
            Your daily catch has been recorded.
          </p>
        </div>
      )}
    </div>
  );
}