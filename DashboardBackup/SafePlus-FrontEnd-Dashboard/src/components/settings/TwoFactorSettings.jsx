import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

const TwoFactorSettings = () => {
  const [enabled, setEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [code, setCode] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/api/user/2fa/status`, { withCredentials: true })
      .then(res => setEnabled(res.data.enabled))
      .catch(err => console.error('Failed to fetch 2FA status:', err));
  }, []);

  const handleToggleChange = async () => {
    if (enabled) {
      try {
        await axios.post(`${API_URL}/api/user/2fa/disable`, {}, { withCredentials: true });
        setEnabled(false);
        setQrCodeUrl('');
        setCode('');
        toast.success('Two-Factor Authentication disabled');
      } catch (err) {
        console.error('Disable 2FA failed:', err);
        toast.error('Failed to disable 2FA');
      }
    } else {
      try {
        const res = await axios.post(`${API_URL}/api/user/2fa/generate`, {}, { withCredentials: true });
        setQrCodeUrl(res.data.qrCode);
        setShowSetup(true);
        toast.success('Scan the QR code using your authenticator app');
      } catch (err) {
        console.error('Generate QR failed:', err);
        toast.error('Failed to generate QR code');
      }
    }
  };

  const handleVerifyCode = async () => {
    setIsVerifying(true);
    try {
      const res = await axios.post(`${API_URL}/api/user/2fa/verify`, { code }, { withCredentials: true });

      if (res.data.success) {
        await axios.post(`${API_URL}/api/user/2fa/enable`, { code }, { withCredentials: true });
        setEnabled(true);
        setShowSetup(false);
        toast.success('Two-Factor Authentication enabled!');
      } else {
        toast.error('Invalid code. Please try again.');
      }
    } catch (err) {
      console.error('Verification failed:', err);
      toast.error('Error verifying code');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="account-box relative">
      <h2 className="account-heading text-xl font-semibold">Two-Factor Authentication</h2>
      <hr className="account-divider mb-4" />

      <div className="flex items-center justify-between">
        <p className={`font-medium ${enabled ? 'text-green-600' : 'text-red-500'}`}>
          2FA is currently <strong>{enabled ? 'enabled' : 'disabled'}</strong>
        </p>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggleChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:left-[4px] after:top-[3px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-transform after:duration-300 peer-checked:after:translate-x-full"></div>
        </label>
      </div>

      {showSetup && qrCodeUrl && !enabled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-sm">
            <h3 className="text-lg font-semibold mb-2 text-center">Enable 2FA</h3>
            <p className="text-sm text-gray-600 mb-4 text-center">Scan this QR code using your authenticator app and enter the code below.</p>

            <img src={qrCodeUrl} alt="QR code" className="w-40 mx-auto mb-4 border p-2 rounded" />

            <input
              type="text"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="border w-full p-2 rounded mb-4"
            />

            <div className="flex justify-between">
              <button
                onClick={() => setShowSetup(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyCode}
                disabled={isVerifying}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
              >
                {isVerifying ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSettings;
