import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PollList from './components/PollList';
import Sidebar from './components/sidebar/index';
import About from './components/About';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Loginpage';
import Register from './components/Registerpage';
import './App.css'; // Ensure your custom CSS is imported
import { AuthProvider } from './context/AuthContext';
import {jwtDecode} from "jwt-decode"; // Corrected import
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const App = () => {
  const [user, setUser] = useState(null);

  // Utility function to validate the JWT format
  const isValidJWT = (token) => {
    return token && token.split('.').length === 3;  // JWT should have 3 parts: header, payload, signature
  };

  // Check for token and decode user information on mount
  useEffect(() => {
    const token = localStorage.getItem('authTokens');
    if (token && isValidJWT(token)) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({
          id: decodedToken.user_id,
          username: decodedToken.username,
          full_name: decodedToken.full_name,
          image: decodedToken.image,
        });
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem('authTokens');  // Remove invalid token
      }
    }
  }, []);

  // Handle user login
  const handleLogin = (token) => {
    if (isValidJWT(token)) {
      localStorage.setItem('authTokens', token);
      const decodedToken = jwtDecode(token);
      setUser({
        id: decodedToken.user_id,
        username: decodedToken.username,
        full_name: decodedToken.full_name,
        image: decodedToken.image,
      });
    } else {
      console.error("Invalid token format");
    }
  };

  // Handle user logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authTokens');
  };

  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar user={user} handleLogout={handleLogout} />
          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/poll" element={<PollList user={user} />} />
              <Route path="/sidebar" element={<Sidebar />} />
              <Route path="/login" element={<Login handleLogin={handleLogin} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
