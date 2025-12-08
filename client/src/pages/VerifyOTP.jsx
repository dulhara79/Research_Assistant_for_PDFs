import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/authUI/Input";
import Button from "../components/authUI/Button";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the email passed from the previous page
  const email = location.state?.email;

  // Redirect if no email found (user tried to access page directly)
  if (!email) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await verifyOtp(email, otp);
      // AuthContext handles redirect to /chat on success
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid Code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-4">Check your Email</h2>
        <p className="text-slate-400 mb-6">
          We sent a code to <span className="text-white">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="OTP Code"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <Button type="submit" isLoading={loading} className="w-full">
            Verify & Enter Chat
          </Button>
        </form>
      </div>
    </div>
  );
}
