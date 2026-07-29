import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Calendar } from 'lucide-react';

interface NavbarProps {
  user: unknown;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <Calendar className="w-6 h-6 text-indigo-400" />
        <span className="font-bold text-lg text-white">AI Daily Planner</span>
      </div>

      <div className="flex items-center gap-6">
        <Link
          to="/"
          className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
        >
          Home
        </Link>
        <Link
          to="/dashboard"
          className={`text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
        >
          Dashboard
        </Link>
        <Link
          to="/create-plan"
          className={`text-sm font-medium transition-colors ${isActive('/create-plan') ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
        >
          Create Plan
        </Link>

        <button
          onClick={onLogout}
          className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-rose-400 transition-colors ml-4 border-l border-slate-800 pl-4 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </nav>
  );
};