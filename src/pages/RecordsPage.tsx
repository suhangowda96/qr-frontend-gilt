import { useState, useEffect } from 'react';
import { useAuth } from '../components/contexts/AuthContext';
import {
  Edit3, Download, ToggleLeft, ToggleRight,
  X, AlertTriangle, Search, QrCode, RefreshCw, CheckCircle
} from 'lucide-react';

interface Society {
  id: string;
  name: string;
  district: string;
  state: string;
  reg_date: string;
  contact: string;
  mobile: string;
  status: string;
  created_at: string;
  qr_token?: string | null;
}

interface EditFormData {
  id: string;
  name: string;
  district: string;
  state: string;
  reg_date: string;
  contact: string;
  mobile: string;
}

export default function RecordsPage() {
  const { token, logout } = useAuth();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit modal
  const [editingSociety, setEditingSociety] = useState<Society | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    id: '',
    name: '',
    district: '',
    state: '',
    reg_date: '',
    contact: '',
    mobile: '',
  });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // QR Preview modal
  const [qrPreview, setQrPreview] = useState<{ id: string; name: string } | null>(null);

  // Regenerate confirmation modal
  const [regenerateTarget, setRegenerateTarget] = useState<Society | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  // Success message
  const [successMessage, setSuccessMessage] = useState('');

  // ---------- Data fetching ----------
  const fetchSocieties = async () => {
    try {
      const res = await fetch('https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/api/societies/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSocieties(Array.isArray(data) ? data : data.results ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocieties();
  }, [token]);

  // ---------- Toggle status ----------
  const toggleStatus = async (society: Society) => {
    const newStatus = society.status === 'active' ? 'revoked' : 'active';
    try {
      const res = await fetch(`https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/api/societies/${society.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchSocieties();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  // ---------- Edit modal ----------
  const openEditModal = (society: Society) => {
    setEditingSociety(society);
    setEditForm({
      id: society.id,
      name: society.name,
      district: society.district,
      state: society.state,
      reg_date: society.reg_date.split('/').reverse().join('-'),
      contact: society.contact,
      mobile: society.mobile,
    });
    setEditError('');
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    if (!editForm.id || !editForm.name || !editForm.district || !editForm.reg_date) {
      setEditError('Please fill all required fields.');
      return;
    }
    setEditLoading(true);
    try {
      const apiDate = editForm.reg_date.split('-').reverse().join('/');
      const res = await fetch(`https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/api/societies/${editingSociety!.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editForm,
          reg_date: apiDate,
        }),
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) {
        const data = await res.json();
        const errMsg = typeof data === 'object' ? Object.values(data).flat().join(' ') : data;
        throw new Error(errMsg);
      }
      setEditingSociety(null);
      fetchSocieties();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // ---------- QR actions ----------
  const handleViewQr = (society: Society) => {
    setQrPreview({ id: society.id, name: society.name });
  };

  const handleDownloadQr = (societyId: string) => {
    const link = document.createElement('a');
    link.href = `https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/qr/${societyId}/`;
    link.download = `${societyId}.png`;
    link.click();
  };

  const initiateRegenerate = (society: Society) => {
    setRegenerateTarget(society);
  };

  const confirmRegenerate = async () => {
    if (!regenerateTarget) return;
    setRegenerating(true);
    try {
      const res = await fetch(`https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/api/societies/${regenerateTarget.id}/generate-qr/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchSocieties(); // refresh qr_token
        setSuccessMessage(`QR code for "${regenerateTarget.name}" regenerated successfully.`);
        // Auto-dismiss after 4 seconds
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        alert('Failed to regenerate QR');
      }
    } catch (err) {
      alert('Error regenerating QR');
    } finally {
      setRegenerating(false);
      setRegenerateTarget(null);
    }
  };

  // ---------- Export ----------
  const downloadExcel = () => {
    import('xlsx').then(XLSX => {
      const data = societies.map(s => ({
        ID: s.id,
        Name: s.name,
        District: s.district,
        State: s.state,
        'Registration Date': s.reg_date,
        Contact: s.contact,
        Mobile: s.mobile,
        Status: s.status,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Societies');
      XLSX.writeFile(wb, 'societies.xlsx');
    });
  };

  // ---------- Filtering ----------
  const filteredSocieties = societies.filter(s => {
    const matchesSearch =
      searchText === '' ||
      s.id.toLowerCase().includes(searchText.toLowerCase()) ||
      s.name.toLowerCase().includes(searchText.toLowerCase()) ||
      s.district.toLowerCase().includes(searchText.toLowerCase()) ||
      s.state.toLowerCase().includes(searchText.toLowerCase()) ||
      s.reg_date.toLowerCase().includes(searchText.toLowerCase()) ||
      s.contact.toLowerCase().includes(searchText.toLowerCase()) ||
      s.mobile.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Society Records</h1>

      {/* Success Banner */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by ID, name, district, contact..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="revoked">Revoked</option>
        </select>
        <button
          onClick={downloadExcel}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg. Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">QR</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSocieties.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredSocieties.map(society => (
                  <tr key={society.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{society.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{society.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{society.district}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{society.state}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{society.reg_date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        society.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {society.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {society.qr_token ? (
                        <span className="inline-flex items-center gap-1 text-green-700 text-xs">
                          <QrCode className="w-4 h-4" />
                          Ready
                        </span>
                      ) : (
                        <span className="text-red-500 text-xs">Not Generated</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Edit */}
                        <button onClick={() => openEditModal(society)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {/* Toggle status */}
                        <button
                          onClick={() => toggleStatus(society)}
                          className={`p-1.5 rounded ${
                            society.status === 'active' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={society.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {society.status === 'active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        {/* QR actions */}
                        {society.qr_token ? (
                          <>
                            <button onClick={() => handleViewQr(society)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View QR">
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button onClick={() => initiateRegenerate(society)} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded" title="Regenerate QR">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => initiateRegenerate(society)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Generate QR">
                            <QrCode className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {filteredSocieties.length} of {societies.length} records
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      {editingSociety && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setEditingSociety(null)}></div>
            <div className="relative bg-white rounded-xl shadow-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Edit Society</h2>
                <button onClick={() => setEditingSociety(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5" />
                  {editError}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID</label>
                  <input type="text" value={editForm.id} readOnly className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input name="name" value={editForm.name} onChange={handleEditChange} required className="mt-1 w-full px-3 py-2 border rounded-md" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">District *</label>
                    <input name="district" value={editForm.district} onChange={handleEditChange} required className="mt-1 w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input name="state" value={editForm.state} onChange={handleEditChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Date *</label>
                  <input type="date" name="reg_date" value={editForm.reg_date} onChange={handleEditChange} required className="mt-1 w-full px-3 py-2 border rounded-md" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                    <input name="contact" value={editForm.contact} onChange={handleEditChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile</label>
                    <input name="mobile" value={editForm.mobile} onChange={handleEditChange} className="mt-1 w-full px-3 py-2 border rounded-md" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setEditingSociety(null)} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                  <button type="submit" disabled={editLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* QR Preview Modal */}
      {qrPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setQrPreview(null)}></div>
            <div className="relative bg-white rounded-xl shadow-lg max-w-sm w-full p-6 text-center">
              <button onClick={() => setQrPreview(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold mb-2">{qrPreview.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{qrPreview.id}</p>
              <img
                src={`https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/qr/${qrPreview.id}/`}
                alt="QR Code"
                className="w-48 h-48 mx-auto border rounded"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="mt-4 flex justify-center gap-3">
                <button
                  onClick={() => handleDownloadQr(qrPreview.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => {
                    setQrPreview(null);
                    const society = societies.find(s => s.id === qrPreview.id);
                    if (society) initiateRegenerate(society);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Confirmation Dialog */}
      {regenerateTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setRegenerateTarget(null)}></div>
            <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center">
              <button onClick={() => setRegenerateTarget(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
              <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Regenerate QR Code?</h3>
              <p className="text-sm text-gray-600 mb-1">
                Society: <span className="font-semibold">{regenerateTarget.name}</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                ID: <span className="font-mono">{regenerateTarget.id}</span>
              </p>
              <p className="text-xs text-red-600 mb-4">
                ⚠ Any previously printed QR code will stop working.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setRegenerateTarget(null)}
                  className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRegenerate}
                  disabled={regenerating}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 text-sm"
                >
                  {regenerating ? 'Regenerating...' : 'Yes, Regenerate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}