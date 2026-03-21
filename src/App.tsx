import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ClipApp from './pages/ClipApp';
import ForfApp from './pages/ForfApp';
import BotApp from './pages/BotApp';
import PromptApp from './pages/PromptApp';
import Signup from './pages/Signup';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

const App: React.FC = () => {
  // Force light mode globally
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <AuthProvider>
      <div
        style={{
          minHeight: '100vh',
          fontFamily: '"Inter", system-ui, sans-serif',
        }}
      >
        <Navbar />

        <main>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected user routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected admin route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected app routes */}
            <Route path="/app/clip" element={<ProtectedRoute><ClipApp /></ProtectedRoute>} />
            <Route path="/app/forf" element={<ProtectedRoute><ForfApp /></ProtectedRoute>} />
            <Route path="/app/bot" element={<ProtectedRoute><BotApp /></ProtectedRoute>} />
            <Route path="/app/prompt" element={<ProtectedRoute><PromptApp /></ProtectedRoute>} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;
