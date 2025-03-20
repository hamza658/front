import React, { useState } from 'react';
import axios from 'axios';
import './TripForm.css';
import { useNavigate } from 'react-router-dom';
// Import the GIF at the top of your file
import busGif from '../images/bus GIF.gif';

const TripForm = () => {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used: ''
    // trip_date will be added automatically when submitting
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Add the current date to the form data before submitting
    const dataToSubmit = {
      ...formData,
      trip_date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
    };
    
    console.log("Submitting data:", dataToSubmit);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/trips/', dataToSubmit, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(response.data);
      
      // Store the trip data in localStorage
      localStorage.setItem('tripFormData', JSON.stringify(response.data));
      
      // Use navigate instead of window.location
      navigate('/RouteMap');
    } catch (error) {
      console.error("Error submitting form", error.response || error);
    }
  };
  return (
    <div className="app-container">
      <div className="app-header">
        
      </div>
      
      <div className="form-container">
        <h2>Plan Your Journey</h2>
        
        <form className="trip-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="current_location">
              <i className="location-icon">📍</i> Current Location
            </label>
            <input
              type="text"
              id="current_location"
              name="current_location"
              value={formData.current_location}
              onChange={handleChange}
              placeholder="Where are you now?"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pickup_location">
              <i className="pickup-icon">🚏</i> Pickup Location
            </label>
            <input
              type="text"
              id="pickup_location"
              name="pickup_location"
              value={formData.pickup_location}
              onChange={handleChange}
              placeholder="Where would you like to be picked up?"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="dropoff_location">
              <i className="dropoff-icon">🏁</i> Dropoff Location
            </label>
            <input
              type="text"
              id="dropoff_location"
              name="dropoff_location"
              value={formData.dropoff_location}
              onChange={handleChange}
              placeholder="Where's your destination?"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="current_cycle_used">
              <i className="time-icon">⏱️</i> Current Cycle Used (hrs)
            </label>
            <input
              type="number"
              id="current_cycle_used"
              name="current_cycle_used"
              value={formData.current_cycle_used}
              onChange={handleChange}
              placeholder="Number of hours"
              required
            />
          </div>
          
          <button type="submit" className="submit-btn">
            <i className="plan-icon">🗺️</i> Plan My Trip
          </button>
        </form>
        
        <div className="features-section">
          <div className="feature">
            <img 
              src={require("../images/téléchargé.png")} 
              alt="Fast booking" 
              className="feature-icon" 
            />
            <span>Fast Booking</span>
          </div>
          <div className="feature">
            <img 
              src={require("../images/supp.png")} 
              alt="Support" 
              className="feature-icon" 
            />
            <span>Support</span>
          </div>
          <div className="feature">
            <img 
              src={require("../images/route.png")} 
              alt="Best Routes" 
              className="feature-icon" 
            />
            <span>Best Routes</span>
          </div>
        </div>
      </div>
      
      <footer className="app-footer">
        <p>© 2025 Trip Planner App - Your Journey, Our Priority</p>
      </footer>
    </div>
  );
};

export default TripForm;