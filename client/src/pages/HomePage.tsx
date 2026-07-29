import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
      {/* Navigation Header */}
      <header className="max-w-6xl w-full mx-auto flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            A
          </div>
          <span className="text-xl font-bold tracking-tight">Aura AI</span>
        </div>
        <Link 
          to="/dashboard" 
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg border border-slate-700 transition"
        >
          Open Dashboard
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto text-center space-y-8 my-auto py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          ⚡ Voice-Powered AI Scheduling Engine
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Speak your plan. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
            Aura handles the schedule.
          </span>
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Convert quick voice commands or text prompts into structured, prioritized daily tasks with automated duration detection and sequential timeline blocking.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
          >
            Go to Dashboard ➔
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <div className="text-2xl mb-2">🎙️</div>
            <h3 className="font-semibold text-slate-200">Voice Recognition</h3>
            <p className="text-xs text-slate-400 mt-1">Speak directly into the app to log tasks effortlessly.</p>
          </div>
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <div className="text-2xl mb-2">⏱️</div>
            <h3 className="font-semibold text-slate-200">Dynamic Blocking</h3>
            <p className="text-xs text-slate-400 mt-1">Automatically assigns durations and stacks schedule time slots sequentially.</p>
          </div>
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-slate-200">Productivity Analytics</h3>
            <p className="text-xs text-slate-400 mt-1">Track focus hours, completion rates, and workload breakdown in real-time.</p>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-500 py-4">
        © 2026 Aura AI Planner. All rights reserved.
      </footer>
    </div>
  );
};