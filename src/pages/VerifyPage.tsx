import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Shield, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface SocietyInfo {
  id: string;
  name: string;
  district: string;
  state: string;
  reg_date: string;
  contact: string;
  mobile: string;
}

interface VerifyResult {
  valid: boolean;
  status: string;
  message?: string;
  society?: SocietyInfo;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app';

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (_) {}
}

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const sig = searchParams.get('sig');

  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scannerActive, setScannerActive] = useState(!(id && sig));

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerRunning = useRef(false);
  const isProcessing = useRef(false);

  const verifyDirect = useCallback(async (socId: string, signature: string) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/public/verify?id=${encodeURIComponent(socId)}&sig=${encodeURIComponent(signature)}`);
      const data: VerifyResult = await res.json();
      setResult(data);
    } catch {
      setError('Unable to verify. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id && sig) {
      verifyDirect(id, sig);
    }
  }, [id, sig, verifyDirect]);

  const handleScanned = useCallback(async (rawText: string) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    playBeep();

    const token = rawText.trim();
    if (scannerRef.current && scannerRunning.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRunning.current = false;
    }
    setScannerActive(false);
    setLoading(true);
    setError('');

    try {
      const exchangeRes = await fetch(`${API_BASE}/api/exchange-token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!exchangeRes.ok) throw new Error('Invalid QR code');
      const exchangeData = await exchangeRes.json();
      const { id: realId, signature: realSig } = exchangeData;
      if (!realId || !realSig) throw new Error('Invalid QR data');

      const verifyRes = await fetch(`${API_BASE}/api/public/verify?id=${encodeURIComponent(realId)}&sig=${encodeURIComponent(realSig)}`);
      const verifyData: VerifyResult = await verifyRes.json();
      setResult(verifyData);
    } catch (err: any) {
      setError(err.message || 'Could not verify QR code.');
    } finally {
      setLoading(false);
      isProcessing.current = false;
    }
  }, []);

  useEffect(() => {
    if (!scannerActive) return;

    const containerId = 'qr-scanner';
    let cancelled = false;

    const startScanner = async () => {
      try {
        // Small delay to ensure the container is rendered
        await new Promise(resolve => setTimeout(resolve, 100));

        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            // No qrbox → the whole container becomes the scanning area
          },
          (decodedText: string) => {
            if (!cancelled) handleScanned(decodedText);
          },
          (errorMessage: string) => {
            if (!errorMessage.includes('IndexSizeError') && !errorMessage.includes('parse error')) {
              console.warn(errorMessage);
            }
          }
        );
        scannerRunning.current = true;
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setError('Camera access denied. Please allow camera permissions.');
          setScannerActive(false);
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      if (scannerRef.current && scannerRunning.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRunning.current = false;
      }
      scannerRef.current?.clear();
    };
  }, [scannerActive, handleScanned]);

  const switchToScanner = () => {
    setResult(null);
    setError('');
    isProcessing.current = false;
    setScannerActive(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="text-center animate-pulse">
          <Shield className="w-16 h-16 mx-auto text-blue-600" />
          <p className="mt-6 text-xl font-semibold text-gray-700">Verifying society...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Scanner mode */}
        {scannerActive && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Scan Cooperative QR</h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">Point your camera at the QR code</p>
            <div
              id="qr-scanner"
              className="mx-auto rounded-2xl overflow-hidden"
              style={{
                width: '100%',
                aspectRatio: '1 / 1',       // perfect square
                border: '2px solid #d1d5db',
              }}
            />
            <p className="mt-4 text-xs text-gray-400">The camera will automatically detect the QR code</p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm text-left">
                <XCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Result display (unchanged) */}
        {!scannerActive && result && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-fadeIn">
            <div className="text-center mb-6">
              {result.valid ? (
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-800">
                {result.valid ? 'Verified' : result.status === 'tampered' ? 'Tampered' : result.status === 'revoked' ? 'Revoked' : 'Invalid'}
              </h1>
              <p className="text-sm text-gray-500 mt-2">{result.message || (result.valid ? 'Society is active and valid.' : '')}</p>
            </div>

            {result.society && (
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-gray-400">Society ID</span>
                  <span className="text-sm font-mono text-gray-900">{result.society.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-gray-400">Name</span>
                  <span className="text-sm font-semibold text-gray-900">{result.society.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-gray-400">District</span>
                  <span className="text-sm text-gray-900">{result.society.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-gray-400">State</span>
                  <span className="text-sm text-gray-900">{result.society.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-gray-400">Reg. Date</span>
                  <span className="text-sm text-gray-900">{result.society.reg_date}</span>
                </div>
                {result.society.contact && (
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-400">Contact</span>
                    <span className="text-sm text-gray-900">{result.society.contact}</span>
                  </div>
                )}
                {result.society.mobile && (
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-400">Mobile</span>
                    <span className="text-sm text-gray-900">{result.society.mobile}</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={switchToScanner}
              className="mt-8 w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Camera className="w-5 h-5" />
              Scan Another QR
            </button>
          </div>
        )}

        {/* Error with no result */}
        {!scannerActive && error && !result && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-center">
            <XCircle className="w-16 h-16 mx-auto text-red-500" />
            <p className="mt-4 text-lg font-semibold text-red-700">{error}</p>
            <button
              onClick={switchToScanner}
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Camera className="w-5 h-5" />
              Try Scanning Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
