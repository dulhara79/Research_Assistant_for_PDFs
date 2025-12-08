import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from 'lucide-react';
import Button from '../components/authUI/Button';
import Input from '../components/authUI/Input';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden p-4">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Input label="Name" placeholder="John Doe" 
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <Input label="Username" placeholder="johnd" 
                    value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
            </div>
            <Input label="Email" type="email" placeholder="john@example.com" 
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <Input label="Password" type="password" placeholder="••••••••" 
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <Button type="submit" isLoading={loading} className="w-full mt-4">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center border-t border-slate-800 pt-6">
            <p className="text-slate-500 text-sm">
              Already have an account? {' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}