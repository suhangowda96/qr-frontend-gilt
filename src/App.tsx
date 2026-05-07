import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import DashboardPage from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import AddRecordPage from './pages/AddRecordPage';
import RecordsPage from './pages/RecordsPage';
import VerifyPage from './pages/VerifyPage';
import AuditLogsPage from './pages/ScanLogsPage';
import UserManagementPage from './pages/UserManagementPage';

// Placeholder pages for other sidebar links
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <p className="text-gray-500 mt-2">This page is under construction.</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          <Route path="/verify" element={<VerifyPage />} />

          {/* Login (no layout) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
            <Route path="/admin/add-record" element={<AddRecordPage />} />
            <Route path="/admin/records" element={<RecordsPage />} />
            <Route path="/admin/logs" element={<AuditLogsPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
