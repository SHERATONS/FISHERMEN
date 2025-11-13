// Navbar.js
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Navbar() {
  const { user, logout, isSessionExpired } = useAuth();
  const navigate = useNavigate();

  // Check for session expiry on component mount and user changes
  useEffect(() => {
    if (user && isSessionExpired()) {
      console.log("Session expired, logging out user");
      logout();
      navigate("/login");
    }
  }, [user, isSessionExpired, logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={navStyle}>
      <h1 style={{ margin: 0 }}>🐟 Oceanmate</h1>
      <div>
        <Link style={linkStyle} to="/">Home</Link>
        {user && user.role === "FISHERMAN" && (
          <Link style={linkStyle} to="/upload">Upload Fish</Link>
        )}
        <Link style={linkStyle} to="/market">Market</Link>
        {user && <Link style={linkStyle} to="/manage">Manage Orders</Link>}
        {user && user.role === "BUYER" && (
          <Link style={linkStyle} to="/reviews">Reviews</Link>
        )}
        
        {user ? (
          <div style={{ display: "inline-flex", alignItems: "center", marginLeft: "15px" }}>
            <span style={{ marginRight: "10px", fontSize: "14px" }}>
              Welcome, {user.role?.toLowerCase()}!
            </span>
            <button onClick={handleLogout} style={logoutButtonStyle}>
              Logout
            </button>
          </div>
        ) : (
          <Link style={linkStyle} to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#6e9cd4",
  color: "#fff",
  padding: "10px 20px"
};

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  marginLeft: "15px",
  fontWeight: "bold"
};

const logoutButtonStyle = {
  padding: "5px 10px",
  backgroundColor: "#f25f5c",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold"
};
