import { NavLink } from 'react-router-dom';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import './Navbar.css';
import AuthContext from '../context/AuthContext';
// import axios from 'axios';
import api from '../api'; 

export let updateUserPointsExternally = () => {};


const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const [userPoints, setUserPoints] = useState(0);

  const fetchUserPoints = useCallback(async () => {
    if (!user) return;

    try {
      const response = await api.get('profile/');
      // const response = await axios.get('http://127.0.0.1:8000/api/profile/');
      const userPointData = response.data.find((item) => item.id === user.user_id);
      setUserPoints(userPointData ? userPointData.total_points : 0);
    } catch (error) {
      console.error("Error fetching user points:", error);
      setUserPoints(0);
    }
  }, [user]);

  useEffect(() => {
    fetchUserPoints();
  }, [fetchUserPoints]);

  // Wrap `updateUserPoints` in useCallback to avoid creating a new function every render
  const updateUserPoints = useCallback((newPoints) => {
    setUserPoints(newPoints);
  }, []);

  // Expose `updateUserPoints` globally so other components can trigger it
  useEffect(() => {
    updateUserPointsExternally = updateUserPoints;
  }, [updateUserPoints]);

  
  return (
    <div className="container-fluid nav_bg">
      <div className="row">
        <div className="col-10 mx-auto">
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <NavLink className="navbar-brand" to="/">MSTC</NavLink>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item"><NavLink className="nav-link text-dark" to="/">Home</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link text-dark" to="/poll">Poll</NavLink></li>              
                <li className="nav-item"><NavLink className="nav-link text-dark" to="/pointredemption">Exchange</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link text-dark" to="/about">About</NavLink></li>
              </ul>

              <div className="d-flex align-items-center ms-auto">
                {user ? (
                  <div className="nav-item dropdown">
                    <button className="btn dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                      Welcome, {user.username}
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                      <li><NavLink className="dropdown-item" to="/profile">Profile</NavLink></li>
                      <li><NavLink className="dropdown-item" to="/pointredemption">My Points - {userPoints}</NavLink></li>
                      <li><button className="dropdown-item" onClick={logoutUser}>Logout</button></li>
                    </ul>
                  </div>
                ) : (
                  <NavLink className="navbar-nav" to="/login">Login</NavLink>
                )}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
