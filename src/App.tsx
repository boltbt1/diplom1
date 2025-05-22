import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeInterface from './pages/EmployeeInterface';
import ResidentInterface from './pages/ResidentInterface';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user } = useAuth();
  
  return (
    <div className="app min-h-screen bg-background">
      <Routes>
        <Route path="/" element={
          user ? (
            <Navigate 
              to={
                user.role === 'admin' ? '/admin' : 
                user.role === 'employee' ? '/employee' :
                '/resident'
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
            <ProtectedRoute role="resident">
              <ResidentInterface />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/employee/*" 
          element={
            <ProtectedRoute role="employee">
              <EmployeeInterface />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute role="admin">
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;