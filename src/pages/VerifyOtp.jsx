import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../lib/authStore";
import Button from "../components/Button";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const type = location.state?.type || "login";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp.trim() || otp.length !== 6) {
      setError("OTP is required");
      return;
    }

    console.log("email:", email);
    console.log("otp:", otp);
    console.log("type:", type);

    setLoading(true);
    try {
      const url =
        type === "login"
          ? "http://localhost:5000/api/auth/verify-login-otp"
          : "http://localhost:5000/api/auth/verify-forgot-otp";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      if (type === "login") {
        setUser(data.user);
        navigate("/dashboard");
      } else {
        navigate("/reset-password", {
          state: { email },
        });
      }
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">Verify OTP</h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          OTP sent to <strong>{email}</strong>
        </p>
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
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>
        <p className="text-center text-sm mt-4 text-gray-500">
          Didn't receive OTP?{" "}
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-600 hover:underline"
          >
            Go back and try again
          </button>
        </p>
      </div>
    </div>
  );
}