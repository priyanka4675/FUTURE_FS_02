import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import Login from './pages/Login';
import Setup from './pages/Setup';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0f1117' }}>
      <div style={{ color:'#06b6d4', fontFamily:'Space Grotesk', fontSize:'1.2rem' }}>Loading...</div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="leads/:id" element={<LeadDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background:'#1e2536', color:'#e2e8f0', border:'1px solid rgba(255,255,255,0.1)' },
          success: { iconTheme: { primary:'#10b981', secondary:'#1e2536' } },
          error: { iconTheme: { primary:'#ef4444', secondary:'#1e2536' } }
        }}
      />
      <AppRoutes />
    </AuthProvider>
  );
}
