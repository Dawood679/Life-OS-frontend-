import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem('otpEmail') || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) { setError('OTP is required'); return; }
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      sessionStorage.removeItem('otpEmail');
      navigate('/dashboard');
    } catch {
      setError('Unable to connect to server. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">Verify OTP</h2>
        <p className="text-gray-500 text-sm text-center mb-6">OTP sent to <strong>{email}</strong></p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength={6}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-lg"
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
}