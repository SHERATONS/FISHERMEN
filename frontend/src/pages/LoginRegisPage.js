import { useAuth } from "../AuthContext";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, User, Mail, Lock } from "lucide-react";
import axios from "axios";

export default function LoginRegisPage() {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    
    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (user.role === "FISHERMAN") {
                navigate("/upload");
            } else if (user.role === "BUYER") {
                navigate("/market");
            }
        }
    }, [user, navigate]);

    const [isRegister, setIsRegister] = useState(false);
    const [role, setRole] = useState("");
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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Validation
        if (!password.trim() || (!username.trim() && !email.trim())) {
            setError("Username/email and password are required");
            setIsLoading(false);
            return;
        }

        if (isRegister) {
            if (!firstName.trim() || !lastName.trim() || !username.trim() || password !== confirmPassword) {
                setError("Please fill all fields and check password confirmation");
                setIsLoading(false);
                return;
            }
            if (!role) {
                setError("Please select your role");
                setIsLoading(false);
                return;
            }
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
                
                // Show success popup for registration
                setShowPopup(true);
                setPopupVisible(true);
                setTimeout(() => setPopupVisible(false), 2300);
                setTimeout(() => setShowPopup(false), 3000);

                // Reset form
                resetForm();
            } else {
                const payload = { username: username || email, password };
                response = await axios.post("http://localhost:8080/api/users/login", payload);
                
                // Parse user data from response
                let userRole = null;
                let userId = null;
                let userData = null;

                if (typeof response.data === "string") {
                    // Handle string response
                    const roleMatch = response.data.match(/"role"\s*:\s*"(\w+)"/);
                    const idMatch = response.data.match(/"id"\s*:\s*"([\w\d]+)"/);

                    if (roleMatch) userRole = roleMatch[1];
                    if (idMatch) userId = idMatch[1];
                } else if (typeof response.data === "object") {
                    // Handle object response
                    userRole = response.data.role;
                    userId = response.data.id;
                    userData = response.data;
                }

                if (!userRole || !userId) {
                    setError("Login failed: unable to determine user information");
                    setIsLoading(false);
                    return;
                }

                // Create user object for context
                const userForContext = userData || { role: userRole, id: userId };
                
                // Login user (this will store in localStorage)
                login(userForContext);
                
                console.log("Login successful, user role:", userRole);

                // Navigate based on role after a short delay
                setTimeout(() => {
                    if (userRole === "FISHERMAN") {
                        navigate("/upload");
                    } else if (userRole === "BUYER") {
                        navigate("/market");
                    } else {
                        navigate("/");
                    }
                }, 500);
            }
        } catch (err) {
            console.error("Authentication error:", err);
            if (err.response && err.response.data) {
                setError(`${isRegister ? 'Registration' : 'Login'} failed: ${err.response.data}`);
            } else {
                setError(`${isRegister ? 'Registration' : 'Login'} failed. Please try again.`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFirstName("");
        setLastName("");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setRole("");
        setLocation("");
        setProfileInfo("");
        setError("");
    };

    const switchMode = () => {
        setIsRegister(!isRegister);
        resetForm();
    };

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>
                {isRegister ? "Register" : "Login"}
            </h2>

            {/* Error Message */}
            {error && (
                <div style={errorStyle}>
                    {error}
                </div>
            )}

            {/* Role Selection for Registration */}
            {isRegister && (
                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "15px" }}>
                    <button
                        type="button"
                        onClick={() => setRole("BUYER")}
                        style={{
                            ...roleButtonStyle,
                            background: role === "BUYER" ? "#0077b6" : "#f1f1f1",
                            color: role === "BUYER" ? "#fff" : "#000",
                        }}
                    >
                        Buyer
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole("FISHERMAN")}
                        style={{
                            ...roleButtonStyle,
                            background: role === "FISHERMAN" ? "#0077b6" : "#f1f1f1",
                            color: role === "FISHERMAN" ? "#fff" : "#000",
                        }}
                    >
                        Fisherman
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Registration fields */}
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
                                disabled={isLoading}
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
                                disabled={isLoading}
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
                                disabled={isLoading}
                            />
                        </div>
                        <div style={inputContainerStyle}>
                            <Mail size={18} style={iconStyle} />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={inputStyle}
                                disabled={isLoading}
                            />
                        </div>
                        <div style={inputContainerStyle}>
                            <User size={18} style={iconStyle} />
                            <input
                                type="text"
                                placeholder="Location (Optional)"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                style={inputStyle}
                                disabled={isLoading}
                            />
                        </div>
                        <div style={inputContainerStyle}>
                            <User size={18} style={iconStyle} />
                            <textarea
                                placeholder="Profile Info (Optional)"
                                value={profileInfo}
                                onChange={(e) => setProfileInfo(e.target.value)}
                                style={{...inputStyle, minHeight: "60px", resize: "vertical"}}
                                disabled={isLoading}
                            />
                        </div>
                    </>
                )}

                {/* Login field */}
                {!isRegister && (
                    <div style={inputContainerStyle}>
                        <User size={18} style={iconStyle} />
                        <input
                            type="text"
                            placeholder="Username or Email"
                            value={username || email}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val.includes("@")) {
                                    setEmail(val);
                                    setUsername("");
                                } else {
                                    setUsername(val);
                                    setEmail("");
                                }
                            }}
                            style={inputStyle}
                            disabled={isLoading}
                        />
                    </div>
                )}

                {/* Password fields */}
                <div style={inputContainerStyle}>
                    <Lock size={18} style={iconStyle} />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                        disabled={isLoading}
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
                            disabled={isLoading}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    style={{
                        ...submitButtonStyle,
                        opacity: isLoading ? 0.7 : 1,
                        cursor: isLoading ? "not-allowed" : "pointer"
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? "Processing..." : (isRegister ? "Register" : "Login")}
                </button>

                <p style={switchTextStyle}>
                    {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                    <span onClick={switchMode} style={switchLinkStyle}>
                        {isRegister ? "Login" : "Register"}
                    </span>
                </p>
            </form>

            {/* Success Popup */}
            {showPopup && (
                <div style={{
                    ...popupStyle,
                    transform: popupVisible
                        ? "translate(-50%, -50%) scale(1)"
                        : "translate(-50%, -50%) scale(0.7)",
                    opacity: popupVisible ? 1 : 0,
                }}>
                    <CheckCircle size={80} />
                    <p style={{ marginTop: "20px", fontWeight: "bold", fontSize: "18px" }}>
                        Registration Successful!
                    </p>
                </div>
            )}
        </div>
    );
}

// Styles
const containerStyle = {
    maxWidth: "500px",
    margin: "50px auto",
    padding: "20px",
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
    fontFamily: "Poppins, sans-serif",
};

const titleStyle = {
    textAlign: "center",
    marginBottom: "20px",
    color: "#023047",
    fontWeight: "bold",
    fontSize: "22px",
};

const errorStyle = {
    background: "#fee",
    color: "#c33",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "15px",
    textAlign: "center",
    fontSize: "14px",
};

const roleButtonStyle = {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
    border: "none",
};

const inputContainerStyle = {
    position: "relative",
    marginBottom: "15px",
};

const inputStyle = {
    width: "100%",
    padding: "12px 12px 12px 40px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    fontSize: "14px",
    boxSizing: "border-box",
};

const iconStyle = {
    position: "absolute",
    top: "50%",
    left: "12px",
    transform: "translateY(-50%)",
    color: "#888",
};

const submitButtonStyle = {
    width: "100%",
    padding: "12px",
    background: "#0077b6",
    color: "#fff",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
    border: "none",
};

const switchTextStyle = {
    textAlign: "center",
    marginTop: "15px",
    fontSize: "14px",
    color: "#555",
};

const switchLinkStyle = {
    color: "#0077b6",
    cursor: "pointer",
    fontWeight: "bold",
};

const popupStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
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
    transition: "opacity 0.6s ease, transform 0.6s ease",
};
