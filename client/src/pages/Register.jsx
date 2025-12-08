import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen } from "lucide-react";
import Button from "../components/authUI/Button";
import Input from "../components/authUI/Input";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(formData);
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
      {/* Background Decor (Lighter, softer blobs) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/50 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/50 rounded-full blur-[128px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Card: bg-white, border-slate-200, shadow-xl */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            {/* Title: text-slate-900 */}
            <h1 className="text-2xl font-bold text-slate-900">
              Create Account
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                label="Username"
                placeholder="johnd"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            {/* Error: text-red-600 + background container for better visibility */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" isLoading={loading} className="w-full mt-4">
              Create Account
            </Button>
          </form>

          {/* Footer: border-slate-200 */}
          <div className="mt-6 text-center border-t border-slate-200 pt-6">
            <p className="text-slate-500 text-sm">
              Already have an account? {/* Link: text-indigo-600 */}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
