import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../components/contexts/AuthContext';
import { Lock } from 'lucide-react';

export default function ProfilePage() {
  const { token, role } = useAuth();   // <-- role from AuthContext
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile edit fields (only used by super admin)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  // Password change fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const API = 'https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/api';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setProfile(data);
        setFullName(data.full_name);
        setEmail(data.email);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/profile/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: fullName, email }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(Object.values(errData).flat().join(' '));
      }
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword !== confirmNew) {
      setPasswordError('New passwords do not match.');
      return;
    }
    try {
      const res = await fetch(`${API}/profile/password/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(Object.values(errData).flat().join(' '));
      }
      setPasswordSuccess('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmNew('');
    } catch (err: any) {
      setPasswordError(err.message);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>

      {/* Profile Update Card – only for super admins */}
      {role === 'super_admin' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Update Information</h2>
          {success && <div className="mb-3 text-sm text-green-600 bg-green-50 p-2 rounded">{success}</div>}
          {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input disabled value={profile.username} className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-50 text-gray-500" />
              <p className="text-xs text-gray-400 mt-1">Username cannot be changed.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Operator read-only profile summary */}
      {role !== 'super_admin' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Information</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <span className="font-medium text-gray-400">Username</span>
              <p className="text-gray-800">{profile.username}</p>
            </div>
            <div>
              <span className="font-medium text-gray-400">Full Name</span>
              <p className="text-gray-800">{profile.full_name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-400">Email</span>
              <p className="text-gray-800">{profile.email}</p>
            </div>
            <div>
              <span className="font-medium text-gray-400">Role</span>
              <p className="text-gray-800 capitalize">{profile.role}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">Only super admins can update these details. You can change your password below.</p>
        </div>
      )}

      {/* Password Change Card – visible to all roles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-600" />
          Change Password
        </h2>
        {passwordSuccess && <div className="mb-3 text-sm text-green-600 bg-green-50 p-2 rounded">{passwordSuccess}</div>}
        {passwordError && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{passwordError}</div>}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              value={confirmNew}
              onChange={(e) => setConfirmNew(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Re-enter new password"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}