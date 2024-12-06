// App.js
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
import Exchange from './components/Exchange';
import './App.css'; 
import { AuthProvider } from './context/AuthContext';
import { jwtDecode } from "jwt-decode"; 
import axios from 'axios'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import PointRedemption from './components/PointRedemption';
import Profile from './components/Profile';
import Pointhistory from './components/Pointhistory';
const App = () => {
  const [user, setUser] = useState(null);
  const [userPoints, setUserPoints] = useState(0); 

  const handleUpdateUserPoints = (newPoints) => {
    setUserPoints(newPoints); 
  };

  const isValidJWT = (token) => {
    return token && token.split('.').length === 3;  
  };

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
        localStorage.removeItem('authTokens');  
      }
    }
  }, []);

  useEffect(() => {
    const fetchUserPoints = async () => {
      if (user) {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/user-points/${user.id}/`); 
          setUserPoints(response.data.total_points || 0);
        } catch (error) {
          console.error("Error fetching user points:", error);
        }
      }
    };

    fetchUserPoints();
  }, [user]); 

  const handleLogout = () => {
    setUser(null);
    setUserPoints(0); 
    localStorage.removeItem('authTokens');
  };

  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar user={user} userPoints={userPoints} handleLogout={handleLogout} />
          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/poll" element={<PollList user={user} onUpdateUserPoints={handleUpdateUserPoints} />} />
              <Route path="/sidebar" element={<Sidebar />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/pointredemption" element={<PointRedemption />} />
              <Route path="/exchange" element={<Exchange />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/pointhistory" element={<Pointhistory />} />
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
