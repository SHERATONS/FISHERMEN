import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UploadForm from './pages/UploadForm';
import Payment from "./pages/Payment";

function App() {
  return (
    <Router>
      <div className="App">

        {/* Navbar */}
        <nav style={navStyle}>
          <h1 style={{ margin: 0 }}>🐟 Oceanmate</h1>
          <div>
            <Link style={linkStyle} to="/">Home</Link>
            <Link style={linkStyle} to="/upload">Upload Fish</Link>
            <Link style={linkStyle} to="/payment">Payment</Link>
          </div>
        </nav>

        {/* Main content */}
        <div style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<UploadForm />} />
            <Route path="/payment" element={<Payment />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// หน้า Home
function Home() {
  return (
    <div style={homeStyle}>
      <h2>Welcome to Fish Market!</h2>
      <p>Click "Upload Fish" in the navbar to upload your daily catch.</p>
    </div>
  );
}

// Styles
const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#6e9cd4", // ฟ้าอ่อน
  color: "#fff",
  padding: "10px 20px"
};

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  marginLeft: "15px",
  fontWeight: "bold"
};

const homeStyle = {
  textAlign: "center",
  marginTop: "50px"
};

export default App;
