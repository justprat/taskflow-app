import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProjectDetailsPage from './pages/ProjectDetailsPage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';

/**
 * Main application routes and context wrappers.
 */
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public auth pathways */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Authenticated layout containing sidebar, header, and outlets */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Index route is the Dashboard overview */}
          <Route index element={<Dashboard />} />
          
          {/* Individual Project detailed task board */}
          <Route path="project/:id" element={<ProjectDetailsPage />} />
        </Route>

        {/* Catch-all fallback pathway -> redirects home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
