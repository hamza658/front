import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <NavLink to="/" className="logo-link">
            <span className="logo-text">Trip Tracker</span>
          </NavLink>
        </div>
        
        <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          <i className={`fa ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        
        <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="fa fa-home"></i>
                <span className="nav-text">Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/RouteMap" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="fa fa-map"></i>
                <span className="nav-text">Route Map</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/log-sheets" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="fa fa-clipboard"></i>
                <span className="nav-text">Log Sheets</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="fa fa-chart-bar"></i>
                <span className="nav-text">Dashboard</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <div className="search-box">
            <input type="text" placeholder="Search..." />
            <button><i className="fa fa-search"></i></button>
          </div>
          <div className="user-actions">
            <a href="/profile" className="user-icon">
              <i className="fa fa-user-circle"></i>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;