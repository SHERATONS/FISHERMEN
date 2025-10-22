import React, { useState } from "react";
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

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >
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
