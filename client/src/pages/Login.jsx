import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MessageSquare, ArrowRight } from "lucide-react";
import Button from "../components/authUI/Button";
import Input from "../components/authUI/Input";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validate()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      setGeneralError(err.response?.data?.detail || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-slate-50 relative overflow-hidden items-center justify-center border-r border-slate-200">
        <div className="absolute inset-0 bg-indigo-50/50" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/50 rounded-full blur-3xl" />

        <div className="relative z-10 p-12 max-w-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/30">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Research faster with AI.
          </h1>
          <p className="text-xl text-slate-600">
            Unlock the power of your PDF documents with our intelligent research
            assistant.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white/5">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-slate-500">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <Input
              label="Email"
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
              error={errors.password}
            />

            {generalError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
                {generalError}
              </div>
            )}

            <Button
              type="submit"
              isLoading={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Sign in <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="text-center text-slate-500 text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
