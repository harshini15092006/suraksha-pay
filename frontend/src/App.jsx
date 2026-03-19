import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage   from './pages/LandingPage';
import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';
import Dashboard     from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import PolicyPage    from './pages/PolicyPage';
import ClaimsPage    from './pages/ClaimsPage';
import Layout        from './components/Layout';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 font-body">Loading SurakshaPay...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/policy"    element={<PolicyPage />} />
            <Route path="/claims"    element={<ClaimsPage />} />
          </Route>
          <Route path="/admin" element={<ProtectedRoute adminOnly><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
