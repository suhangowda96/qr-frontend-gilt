import { Link } from 'react-router-dom';
import { Shield, QrCode, Scan, Database, CheckCircle, Zap, Lock, Download } from 'lucide-react';

const steps = [
  { icon: QrCode, title: 'Scan QR Code', description: 'Scan or paste the QR code URL from the document or product.' },
  { icon: Scan, title: 'Instant Verification', description: 'Our system validates the QR code against the secure database in real-time.' },
  { icon: CheckCircle, title: 'Get Results', description: 'Receive instant verification status: verified, invalid, tampered, or revoked.' },
];

const features = [
  { icon: Lock, title: 'Tamper-proof QR', description: 'Cryptographically secured QR codes that cannot be duplicated or altered without detection.' },
  { icon: Zap, title: 'Real-time Validation', description: 'Instant verification against a centralized database with sub-second response times.' },
  { icon: Database, title: 'Secure Database', description: 'Enterprise-grade encrypted database with role-based access and audit logging.' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300 font-medium">Government-grade Security</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Secure QR
              <span className="text-blue-400"> Verification</span>
              <br />
              System
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl">
              Instantly verify authenticity using QR codes. Protect against counterfeiting, tampering, and fraud with our enterprise-grade verification platform.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {/* APK Download Button */}
              <a
                href="/apk/QRScanner.apk"
                download
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                Download QR Scanner APK
              </a>

              <Link to="/admin/login">
                <button
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 w-full sm:w-auto"
                >
                  Admin Portal
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-3 text-gray-500 text-lg">Three simple steps to verify any QR code</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative text-center p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-5">
                    <Icon className="w-7 h-7 text-blue-600" />
                  </div>

                  <div className="absolute top-12 left-0 right-0 hidden md:block">
                    {idx < steps.length - 1 && (
                      <div className="absolute top-4 right-0 w-1/2 h-px border-t-2 border-dashed border-gray-200" />
                    )}
                  </div>

                  <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 rounded-full px-2.5 py-1 mb-3">
                    Step {idx + 1}
                  </span>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Core Features</h2>
            <p className="mt-3 text-gray-500 text-lg">Built for security, designed for simplicity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to Verify?</h2>

          <p className="mt-3 text-gray-500 text-lg mb-8">
            Download the QR Scanner app and start verifying documents instantly.
          </p>

          <a
            href="/apk/QRScanner.apk"
            download
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Download className="w-4 h-4" />
            Download APK
          </a>
        </div>
      </section>
    </div>
  );
}