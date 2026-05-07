import { useState, FormEvent } from 'react';
import { useAuth } from '../components/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, ArrowLeft, AlertTriangle } from 'lucide-react';

interface SocietyForm {
  id: string;
  name: string;
  district: string;
  state: string;
  reg_date: string;
  contact: string;
  mobile: string;
}

// Store per‑field errors
interface FieldErrors {
  id?: string;
  name?: string;
  district?: string;
  state?: string;
  reg_date?: string;
  contact?: string;
  mobile?: string;
  non_field_errors?: string;
}

const initialForm: SocietyForm = {
  id: '',
  name: '',
  district: '',
  state: 'KARNATAKA',
  reg_date: '',
  contact: '',
  mobile: '',
};

const toDisplayDate = (isoDate: string) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

export default function AddRecordPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<SocietyForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user types
    if (errors[name as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');

    if (!form.id || !form.name || !form.district || !form.reg_date) {
      setErrors({ non_field_errors: 'Please fill all required fields (ID, Name, District, Registration Date).' });
      return;
    }

    setLoading(true);
    try {
      const apiDate = toDisplayDate(form.reg_date);
      const res = await fetch('https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/api/societies/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: form.id,
          name: form.name,
          district: form.district,
          state: form.state,
          reg_date: apiDate,
          contact: form.contact,
          mobile: form.mobile,
        }),
      });

      if (res.status === 401) {
        logout();
        navigate('/admin/login', { state: { message: 'Session expired. Please log in again.' } });
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        // Process field‑level errors
        if (typeof data === 'object' && data !== null) {
          const fieldErrors: FieldErrors = {};
          // Map backend field errors to our interface
          Object.keys(data).forEach((key) => {
            const value = data[key];
            if (Array.isArray(value)) {
              fieldErrors[key as keyof FieldErrors] = value.join(' ');
            } else if (typeof value === 'string') {
              fieldErrors[key as keyof FieldErrors] = value;
            }
          });
          // If there is a non‑field error (like 'non_field_errors')
          if (data.detail) {
            fieldErrors.non_field_errors = data.detail;
          }
          setErrors(fieldErrors);
        } else {
          setErrors({ non_field_errors: data.toString() });
        }
        return;
      }

      setSuccess(`Society "${data.name}" (${data.id}) created successfully!`);
      setForm(initialForm);
    } catch (err: any) {
      setErrors({ non_field_errors: err.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/records" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Add New Society</h1>
            <p className="text-sm text-gray-500">Register a cooperative society in the system</p>
          </div>
        </div>
        <div className="hidden sm:block">
          <PlusCircle className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* General error */}
        {errors.non_field_errors && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errors.non_field_errors}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            {success}
            <button
              onClick={() => navigate('/admin/records')}
              className="ml-2 underline font-medium hover:text-green-800"
            >
              View Records
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ID */}
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700">
              Society ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="id"
              name="id"
              value={form.id}
              onChange={handleChange}
              placeholder="SOC-KA-2025-0011"
              className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.id ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.id && (
              <p className="mt-1 text-sm text-red-600">{errors.id}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Society Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full cooperative society name"
              className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* District & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="e.g. BENGALURU URBAN"
                className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.district ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.district && (
                <p className="mt-1 text-sm text-red-600">{errors.district}</p>
              )}
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={form.state}
                onChange={handleChange}
                className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>
          </div>

          {/* Registration Date */}
          <div>
            <label htmlFor="reg_date" className="block text-sm font-medium text-gray-700">
              Registration Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="reg_date"
              name="reg_date"
              value={form.reg_date}
              onChange={handleChange}
              className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.reg_date ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              {form.reg_date
                ? `Will be saved as: ${toDisplayDate(form.reg_date)}`
                : 'Select a date from the calendar'}
            </p>
            {errors.reg_date && (
              <p className="mt-1 text-sm text-red-600">{errors.reg_date}</p>
            )}
          </div>

          {/* Contact & Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                Contact Person
              </label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="Name of contact"
                className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.contact ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.contact && (
                <p className="mt-1 text-sm text-red-600">{errors.contact}</p>
              )}
            </div>
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <input
                type="text"
                id="mobile"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Phone number"
                className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.mobile ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setForm(initialForm);
                setErrors({});
                setSuccess('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Society'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}