import React, { useState } from "react";
import { CreditCard, Smartphone, Wallet, QrCode, CheckCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom"; // ✅ เพิ่ม import

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ รับยอดรวมจาก FishMarket (ส่งมาผ่าน navigate)
  const totalAmount = location.state?.totalAmount || 0;

  const [selectedMethod, setSelectedMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    marginBottom: "10px",
  };

  const handleCardInput = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    const groups = digits.match(/.{1,4}/g);
    setCardNumber(groups ? groups.join(" ") : "");
  };

  const handleExpiryInput = (value) => {
    let digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) {
      digits = digits.slice(0, 2) + "/" + digits.slice(2);
    }
    setExpiry(digits);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedMethod) {
      alert("Please select a payment method.");
      return;
    }

    if (selectedMethod === "card") {
      const rawCard = cardNumber.replace(/\s+/g, "");
      if (!/^\d{16}$/.test(rawCard)) {
        alert("Please enter a valid 16-digit card number.");
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        alert("Expiry must be in MM/YY format.");
        return;
      }
      const [month, year] = expiry.split("/").map(Number);
      if (month < 1 || month > 12) {
        alert("Month must be between 01 and 12.");
        return;
      }
      if (!/^\d{3,4}$/.test(cvc)) {
        alert("CVC must be 3 or 4 digits.");
        return;
      }
    } else if (selectedMethod === "mobile" && !selectedBank) {
      alert("Please select a bank.");
      return;
    } else if (selectedMethod === "ewallet" && !selectedWallet) {
      alert("Please select an e-wallet.");
      return;
    }

    // ✅ แสดง popup สำเร็จ
    setShowPopup(true);
    setPopupVisible(true);
    setTimeout(() => setPopupVisible(false), 2500);
    setTimeout(() => setShowPopup(false), 3000);

    // ✅ ข้อความสำเร็จ
    let methodText = "";
    if (selectedMethod === "card") methodText = "Card";
    else if (selectedMethod === "mobile") methodText = selectedBank || "Mobile Banking";
    else if (selectedMethod === "ewallet") methodText = selectedWallet || "E-Wallet";
    else if (selectedMethod === "promptpay") methodText = "PromptPay";
    setSuccessMessage(`Payment successful by ${methodText}`);

    // Reset fields
    setCardNumber("");
    setExpiry("");
    setCvc("");
    setSelectedBank("");
    setSelectedWallet("");
    setSelectedMethod("");

    // ✅ กลับไปหน้า Market หลังจาก 3 วินาที
    setTimeout(() => navigate("/"), 3200);
  };

  const paymentMethods = [
    { id: "card", label: "Credit / Debit Card", icon: <CreditCard size={20} /> },
    { id: "mobile", label: "Mobile Banking", icon: <Smartphone size={20} /> },
    { id: "ewallet", label: "E-Wallet", icon: <Wallet size={20} /> },
    { id: "promptpay", label: "PromptPay", icon: <QrCode size={20} /> },
  ];

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
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#023047" }}>Payment</h2>

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p style={{ color: "#555", marginBottom: "5px" }}>Total Amount</p>
          <p style={{ fontSize: "28px", fontWeight: "bold", color: "#0077b6" }}>฿{totalAmount.toFixed(2)}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Payment Method */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ marginBottom: "10px", color: "#023047" }}>Select Payment Method</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {paymentMethods.map((method) => (
                  <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 15px",
                        borderRadius: "8px",
                        border: selectedMethod === method.id ? "2px solid #0077b6" : "1px solid #ccc",
                        background: selectedMethod === method.id ? "#e0f7ff" : "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                  >
                    {method.icon}
                    <span>{method.label}</span>
                  </button>
              ))}
            </div>
          </div>

          {/* Card */}
          {selectedMethod === "card" && (
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ marginBottom: "10px", color: "#023047" }}>Card Information</h3>
                <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => handleCardInput(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    style={inputStyle}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                      type="text"
                      value={expiry}
                      onChange={(e) => handleExpiryInput(e.target.value)}
                      placeholder="MM/YY"
                      style={{ ...inputStyle, marginBottom: 0 }}
                  />
                  <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="CVC"
                      style={{ ...inputStyle, marginBottom: 0 }}
                  />
                </div>
              </div>
          )}

          {/* Mobile Banking */}
          {selectedMethod === "mobile" && (
              <div style={{ marginBottom: "20px" }}>
                <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    style={inputStyle}
                >
                  <option value="">-- Choose Bank --</option>
                  <option value="Kasikorn Bank">Kasikorn Bank</option>
                  <option value="SCB">SCB</option>
                  <option value="Bangkok Bank">Bangkok Bank</option>
                  <option value="Krungsri">Krungsri</option>
                </select>
              </div>
          )}

          {/* E-Wallet */}
          {selectedMethod === "ewallet" && (
              <div style={{ marginBottom: "20px" }}>
                <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    style={inputStyle}
                >
                  <option value="">-- Choose Wallet --</option>
                  <option value="TrueMoney">TrueMoney</option>
                  <option value="LINE Pay">LINE Pay</option>
                  <option value="Rabbit LINE Pay">Rabbit LINE Pay</option>
                  <option value="ShopeePay">ShopeePay</option>
                </select>
              </div>
          )}

          {/* PromptPay */}
          {selectedMethod === "promptpay" && (
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <img
                    src="https://api.qrserver.com/v1/create-qr-code/?data=promptpay:0812345678&size=200x200"
                    alt="PromptPay QR"
                    style={{ borderRadius: "8px" }}
                />
                <p style={{ marginTop: "5px", color: "#555", fontSize: "14px" }}>
                  Scan this QR code to complete your payment.
                </p>
              </div>
          )}

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
              }}
          >
            Confirm Payment
          </button>

          {successMessage && (
              <p style={{ marginTop: "15px", fontWeight: "bold", color: "#1b4332", textAlign: "center" }}>
                {successMessage}
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
              <p style={{ marginTop: "10px", fontWeight: "bold", fontSize: "14px" }}>
                Payment Successful
              </p>
            </div>
        )}
      </div>
  );
}
