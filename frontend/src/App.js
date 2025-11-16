import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import UploadForm from './pages/UploadForm';
import Payment from "./pages/Payment";
import FishMarket from './pages/FishMarket';
import FishDetailPage from './pages/FishDetailPage';
import Manage from './pages/Manage';
import BuyerReviews from './pages/BuyerReviews';
import LoginRegisPage from "./pages/LoginRegisPage";
import { AuthProvider, useAuth } from "./AuthContext";
import Navbar from "./Navbar";
import { CartProvider } from "./CartContext";

function AppContent() {
  const [cart, setCart] = useState([]);
  const { isLoading } = useAuth();

  // Show loading spinner while checking authentication state
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#0077b6'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar />
        <div style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<UploadForm />} />
            <Route path="/payment" element={<Payment cart={cart} />} />
            <Route path="/market" element={<FishMarket cart={cart} setCart={setCart} />} />
            <Route path="/market/:id" element={<FishDetailPage cart={cart} setCart={setCart} />} />
            <Route path="/manage" element={<Manage />} />
            <Route path="/reviews" element={<BuyerReviews />} />
            <Route path="/login" element={<LoginRegisPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      {/* <AppContent /> */}
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

function Home() {
  return (
      <div style={homeStyle}>
        <h2>Welcome to Fish Market!</h2>
        {/* <p>Login first!</p> */}
        <h1>°‧ 𓇼 𓆟 𓆞 ·｡𓆝 ⋆｡°‧𓇼</h1>
      </div>
  );
}

// Styles
const homeStyle = {
  textAlign: "center",
  marginTop: "50px"
};

export default App;
