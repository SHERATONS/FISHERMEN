// AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Initialize user state from localStorage on app startup
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedRole = localStorage.getItem("role");
        const storedId = localStorage.getItem("id");
        const storedUser = localStorage.getItem("user");

        // Check if we have stored authentication data
        if (storedRole && storedId) {
          const parsedRole = JSON.parse(storedRole);
          const parsedId = JSON.parse(storedId);
          
          // Restore user state
          setUser({
            role: parsedRole,
            id: parsedId
          });
        } else if (storedUser) {
          // Fallback: check for complete user object
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Error during authentication initialization:", error);
        // Clear corrupted data
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("id");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken"); // For future token implementation
  };

  const login = (userData) => {
    try {
      setUser(userData);
      
      // Store authentication data in localStorage
      localStorage.setItem("role", JSON.stringify(userData.role));
      localStorage.setItem("id", JSON.stringify(userData.id));
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Optional: Store timestamp for session expiry
      localStorage.setItem("loginTimestamp", Date.now().toString());
      
      console.log("User logged in successfully:", userData);
    } catch (error) {
      console.error("Error storing authentication data:", error);
    }
  };

  const logout = () => {
    setUser(null);
    clearAuthData();
    console.log("User logged out successfully");
  };

  // Check if session is expired (optional - 24 hours expiry)
  const isSessionExpired = () => {
    try {
      const loginTimestamp = localStorage.getItem("loginTimestamp");
      if (!loginTimestamp) return false;
      
      const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const currentTime = Date.now();
      const timeDifference = currentTime - parseInt(loginTimestamp);
      
      return timeDifference > sessionDuration;
    } catch (error) {
      console.error("Error checking session expiry:", error);
      return true; // Assume expired if error
    }
  };

  // Auto-logout if session expired
  useEffect(() => {
    if (user && isSessionExpired()) {
      console.log("Session expired, logging out user");
      logout();
    }
  }, [user]);

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    isSessionExpired
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
