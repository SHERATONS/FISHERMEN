import { useAuth } from "../AuthContext";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, User, Mail, Lock } from "lucide-react";
import axios from "axios";

export default function LoginRegisPage() {
    const navigate = useNavigate();
    const { login } = useAuth(); 
    const [isRegister, setIsRegister] = useState(false);
    const [role, setRole] = useState(""); // "BUYER" or "FISHERMAN"
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [location, setLocation] = useState("");
    const [profileInfo, setProfileInfo] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);

    const inputContainerStyle = {
        position: "relative",
        marginBottom: "12px",
    };

    const iconStyle = {
        position: "absolute",
        top: "50%",
        left: "12px",
        transform: "translateY(-50%)",
        color: "#888",
    };

    const inputStyle = {
        width: "100%",
        padding: "12px 12px 12px 40px",
        borderRadius: "10px",
        border: "1px solid #ccc",
        boxSizing: "border-box",
        fontSize: "15px",
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password.trim() || (!username.trim() && !email.trim())) return alert("Username/email and password are required");
        if (isRegister){
            if (!firstName.trim() || !lastName.trim() || !username.trim() || password !== confirmPassword)
                {return alert("Please fill all fields and check password confirmation");}
            if (!role) return alert("Please select your role.");
        }

        try {
            let response;
            if (isRegister) {
                const payload = {
                    firstName,
                    lastName,
                    username,
                    email,
                    password,
                    role: role.toUpperCase(),
                    location,
                    profileInfo,
                };
                response = await axios.post("http://localhost:8080/api/users/register", payload); 
            } else {
                const payload = { username: username || email, password };
                response = await axios.post("http://localhost:8080/api/users/login", payload); 
                
                let userRole = null;
                let userId = null;
                if (typeof response.data === "string") {
                    const roleMatch = response.data.match(/"role"\s*:\s*"(\w+)"/);
                    const idMatch = response.data.match(/"id"\s*:\s*"([\w\d]+)"/);

                    if (roleMatch) userRole = roleMatch[1];
                    if (idMatch) userId = idMatch[1];

                    if (!userRole || !userId) {
                        alert("Login failed: unable to determine role or ID");
                        return;
                    }
                } else {
                    userRole = response.data.role;
                    userId = response.data.id;
                }
                login({ role: userRole, id: userId });
                // console.log("User role:", userRole);
                setTimeout(() => {
                    if (userRole === "FISHERMAN") navigate("/upload");
                    else if (userRole === "BUYER") navigate("/market");
                }, 1000);
                return;
            }

            setShowPopup(true);
            setPopupVisible(true);
            setTimeout(() => setPopupVisible(false), 2300);
            setTimeout(() => setShowPopup(false), 3000);

            // Reset form
            setFirstName("");
            setLastName("");
            setUsername("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            if (isRegister) setRole("");
            setLocation("");
            setProfileInfo("");

        } catch (err) {
            alert(err.response?.data || "Error submitting form");
        }
    };

    return (
        <div
            style={{
                maxWidth: "500px",
                margin: "50px auto",
                padding: "20px",
                background: "#fff",
                borderRadius: "20px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
                fontFamily: "Poppins, sans-serif",
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
                {isRegister ? "Register" : "Login"}
            </h2>

            {/* Role Selection */}
            {isRegister && (
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "15px" }}>
                <button
                    type="button"
                    onClick={() => setRole("BUYER")}
                    style={{
                        flex: 1,
                        padding: "10px",
                        background: role === "BUYER" ? "#0077b6" : "#f1f1f1",
                        color: role === "BUYER" ? "#fff" : "#000",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    Buyer
                </button>
                <button
                    type="button"
                    onClick={() => setRole("FISHERMAN")}
                    style={{
                        flex: 1,
                        padding: "10px",
                        background: role === "FISHERMAN" ? "#0077b6" : "#f1f1f1",
                        color: role === "FISHERMAN" ? "#fff" : "#000",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    Fisherman
                </button>
            </div>
            )}

            <form onSubmit={handleSubmit}>
                {isRegister && (
                    <>
                        <div style={inputContainerStyle}>
                            <User size={18} style={iconStyle} />
                            <input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        <div style={inputContainerStyle}>
                            <User size={18} style={iconStyle} />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        <div style={inputContainerStyle}>
                            <User size={18} style={iconStyle} />
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        <div style={inputContainerStyle}>
                            <User size={18} style={iconStyle} />
                            <input
                                type="text"
                                placeholder="Location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        <div style={inputContainerStyle}>
                            <User size={18} style={iconStyle} />
                            <input
                                type="text"
                                placeholder="Profile Info"
                                value={profileInfo}
                                onChange={(e) => setProfileInfo(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    </>
                )}

                {/* Login field (username or email) */}
                {!isRegister && (
                    <div style={inputContainerStyle}>
                        <User size={18} style={iconStyle} />
                        <input
                            type="text"
                            placeholder="Username or Email"
                            value={username || email}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val.includes("@")) setEmail(val);
                                else setUsername(val);
                            }}
                            style={inputStyle}
                        />
                    </div>
                )}

                <div style={inputContainerStyle}>
                    <Lock size={18} style={iconStyle} />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                {isRegister && (
                    <div style={inputContainerStyle}>
                        <Lock size={18} style={iconStyle} />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                )}

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
                    }}
                >
                    {isRegister ? "Register" : "Login"}
                </button>

                <p
                    style={{
                        textAlign: "center",
                        marginTop: "15px",
                        fontSize: "14px",
                        color: "#555",
                    }}
                >
                    {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                    <span
                        onClick={() => setIsRegister(!isRegister)}
                        style={{ color: "#0077b6", cursor: "pointer", fontWeight: "bold" }}
                    >
            {isRegister ? "Login" : "Register"}
          </span>
                </p>
            </form>

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
                        width: "300px",
                        height: "300px",
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
                        {isRegister ? "Registration Successful" : "Login Successful"}
                    </p>
                </div>
            )}
        </div>
    );
}
