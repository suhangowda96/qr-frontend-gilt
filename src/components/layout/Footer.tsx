import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">QR Verify</span>
            </div>
            <p className="text-sm leading-relaxed">
              Secure QR code verification system for instant authenticity validation.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-sm hover:text-white transition-colors">Home</Link>
              <Link to="/admin/login" className="block text-sm hover:text-white transition-colors">Admin Login</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
            <div className="space-y-2">
              <span className="block text-sm hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              <span className="block text-sm hover:text-white transition-colors cursor-pointer">Terms of Service</span>
              <span className="block text-sm hover:text-white transition-colors cursor-pointer">Security</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} QR Verify System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
