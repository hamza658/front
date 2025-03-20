import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Typography, CircularProgress, Box, Chip, Avatar, Pagination } from '@mui/material';
import { Link } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PlaceIcon from '@mui/icons-material/Place';
import FlagIcon from '@mui/icons-material/Flag';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [itemsPerPage] = useState(6); // Number of items per page

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch('https://trip-logger-app-4.onrender.com/api/trips/');
        const data = await response.json();
        console.log("API Response:", data);

        // Ensure correct data types
        const formattedTrips = data.map((trip) => ({
          ...trip,
          total_hours_worked: Number(trip.total_hours_worked),
          distance_traveled: Number(trip.distance_traveled),
          pickup_time: Number(trip.pickup_time),
          dropoff_time: Number(trip.dropoff_time),
          adverse_conditions: Boolean(trip.adverse_conditions),
        }));

        setTrips(formattedTrips);
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const getRandomGradient = () => {
    const gradients = [
      'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
      'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
      'linear-gradient(135deg, #7303c0 0%, #ec38bc 100%)',
      'linear-gradient(135deg, #3494E6 0%, #EC6EAD 100%)',
      'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
      'linear-gradient(135deg, #834d9b 0%, #d04ed6 100%)'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  const filteredTrips = filterDate
    ? trips.filter(trip => {
        if (!trip.trip_date) {
          console.log("Trip has no date:", trip);
          return false; // Skip trips with no date
        }

        // Parse trip_date into a Date object
        const tripDate = new Date(trip.trip_date);
        if (isNaN(tripDate.getTime())) {
          console.log("Invalid trip date:", trip.trip_date);
          return false; // Skip invalid dates
        }

        // Normalize trip_date and filterDate to "YYYY-MM-DD" format
        const tripDateFormatted = tripDate.toISOString().split('T')[0]; // Format: "YYYY-MM-DD"
        const filterDateFormatted = filterDate.toISOString().split('T')[0]; // Format: "YYYY-MM-DD"

        console.log("Trip Date (Formatted):", tripDateFormatted);
        console.log("Filter Date (Formatted):", filterDateFormatted);
        console.log("Comparison Result:", tripDateFormatted === filterDateFormatted);

        return tripDateFormatted === filterDateFormatted;
      })
    : trips;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // Verification functions
  const verifyHoursWorked = (totalHoursWorked) => {
    const MAX_HOURS = 70;
    return totalHoursWorked <= MAX_HOURS;
  };

  const verifyFueling = (distanceTraveled) => {
    const MAX_DISTANCE = 1000;
    return distanceTraveled <= MAX_DISTANCE;
  };

  const verifyPickupDropoffTime = (pickupTime, dropoffTime) => {
    const MIN_TIME = 1; // 1 hour
    return pickupTime >= MIN_TIME && dropoffTime >= MIN_TIME;
  };

  const verifyAdverseConditions = (adverseConditions) => {
    return !adverseConditions; // No adverse conditions allowed
  };

  const verifyTripAssumptions = (trip) => {
    const { total_hours_worked, distance_traveled, pickup_time, dropoff_time, adverse_conditions } = trip;

    console.log("Trip Data for Verification:", {
      total_hours_worked,
      distance_traveled,
      pickup_time,
      dropoff_time,
      adverse_conditions,
    });

    const hoursWorkedValid = verifyHoursWorked(total_hours_worked);
    const fuelingValid = verifyFueling(distance_traveled);
    const pickupDropoffValid = verifyPickupDropoffTime(pickup_time, dropoff_time);
    const adverseConditionsValid = verifyAdverseConditions(adverse_conditions);

    return {
      hoursWorkedValid,
      fuelingValid,
      pickupDropoffValid,
      adverseConditionsValid,
    };
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '40px 20px',
        backgroundColor: '#f9f9f9',
        minHeight: '100vh'
      }}>
        <Typography variant="h3" gutterBottom align="center" sx={{ fontWeight: '700', marginBottom: '40px', color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '1px', position: 'relative', '&:after': { content: '""', position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '4px', backgroundColor: '#3498db', borderRadius: '2px' } }}>
          My Trips
        </Typography>

        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <DatePicker
            label="Filter by Date"
            value={filterDate}
            onChange={(newValue) => setFilterDate(newValue)}
            sx={{ width: '300px', backgroundColor: 'white', borderRadius: '8px', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
            <CircularProgress size={60} thickness={4} sx={{ color: '#3498db' }} />
            <Typography variant="h6" sx={{ mt: 3, color: '#7f8c8d' }}>Loading your trips...</Typography>
          </Box>
        ) : filteredTrips.length === 0 ? (
          <Box sx={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h5" sx={{ color: '#7f8c8d', mb: 2 }}>No trips found</Typography>
            <Typography variant="body1" sx={{ color: '#95a5a6' }}>{filterDate ? 'No trips match the selected date.' : 'Create a new trip to get started.'}</Typography>
            <Button variant="contained" sx={{ mt: 3, backgroundColor: '#3498db', '&:hover': { backgroundColor: '#2980b9' } }} component={Link} to="/">Create Trip</Button>
          </Box>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
              {currentTrips.map((trip) => (
                <Card
                  key={trip.id}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transition: 'all 0.3s ease',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 16px 32px rgba(0,0,0,0.15)',
                      cursor: 'pointer', // Add pointer cursor on hover
                    },
                  }}
                  onClick={() => console.log("Trip Data:", trip)} // Log trip data on click
                >
                  <Box sx={{ background: getRandomGradient(), padding: '25px 20px', position: 'relative' }}>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.2)', mb: 1 }}>{trip.destination || 'Trip'}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <DirectionsCarIcon sx={{ color: 'white', opacity: 0.9 }} fontSize="small" />
                      <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>Trip #{trip.id}</Typography>
                    </Box>
                    <Chip icon={<AccessTimeIcon sx={{ color: 'white !important' }} />} label={trip.current_cycle_used ? `${trip.current_cycle_used} hours` : 'N/A'} sx={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', color: 'white', fontWeight: 'bold', '& .MuiChip-icon': { color: 'white' } }} />
                  </Box>
                  <CardContent sx={{ backgroundColor: 'white', padding: '25px 20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Avatar sx={{ backgroundColor: '#e74c3c', width: 36, height: 36, mr: 1.5 }}><PlaceIcon /></Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: '#7f8c8d', fontSize: '0.85rem' }}>PICKUP</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#2c3e50' }}>{trip.pickup_location || 'Not specified'}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Avatar sx={{ backgroundColor: '#2ecc71', width: 36, height: 36, mr: 1.5 }}><FlagIcon /></Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: '#7f8c8d', fontSize: '0.85rem' }}>DROPOFF</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#2c3e50' }}>{trip.dropoff_location || 'Not specified'}</Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Verification Results */}
                    <Box sx={{ mt: 'auto', pt: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: '#7f8c8d', fontSize: '0.85rem' }}>Verification:</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: verifyTripAssumptions(trip).hoursWorkedValid ? '#2ecc71' : '#e74c3c' }}>
                          {verifyTripAssumptions(trip).hoursWorkedValid ? '✔ Hours Worked: Valid' : '✖ Hours Worked: Exceeds 70 hours/8 days'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: verifyTripAssumptions(trip).fuelingValid ? '#2ecc71' : '#e74c3c' }}>
                          {verifyTripAssumptions(trip).fuelingValid ? '✔ Fueling: Valid' : '✖ Fueling: Exceeds 1,000 miles'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: verifyTripAssumptions(trip).pickupDropoffValid ? '#2ecc71' : '#e74c3c' }}>
                          {verifyTripAssumptions(trip).pickupDropoffValid ? '✔ Pickup/Drop-off: Valid' : '✖ Pickup/Drop-off: Less than 1 hour'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: verifyTripAssumptions(trip).adverseConditionsValid ? '#2ecc71' : '#e74c3c' }}>
                          {verifyTripAssumptions(trip).adverseConditionsValid ? '✔ No Adverse Conditions' : '✖ Adverse Conditions Reported'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 'auto', pt: 2 }}>
                      <Button variant="contained" fullWidth component={Link} to={`/trip-details/${trip.id}`} sx={{ borderRadius: '8px', backgroundColor: '#3498db', color: 'white', padding: '12px', fontWeight: 'bold', textTransform: 'none', boxShadow: '0 4px 6px rgba(52, 152, 219, 0.25)', '&:hover': { backgroundColor: '#2980b9', boxShadow: '0 6px 10px rgba(52, 152, 219, 0.4)' } }}>View Trip Details</Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(filteredTrips.length / itemsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                sx={{ '& .MuiPaginationItem-root': { fontSize: '1rem' } }}
              />
            </Box>
          </>
        )}
      </div>
    </LocalizationProvider>
  );
};

export default Trips;