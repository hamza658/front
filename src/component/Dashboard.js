import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// Import chart components if you're using a library like recharts
// import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    totalDistance: 0,
    totalHours: 0,
    fuelUsed: 0
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [topDestinations, setTopDestinations] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      // Try to get trips data from localStorage first
      let foundTrips = false;
      try {
        // Check local storage for trips data - look for common keys that might store trip data
        const possibleKeys = ['logsheets', 'trips', 'tripData', 'tripsList'];
        
        for (const key of possibleKeys) {
          const localData = localStorage.getItem(key);
          if (localData) {
            const parsedData = JSON.parse(localData);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              console.log(`Found trip data in localStorage under key: ${key}`);
              // Sort by date if possible
              const sortedTrips = [...parsedData].sort((a, b) => {
                const dateA = a.date ? new Date(a.date) : new Date(0);
                const dateB = b.date ? new Date(b.date) : new Date(0);
                return dateB - dateA;
              }).slice(0, 5);
              
              setRecentTrips(sortedTrips);
              foundTrips = true;
              
              // Also update stats if we found trips
              setStats({
                totalTrips: parsedData.length,
                activeTrips: parsedData.filter(t => t.status === "In Progress").length,
                completedTrips: parsedData.filter(t => t.status === "Completed").length,
                totalDistance: parsedData.reduce((sum, t) => sum + (t.distance || 0), 0),
                totalHours: parsedData.reduce((sum, t) => sum + (t.current_cycle_used || 0), 0),
                fuelUsed: parsedData.reduce((sum, t) => sum + (t.fuel_used || 0), 0)
              });
              
              break;
            }
          }
        }
      } catch (storageError) {
        console.error("Error accessing localStorage:", storageError);
      }

      // If we didn't find trips in localStorage, try API
      if (!foundTrips) {
        try {
          // Try different API endpoints that might have trip data
          const endpoints = [
            'http://127.0.0.1:8000/api/trips/',
            'http://127.0.0.1:8000/api/logsheets/',
            '/api/trips/',
            '/api/logsheets/'
          ];
          
          for (const endpoint of endpoints) {
            try {
              console.log(`Attempting to fetch trips from: ${endpoint}`);
              const response = await axios.get(endpoint);
              
              if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                console.log(`Successfully fetched ${response.data.length} trips from ${endpoint}`);
                const sortedTrips = [...response.data]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 5);
                
                setRecentTrips(sortedTrips);
                foundTrips = true;
                break;
              }
            } catch (endpointError) {
              console.log(`Failed to fetch from ${endpoint}:`, endpointError.message);
              // Continue to next endpoint
            }
          }
          
          // Try to fetch stats
          try {
            const statsResponse = await axios.get('http://127.0.0.1:8000/api/stats/summary/');
            setStats(statsResponse.data);
          } catch (statsError) {
            console.log("Could not fetch stats summary:", statsError.message);
            // If we have trips but no stats, calculate stats from trips
            if (foundTrips && recentTrips.length > 0) {
              // Stats would have been calculated above if we found trips in localStorage
            } else {
              // Use fallback stats
              setStats({
                totalTrips: 142,
                activeTrips: 8,
                completedTrips: 134,
                totalDistance: 12458,
                totalHours: 248,
                fuelUsed: 952
              });
            }
          }
          
          // Try to fetch top destinations
          try {
            const topDestResponse = await axios.get('http://127.0.0.1:8000/api/stats/top-destinations/');
            setTopDestinations(topDestResponse.data);
          } catch (destError) {
            console.log("Could not fetch top destinations:", destError.message);
            setTopDestinations([
              { destination: "San Francisco, CA", count: 24 },
              { destination: "Seattle, WA", count: 18 },
              { destination: "Portland, OR", count: 15 },
              { destination: "Denver, CO", count: 12 },
              { destination: "Phoenix, AZ", count: 10 }
            ]);
          }
          
        } catch (apiError) {
          console.error("Error fetching data from API:", apiError);
        }
      }

      // If we still don't have trip data, use fallback
      if (!foundTrips) {
        console.log("Using fallback trip data");
        // Use hardcoded fallback data as last resort
        setRecentTrips([
          { id: 1, pickup_location: "Los Angeles, CA", dropoff_location: "San Francisco, CA", status: "In Progress", date: "2025-03-15", current_cycle_used: 5.2 },
          { id: 2, pickup_location: "Seattle, WA", dropoff_location: "Portland, OR", status: "Completed", date: "2025-03-14", current_cycle_used: 3.0 },
          { id: 3, pickup_location: "Chicago, IL", dropoff_location: "Detroit, MI", status: "Completed", date: "2025-03-13", current_cycle_used: 4.8 },
          { id: 4, pickup_location: "New York, NY", dropoff_location: "Boston, MA", status: "Completed", date: "2025-03-12", current_cycle_used: 3.5 },
          { id: 5, pickup_location: "Miami, FL", dropoff_location: "Orlando, FL", status: "Completed", date: "2025-03-11", current_cycle_used: 2.8 }
        ]);
      }
      
      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  const handleNewTripClick = () => {
    navigate('/');
  };

  const handleViewAllTrips = () => {
    navigate('/log-sheets');
  };

  const handleViewTrip = (id) => {
    navigate(`/RouteMap/${id}`);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  // The rest of your component remains the same
  return (
    <div className="dashboard-container">
      <div className="app-header">
        <div className="left-section">
          <div className="logo-section">
            <div className="logo">🚚</div>
            <h1>Trip Tracker</h1>
          </div>
        </div>
        <div className="right-section">
          <button className="nav-button new-trip-button" onClick={handleNewTripClick}>
            <span className="button-icon">➕</span>
            <span className="button-text">New Trip</span>
          </button>
          <button className="nav-button log-sheets-button" onClick={handleViewAllTrips}>
            <span className="button-icon">📋</span>
            <span className="button-text">View All Trips</span>
          </button>
        </div>
      </div>

      <div className="dashboard-title">
        <h2>Dashboard</h2>
        <p>Overview of your trip activity and statistics</p>
      </div>

      {/* Stats Summary Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon-container blue">
            <div className="stat-icon">🛣️</div>
          </div>
          <div className="stat-details">
            <h3>Total Trips</h3>
            <p className="stat-value">{stats.totalTrips}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-container green">
            <div className="stat-icon">🚚</div>
          </div>
          <div className="stat-details">
            <h3>Active Trips</h3>
            <p className="stat-value">{stats.activeTrips}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-container purple">
            <div className="stat-icon">✅</div>
          </div>
          <div className="stat-details">
            <h3>Completed</h3>
            <p className="stat-value">{stats.completedTrips}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-container orange">
            <div className="stat-icon">📏</div>
          </div>
          <div className="stat-details">
            <h3>Total Distance</h3>
            <p className="stat-value">{stats.totalDistance.toLocaleString()} miles</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-container red">
            <div className="stat-icon">⏱️</div>
          </div>
          <div className="stat-details">
            <h3>Total Hours</h3>
            <p className="stat-value">{stats.totalHours.toLocaleString()} hrs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-container teal">
            <div className="stat-icon">⛽</div>
          </div>
          <div className="stat-details">
            <h3>Fuel Used</h3>
            <p className="stat-value">{stats.fuelUsed.toLocaleString()} gal</p>
          </div>
        </div>
      </div>

      {/* Dashboard Main Content */}
      <div className="dashboard-main">
        {/* Recent Trips Section */}
        <div className="dashboard-section recent-trips">
          <div className="section-header">
            <h3>Recent Trips</h3>
            <button className="view-all-button" onClick={handleViewAllTrips}>View All</button>
          </div>
          <div className="trips-table-container">
            <table className="trips-table">
              <thead>
                <tr>
                  <th>Pickup</th>
                  <th>Dropoff</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Hours</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.length > 0 ? (
                  recentTrips.map(trip => (
                    <tr key={trip.id} className={trip.status === "In Progress" ? "active-trip" : ""}>
                      <td>{trip.pickup_location}</td>
                      <td>{trip.dropoff_location}</td>
                      <td>
                        <span className={`status-badge ${trip.status === "In Progress" ? "active" : "completed"}`}>
                          {trip.status}
                        </span>
                      </td>
                      <td>{trip.date}</td>
                      <td>{trip.current_cycle_used}</td>
                      <td>
                        <button 
                          className="view-button" 
                          onClick={() => handleViewTrip(trip.id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{textAlign: "center", padding: "20px"}}>
                      No trips found. <button onClick={handleNewTripClick} className="new-trip-link">Create your first trip</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-side">
          {/* Top Destinations */}
          <div className="dashboard-section top-destinations">
            <h3>Top Destinations</h3>
            <ul className="destinations-list">
              {topDestinations.map((destination, index) => (
                <li key={index} className="destination-item">
                  <div className="destination-info">
                    <span className="destination-rank">{index + 1}</span>
                    <span className="destination-name">{destination.destination}</span>
                  </div>
                  <span className="destination-count">{destination.count} trips</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="dashboard-section quick-stats">
            <h3>Performance</h3>
            <div className="performance-stats">
              <div className="performance-stat">
                <div className="stat-label">Avg. Trip Duration</div>
                <div className="stat-figure">{(stats.totalTrips > 0 ? (stats.totalHours / stats.totalTrips).toFixed(1) : 0)} hrs</div>
              </div>
              <div className="performance-stat">
                <div className="stat-label">Avg. Distance per Trip</div>
                <div className="stat-figure">{(stats.totalTrips > 0 ? (stats.totalDistance / stats.totalTrips).toFixed(1) : 0)} miles</div>
              </div>
              <div className="performance-stat">
                <div className="stat-label">Fuel Efficiency</div>
                <div className="stat-figure">{(stats.fuelUsed > 0 ? (stats.totalDistance / stats.fuelUsed).toFixed(1) : 0)} mpg</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with note */}
      <div className="dashboard-footer">
        <p>Data last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default Dashboard;