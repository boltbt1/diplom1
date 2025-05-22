import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeInterface from './pages/EmployeeInterface';
import ResidentInterface from './pages/ResidentInterface';
import NotFound from './pages/NotFound';

function App() {
  const { user } = useAuth();
  
  return (
    <div className="app min-h-screen bg-background">
      <Routes>
        <Route path="/" element={
          user ? (
            <Navigate 
              to={
                user.role === 'resident' ? '/resident' : '/employee'
              } 
              replace 
            />
          ) : (
            <Login />
          )
        } />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/resident/*" 
          element={
            user?.role === 'resident' ? (
              <ResidentInterface />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        <Route 
          path="/employee/*" 
          element={
            user?.role !== 'resident' ? (
              <EmployeeInterface />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;