import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

interface Props {
  onLogin: () => void;
  isAuthenticated: boolean;
}

export const LoginPage: React.FC<Props> = ({ onLogin, isAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
    navigate('/dashboard'); // Auto-redirect after login
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-950 flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-sm text-center mb-6">Log in to manage your AI daily plan</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-lg transition mt-2"
          >
            Login & Open Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};