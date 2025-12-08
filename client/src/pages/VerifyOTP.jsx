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
<div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      
      {/* Card: bg-white, border-slate-200, shadow-xl */}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        
        {/* Heading: text-slate-900 */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Check your Email</h2>
        
        {/* Paragraph: text-slate-600 */}
        <p className="text-slate-600 mb-6">
          We sent a code to <span className="font-semibold text-slate-900">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="OTP Code"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          
          {/* Error: Red background box for visibility */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <Button type="submit" isLoading={loading} className="w-full">
            Verify & Enter Chat
          </Button>
        </form>
      </div>
    </div>
  );
}
