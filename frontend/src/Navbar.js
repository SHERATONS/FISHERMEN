// Navbar.js
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();          // Clear user state
    navigate("/login"); // Redirect to login page
  };

  return (
    <nav style={navStyle}>
      <h1 style={{ margin: 0 }}>🐟 Oceanmate</h1>
      <div>
        <Link style={linkStyle} to="/">Home</Link>
        {user && user.role === "FISHERMAN" && <Link style={linkStyle} to="/upload">Upload Fish</Link>}
        <Link style={linkStyle} to="/market">Market</Link>
        {user && <Link style={linkStyle} to="/manage">Manage Orders</Link>}
        {user && user.role === "BUYER" && <Link style={linkStyle} to="/reviews">Reviews</Link>}
        
        {user ? (
            <button
                onClick={handleLogout}
                style={{
                marginLeft: "15px",
                padding: "5px 10px",
                backgroundColor: "#f25f5c",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold"
                }}
            >
                Logout
            </button>
            ) : (
            <Link style={linkStyle} to="/login">Login</Link>
            )}

      </div>
    </nav>
  );
}
