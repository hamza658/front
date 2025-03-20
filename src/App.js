import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './component/Layout/MainLayout.js';
import TripForm from './component/TripForm.js';
import RouteMap from './component/RouteMap.js';
import LogSheets from './component/LogSheets.js';
import TripDetails from './component/TripDetail.js';
import Dashboard from './component/Dashboard.js';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <MainLayout>
            <TripForm />
          </MainLayout>
        } />
        <Route path="/dashboard" element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        } />
        <Route path="/RouteMap" element={
          <MainLayout>
            <RouteMap />
          </MainLayout>
        } />
        <Route path="/log-sheets" element={
          <MainLayout>
            <LogSheets />
          </MainLayout>
        } />
        <Route path="/trip-details/:id" element={
          <MainLayout>
            <TripDetails />
          </MainLayout>
        } />
        <Route path="*" element={
          <MainLayout>
            <TripForm />
          </MainLayout>
        } />
        <Route path="/RouteMap/:id" element={
          <MainLayout>
            <RouteMap />
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;