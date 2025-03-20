import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './RouteMap.css';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

// Fix the default marker icon issue in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map view when coordinates change
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const RouteMap = () => {
    const { id } = useParams();
  const navigate = useNavigate();
  const [tripData, setTripData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapPosition, setMapPosition] = useState({
    lat: 51.505,
    lng: -0.09,
    
    zoom: 13
  });
  const [markers, setMarkers] = useState([]);
  const [routeLines, setRouteLines] = useState([]);

  // Custom marker icons
  const createCustomIcon = (color) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <svg width="30" height="45" viewBox="0 0 30 45" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 0C6.75 0 0 6.75 0 15C0 26.25 15 45 15 45C15 45 30 26.25 30 15C30 6.75 23.25 0 15 0ZM15 22.5C10.875 22.5 7.5 19.125 7.5 15C7.5 10.875 10.875 7.5 15 7.5C19.125 7.5 22.5 10.875 22.5 15C22.5 19.125 19.125 22.5 15 22.5Z" fill="${color}"/>
          <circle cx="15" cy="15" r="7.5" fill="white"/>
        </svg>
      `,
      iconSize: [30, 45],
      iconAnchor: [15, 45], // Bottom center of the icon
      popupAnchor: [0, -45] // Center above the icon
    });
  };
  
  const currentLocationIcon = createCustomIcon('#4a90e2');
  const pickupLocationIcon = createCustomIcon('#2ecc71');
  const dropoffLocationIcon = createCustomIcon('#e74c3c');

  useEffect(() => {
    const fetchTripData = async () => {
      setIsLoading(true);
      try {
        // Check if we have an ID in the URL
        if (id) {
          // Fetch the specific trip by ID
          const response = await axios.get(`http://127.0.0.1:8000/api/trips/${id}/`);
          setTripData(response.data);
        } else {
          // Fallback to stored data or latest trip
          const storedTripData = localStorage.getItem('tripFormData');
          
          if (storedTripData) {
            setTripData(JSON.parse(storedTripData));
          } else {
            // Fetch latest trip as fallback
            const response = await axios.get('http://127.0.0.1:8000/api/trips/latest/');
            setTripData(response.data);
          }
        }
      } catch (error) {
        console.error("Error fetching trip data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTripData();
  }, [id]);
  useEffect(() => {
    if (tripData) {
      const geocodeAndSetMarkers = async () => {
        const newMarkers = [];
        const positions = [];
        const coordinates = {};
        
        // Geocode current location
        if (tripData.current_location) {
          const currentCoords = await geocodeLocation(tripData.current_location);
          if (currentCoords.lat && currentCoords.lng) {
            newMarkers.push({
              position: [currentCoords.lat, currentCoords.lng],
              popup: "Current Location: " + tripData.current_location,
              icon: currentLocationIcon
            });
            positions.push([currentCoords.lat, currentCoords.lng]);
            coordinates.current = [currentCoords.lng, currentCoords.lat]; // OSRM uses [lng, lat] format
            
            // Center map on current location
            setMapPosition({
              lat: currentCoords.lat,
              lng: currentCoords.lng,
              zoom: 12
            });
          }
        }
        
        // Geocode pickup location
        if (tripData.pickup_location) {
          const pickupCoords = await geocodeLocation(tripData.pickup_location);
          if (pickupCoords.lat && pickupCoords.lng) {
            newMarkers.push({
              position: [pickupCoords.lat, pickupCoords.lng],
              popup: "Pickup Location: " + tripData.pickup_location,
              icon: pickupLocationIcon
            });
            positions.push([pickupCoords.lat, pickupCoords.lng]);
            coordinates.pickup = [pickupCoords.lng, pickupCoords.lat]; // OSRM uses [lng, lat] format
          }
        }
        
        // Geocode dropoff location
        if (tripData.dropoff_location) {
          const dropoffCoords = await geocodeLocation(tripData.dropoff_location);
          if (dropoffCoords.lat && dropoffCoords.lng) {
            newMarkers.push({
              position: [dropoffCoords.lat, dropoffCoords.lng],
              popup: "Dropoff Location: " + tripData.dropoff_location,
              icon: dropoffLocationIcon
            });
            positions.push([dropoffCoords.lat, dropoffCoords.lng]);
            coordinates.dropoff = [dropoffCoords.lng, dropoffCoords.lat]; // OSRM uses [lng, lat] format
          }
        }
        
        setMarkers(newMarkers);
        
        // Get road routes if we have at least 2 positions
        if (coordinates.current && coordinates.pickup) {
          const currentToPickupRoute = await getRouteFromOSRM(coordinates.current, coordinates.pickup);
          
          const routes = [];
          
          // Add route from current to pickup
          if (currentToPickupRoute) {
            routes.push({
              positions: currentToPickupRoute,
              color: '#3388ff',
              type: 'current-to-pickup'
            });
          }
          
          // Add route from pickup to dropoff
          if (coordinates.pickup && coordinates.dropoff) {
            const pickupToDropoffRoute = await getRouteFromOSRM(coordinates.pickup, coordinates.dropoff);
            if (pickupToDropoffRoute) {
              routes.push({
                positions: pickupToDropoffRoute,
                color: '#ff3333',
                type: 'pickup-to-dropoff',
                dashed: true
              });
            }
          }
          
          setRouteLines(routes);
        }
      };
      
      geocodeAndSetMarkers();
    }
  }, [tripData]);

  const geocodeLocation = async (location) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: location,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'YourAppName'  // Good practice to add a user agent for Nominatim requests
        }
      });

      if (response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon)
        };
      }
    } catch (error) {
      console.error(`Error geocoding ${location}:`, error);
    }
    return { lat: null, lng: null };
  };

  // Function to get route using OSRM API
  const getRouteFromOSRM = async (start, end) => {
    try {
      // OSRM expects coordinates in [longitude, latitude] format
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`
      );

      if (response.data.code === 'Ok' && response.data.routes.length > 0) {
        // Extract the route coordinates from the GeoJSON response
        const routeCoordinates = response.data.routes[0].geometry.coordinates;
        
        // Convert from [lng, lat] to [lat, lng] which is what Leaflet expects
        return routeCoordinates.map(coord => [coord[1], coord[0]]);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
    return null;
  };
  
  const handleBackClick = () => {
    navigate('/');
  };

  const handleLogSheetsClick = () => {
    navigate('/log-sheets');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your trip details...</p>
      </div>
    );
  }

  return (
    <div className="route-map-container">
      <div className="app-header">
        <div className="left-section">
          <div className="logo-section">
            <div className="logo">🚚</div>
            <h1>Trip Tracker</h1>
          </div>
          <button className="nav-button back-button" onClick={handleBackClick}>
            <span className="button-icon">←</span>
            <span className="button-text">Back to Form</span>
          </button>
        </div>
        <div className="right-section">
          <button className="nav-button log-sheets-button" onClick={handleLogSheetsClick}>
            <span className="button-icon">📋</span>
            <span className="button-text">View Log Sheets</span>
          </button>
        </div>
      </div>

      <div className="page-title">
        <h2>Your Trip Route</h2>
        <div className="route-detail">Active trip from {tripData?.pickup_location || "pickup"} to {tripData?.dropoff_location || "destination"}</div>
      </div>

      <div className="trip-summary">
        <div className="summary-card">
          <div className="summary-item">
            <div className="summary-icon current">📍</div>
            <div className="summary-text">
              <h3>Current Location</h3>
              <p>{tripData?.current_location || "Not specified"}</p>
            </div>
          </div>
          
          <div className="summary-item">
            <div className="summary-icon pickup">🚏</div>
            <div className="summary-text">
              <h3>Pickup</h3>
              <p>{tripData?.pickup_location || "Not specified"}</p>
            </div>
          </div>
          
          <div className="summary-item">
            <div className="summary-icon dropoff">🏁</div>
            <div className="summary-text">
              <h3>Dropoff</h3>
              <p>{tripData?.dropoff_location || "Not specified"}</p>
            </div>
          </div>
          
          <div className="summary-item">
            <div className="summary-icon time">⏱️</div>
            <div className="summary-text">
              <h3>Estimated Time</h3>
              <p>{tripData?.current_cycle_used || "0"} hours</p>
            </div>
          </div>
        </div>
      </div>

      <div className="map-container">
        <div className="map-wrapper">
          <MapContainer
            center={[mapPosition.lat, mapPosition.lng]}
            zoom={mapPosition.zoom}
            style={{ width: '100%', height: '600px' }}
            className="route-map"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapUpdater center={[mapPosition.lat, mapPosition.lng]} zoom={mapPosition.zoom} />
            
            {/* Draw route lines */}
            {routeLines.map((line, idx) => (
              <Polyline 
                key={`line-${idx}`}
                positions={line.positions}
                pathOptions={{ 
                  color: line.color,
                  weight: 5,
                  opacity: 0.7,
                  dashArray: line.type === 'pickup-to-dropoff' ? '10, 10' : '',
                  lineCap: 'round'
                }}
              />
            ))}
            
            {/* Draw markers */}
            {markers.map((marker, idx) => (
              <Marker 
                key={idx} 
                position={marker.position}
                icon={marker.icon}
              >
                <Popup>{marker.popup}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="map-sidebar">
        <div className="map-legend">
  <h3>Map Legend</h3>
  <div className="legend-item">
    <div className="legend-pin" style={{backgroundColor: '#4a90e2'}}></div>
    <span>Current Location</span>
  </div>
  <div className="legend-item">
    <div className="legend-pin" style={{backgroundColor: '#2ecc71'}}></div>
    <span>Pickup Location</span>
  </div>
  <div className="legend-item">
    <div className="legend-pin" style={{backgroundColor: '#e74c3c'}}></div>
    <span>Dropoff Location</span>
  </div>
  <div className="legend-item">
    <div className="legend-line solid"></div>
    <span>Route to Pickup</span>
  </div>
  <div className="legend-item">
    <div className="legend-line dashed"></div>
    <span>Route to Dropoff</span>
  </div>
</div>
          
          <div className="trip-stats-card">
            <h3>Trip Statistics</h3>
            <div className="trip-stats-grid">
              <div className="stat-item">
                <div className="stat-icon">🛣️</div>
                <div className="stat-content">
                  <div className="stat-label">Distance</div>
                  <div className="stat-value">43.2 miles</div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">⏰</div>
                <div className="stat-content">
                  <div className="stat-label">Est. Travel Time</div>
                  <div className="stat-value">1h 24m</div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">⛽</div>
                <div className="stat-content">
                  <div className="stat-label">Fuel Consumption</div>
                  <div className="stat-value">3.8 gallons</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteMap;