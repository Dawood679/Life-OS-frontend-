import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/auth/verify-email/${token}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage('Email verified successfully! Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(data.message);
        }
      })
      .catch(() => setError('Unable to connect to server.'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p className="text-green-600">{message}</p>
        )}
      </div>
    </div>
  );
}