import { NavLink } from 'react-router-dom';
import React from 'react';
import './Navbar.css';

const Navbar = ({ user, handleLogout }) => {
  return (
    <>
      <div className="container-fluid nav_bg">
        <div className="row">
          <div className="col-10 mx-auto">
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
              <NavLink className="navbar-brand" to="/">
                MSTC
              </NavLink>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              {/* Navbar Links */}
              <div className="collapse navbar-collapse" id="navbarSupportedContent">
                {/* Align the navigation links beside MSTC */}
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <NavLink className="nav-link text-dark" exact to="/">
                      Home
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link text-dark" to="/poll">
                      Poll
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link text-dark" to="/about">
                      About
                    </NavLink>
                  </li>
                </ul>

                {/* Align the login/logout section to the right */}
                <div className="d-flex align-items-center ms-auto">
                  {user ? (
                    <div className="dropdown">
                      <button
                        className="btn dropdown-toggle"
                        id="dropdownMenuButton"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Welcome, {user.username}
                      </button>
                      <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <li>
                          <NavLink className="dropdown-item" to="/profile">
                            Profile
                          </NavLink>
                        </li>
                        <li>
                          <span className="dropdown-item">Your Points - 1000</span>
                        </li>
                        <li>
                          <button className="dropdown-item" onClick={handleLogout}>
                            Logout
                          </button>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <NavLink className="nav-link text-dark" to="/login">
                      Login
                    </NavLink>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
