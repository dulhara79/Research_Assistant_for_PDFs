import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

// Protected Route Component
const PrivateRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-indigo-500">
      <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  );
  
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default function Dashboard() {
const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <nav className="flex justify-between items-center mb-12">
        <h1 className="text-2xl font-bold text-white">Research Assistant</h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">Hello, {user?.name}</span>
          <button onClick={logout} className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700">Logout</button>
        </div>
      </nav>
      <div className="border border-dashed border-slate-800 rounded-xl h-96 flex items-center justify-center text-slate-500">
        PDF Upload & Chat Interface goes here
      </div>
    </div>
  );
}