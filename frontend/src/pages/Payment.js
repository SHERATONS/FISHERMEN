import React, { useState } from "react";

export default function Payment() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!/^\d{16}$/.test(cardNumber.replace(/\s+/g, ""))) {
      setMessage("Please enter a valid 16-digit card number.");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setMessage("Expiry must be in MM/YY format.");
      return;
    }
    if (!/^\d{3,4}$/.test(cvc)) {
      setMessage("CVC must be 3 or 4 digits.");
      return;
    }

    // Mock submission
    setMessage(`Mock payment successful!\nCard: ${cardNumber}\nExpiry: ${expiry}\nCVC: ${cvc}`);

    // Reset form
    setCardNumber("");
    setExpiry("");
    setCvc("");
  };

  return (
    <div className="upload-card">
      <h2 className="text-center">Payment</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Card Number</label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="1234 5678 9012 3456"
            required
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label>Expiry</label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/YY"
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>CVC</label>
            <input
              type="text"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              placeholder="123"
              required
            />
          </div>
        </div>

        <button type="submit">Pay Now</button>
      </form>

      {message && (
        <p style={{ marginTop: "15px", whiteSpace: "pre-line", color: "#1b4332", fontWeight: "bold" }}>
          {message}
        </p>
      )}
    </div>
  );
}
