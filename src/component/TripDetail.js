import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  Box, 
  CircularProgress, 
  Button, 
  Paper,
  Grid,
  Avatar,
  Chip} from '@mui/material';
  import { useNavigate } from 'react-router-dom';

import { 
  AccessTime, 
  LocationOn, 
  ArrowBack, 
  MyLocation, 
  PinDrop, 
  DirectionsTransit,
  Map, 
  Error as ErrorIcon,
  FlagCircle,
  GpsFixed
} from '@mui/icons-material';

const TripDetails = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleViewInMap = (trip) => {
    // Store the selected trip data in localStorage
    localStorage.setItem('tripFormData', JSON.stringify(trip));
    
    // Navigate to the RouteMap page
    navigate('/RouteMap');
  };
  
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/api/trips/${id}/`);
        if (!response.ok) {
          throw new Error(`Error fetching trip: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Trip Data:", data);
        setTrip(data);
      } catch (error) {
        console.error('Error fetching trip details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [id]);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '70vh' 
        }}
      >
        <CircularProgress size={60} thickness={4} sx={{ color: '#3498db' }} />
        <Typography variant="h6" sx={{ mt: 3, color: '#7f8c8d' }}>
          Loading trip details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          padding: 4, 
          textAlign: 'center', 
          maxWidth: '700px', 
          margin: '100px auto', 
          borderRadius: 2,
          backgroundColor: '#fff5f5'
        }}
      >
        <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Trip
        </Typography>
        <Typography variant="body1" paragraph>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          component={RouterLink} 
          to="/log-sheets"
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Back to Log Sheets
        </Button>
      </Paper>
    );
  }

  if (!trip) {
    return null;
  }

  // Calculate estimated time of arrival
  const getEstimatedArrival = () => {
    // This is a placeholder. In a real app, you would use the trip data to calculate this
    const now = new Date();
    now.setHours(now.getHours() + parseInt(trip.current_cycle_used || 0));
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to determine status color
  const getStatusColor = () => {
    const cycleHours = parseInt(trip.current_cycle_used || 0);
    if (cycleHours < 2) return '#2ecc71'; // Green for short trips
    if (cycleHours < 5) return '#f39c12'; // Orange for medium trips
    return '#e74c3c'; // Red for long trips
  };

  return (
    <Box sx={{ 
      maxWidth: '1000px', 
      margin: '40px auto', 
      padding: { xs: '16px', sm: '24px' },
      position: 'relative'
    }}>
      {/* Back button */}
      <Button 
        variant="outlined"
        component={RouterLink}
        to="/log-sheets"
        startIcon={<ArrowBack />}
        sx={{ 
          mb: 3, 
          borderRadius: '8px',
          textTransform: 'none',
        }}
      >
        Back to Log Sheets
      </Button>
      
      {/* Trip ID and Status */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
          Trip Details
        </Typography>
        <Chip 
          icon={<DirectionsTransit />}
          label={'Trip #' + id}
          sx={{ 
            fontWeight: 'bold', 
            backgroundColor: '#e8f4fd', 
            color: '#3498db',
            '& .MuiChip-icon': { color: '#3498db' }
          }}
        />
      </Box>
      
      {/* Main card */}
      <Card 
        elevation={4} 
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
        }}
      >
        {/* Header section with trip status */}
        <Box 
          sx={{ 
            backgroundColor: getStatusColor(),
            padding: '20px 24px',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {trip.current_location || "Trip to Destination"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Estimated arrival: {getEstimatedArrival()}
            </Typography>
          </Box>
          <Box 
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%',
              width: 80,
              height: 80,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backdropFilter: 'blur(5px)'
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              {trip.current_cycle_used || "0"}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              HOURS
            </Typography>
          </Box>
        </Box>
        
        <CardContent sx={{ padding: '24px' }}>
          {/* Locations section */}
          <Paper 
            elevation={0} 
            sx={{ 
              padding: 3, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 2,
              mb: 3
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#34495e', fontWeight: 'bold' }}>
              <Map sx={{ mr: 1, verticalAlign: 'middle' }} />
              Journey Details
            </Typography>
            
            <Grid container spacing={3}>
              {/* Current Location */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar sx={{ 
                    backgroundColor: '#3498db', 
                    width: 42, 
                    height: 42,
                    mr: 2
                  }}>
                    <MyLocation />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '0.5px', mb: 0.5 }}>
                      CURRENT LOCATION
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: '500' }}>
                      {trip.current_location || "Not specified"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              {/* Pickup Location */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar sx={{ 
                    backgroundColor: '#2ecc71', 
                    width: 42, 
                    height: 42,
                    mr: 2
                  }}>
                    <PinDrop />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '0.5px', mb: 0.5 }}>
                      PICKUP LOCATION
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: '500' }}>
                      {trip.pickup_location || "Not specified"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              {/* Dropoff Location */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar sx={{ 
                    backgroundColor: '#e74c3c', 
                    width: 42, 
                    height: 42,
                    mr: 2
                  }}>
                    <FlagCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#7f8c8d', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '0.5px', mb: 0.5 }}>
                      DROPOFF LOCATION
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: '500' }}>
                      {trip.dropoff_location || "Not specified"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Coordinates & Trip Details */}
          <Grid container spacing={3}>
            {/* GPS Coordinates */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  padding: 3, 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: 2,
                  height: '100%'
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, color: '#34495e', fontWeight: 'bold' }}>
                  <GpsFixed sx={{ mr: 1, verticalAlign: 'middle' }} />
                  GPS Coordinates
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    backgroundColor: 'white', 
                    padding: 2, 
                    borderRadius: 1, 
                    border: '1px solid #eee'
                  }}>
                    <Box sx={{ width: '100px', color: '#7f8c8d', fontWeight: 'bold' }}>Latitude</Box>
                    <Box sx={{ flex: 1, color: '#2c3e50' }}>
                      {trip.current_latitude || "Not available"}
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    backgroundColor: 'white', 
                    padding: 2, 
                    borderRadius: 1, 
                    border: '1px solid #eee'
                  }}>
                    <Box sx={{ width: '100px', color: '#7f8c8d', fontWeight: 'bold' }}>Longitude</Box>
                    <Box sx={{ flex: 1, color: '#2c3e50' }}>
                      {trip.current_longitude || "Not available"}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            {/* Cycle Usage */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  padding: 3, 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: 2,
                  height: '100%'
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, color: '#34495e', fontWeight: 'bold' }}>
                  <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Trip Details
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    backgroundColor: 'white', 
                    padding: 2, 
                    borderRadius: 1, 
                    border: '1px solid #eee'
                  }}>
                    <Box sx={{ width: '100px', color: '#7f8c8d', fontWeight: 'bold' }}>Cycle Used</Box>
                    <Box sx={{ flex: 1, color: '#2c3e50', fontWeight: 'medium' }}>
                      {trip.current_cycle_used || "0"} hours
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    backgroundColor: 'white', 
                    padding: 2, 
                    borderRadius: 1, 
                    border: '1px solid #eee'
                  }}>
                    <Box sx={{ width: '100px', color: '#7f8c8d', fontWeight: 'bold' }}>ETA</Box>
                    <Box sx={{ flex: 1, color: '#2c3e50', fontWeight: 'medium' }}>
                      {getEstimatedArrival()}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Action buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button 
              variant="outlined"
              component={RouterLink}
              to="/log-sheets"
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              Back to Log Sheets
            </Button>
            
            <Button 
              variant="contained"
              component={RouterLink}
              to={`/RouteMap/${id}`}
              startIcon={<Map />}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                backgroundColor: '#3498db',
                '&:hover': { backgroundColor: '#2980b9' }
              }}
            >
              View on Map
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TripDetails;