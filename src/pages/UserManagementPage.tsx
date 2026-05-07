import { useState, useEffect } from 'react';
import { useAuth } from '../components/contexts/AuthContext';
import { Edit3, UserPlus, KeyRound, ToggleLeft, ToggleRight, X, AlertTriangle, ShieldAlert } from 'lucide-react';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  date_joined: string;
}

const emptyForm = { username: '', email: '', password: '', full_name: '', role: 'operator' };

export default function UserManagementPage() {
  const { token, role, logout } = useAuth();   // <-- role comes from AuthContext
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Redirect if not super admin
  if (role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 max-w-md">
          <ShieldAlert className="w-12 h-12 mx-auto text-red-400" />
          <h2 className="mt-4 text-xl font-bold text-gray-800">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-500">
            You do not have permission to manage users. Only super admins can access this page.
          </p>
        </div>
      </div>
    );
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/api/users/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.results ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleAddNew = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setForm({ username: user.username, email: user.email, password: '', full_name: user.full_name, role: user.role });
    setFormError('');
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.username || !form.email || !form.full_name) {
      setFormError('Please fill all required fields.');
      return;
    }
    if (!editingUser && !form.password) {
      setFormError('Password is required for new user.');
      return;
    }
    setSaving(true);
    try {
      const url = editingUser
        ? `https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/api/users/${editingUser.username}/`
        : 'https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/api/users/';
      const method = editingUser ? 'PUT' : 'POST';
      const body: any = {
        username: form.username,
        email: form.email,
        full_name: form.full_name,
        role: form.role,
      };
      if (form.password) body.password = form.password;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(typeof data === 'object' ? Object.values(data).flat().join(' ') : data);
      }
      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleUserStatus = async (user: AdminUser) => {
    try {
      const res = await fetch(`https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/api/users/${user.username}/toggle-status/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      alert('Error toggling status.');
    }
  };

  const openChangePassword = (user: AdminUser) => {
    setPasswordUser(user);
    setNewPassword('');
    setPasswordError('');
  };

  const submitPasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch(`https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/api/users/${passwordUser!.username}/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ new_password: newPassword }),
      });
      if (!res.ok) throw new Error('Failed to change password');
      setPasswordUser(null);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{u.username}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{u.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 text-sm capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => openChangePassword(u)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded" title="Change Password">
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleUserStatus(u)} className={`p-1.5 rounded ${u.is_active ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`} title={u.is_active ? 'Deactivate' : 'Activate'}>
                        {u.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal (unchanged) */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowForm(false)}></div>
            <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <button onClick={() => setShowForm(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              <h2 className="text-lg font-bold mb-4">{editingUser ? 'Edit User' : 'Add User'}</h2>
              {formError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-0.5" />{formError}</div>}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="mt-1 w-full px-3 py-2 border rounded-md" required disabled={!!editingUser} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="mt-1 w-full px-3 py-2 border rounded-md" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1 w-full px-3 py-2 border rounded-md" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password {!editingUser && <span className="text-red-500">*</span>}</label>
                  <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="mt-1 w-full px-3 py-2 border rounded-md" placeholder={editingUser ? "Leave blank to keep unchanged" : ""} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="mt-1 w-full px-3 py-2 border rounded-md">
                    <option value="operator">Operator</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal (unchanged) */}
      {passwordUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setPasswordUser(null)}></div>
            <div className="relative bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
              <button onClick={() => setPasswordUser(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              <h2 className="text-lg font-bold mb-4">Change Password for {passwordUser.username}</h2>
              {passwordError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">{passwordError}</div>}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md" minLength={6} required />
                </div>
                <button onClick={submitPasswordChange} disabled={changingPassword} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{changingPassword ? 'Updating...' : 'Update Password'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}