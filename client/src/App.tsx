import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, CheckCircle2, Circle, Clock, Trash2, Sparkles, 
  Plus, AlertCircle, Mic, MicOff, Volume2, VolumeX, 
  LogOut, User as UserIcon, Lock, Mail, LayoutDashboard, ListTodo, TrendingUp
} from 'lucide-react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';

const API_BASE = 'http://localhost:5000/api';

interface TaskItem {
  _id: string;
  title: string;
  duration?: number;
  priority?: string;
  completed?: boolean;
}

interface ScheduleItem {
  id: string;
  timeSlot: string;
  title: string;
  priority: string;
}

interface UserSession {
  id: string;
  username: string;
  email: string;
  token: string;
}

// Background glowing light mesh illusion wrapper
const IllusionBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 text-slate-800 font-sans overflow-hidden">
    {/* Floating Animated Illusion Orbs */}
    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-400/40 rounded-full blur-[120px] pointer-events-none animate-pulse" />
    <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-purple-400/40 rounded-full blur-[140px] pointer-events-none animate-pulse" />
    <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-400/40 rounded-full blur-[120px] pointer-events-none animate-pulse" />
    
    <div className="relative z-10">{children}</div>
  </div>
);

export const Navbar: React.FC<{ user: UserSession | null; onLogout: () => void }> = ({ user, onLogout }) => {
  const location = useLocation();
  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/60 backdrop-blur-md border-b border-purple-200/50 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-tr from-pink-500 to-indigo-600 text-white rounded-xl shadow-md">
          <Calendar className="w-5 h-5" />
        </div>
        <span className="font-extrabold text-lg bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          AI Daily Planner
        </span>
      </div>

      <div className="flex items-center gap-6">
        <Link 
          to="/" 
          className={`text-sm font-semibold transition-all ${isActive('/') ? 'text-pink-600 underline underline-offset-4' : 'text-slate-600 hover:text-purple-700'}`}
        >
          Home
        </Link>
        <Link 
          to="/dashboard" 
          className={`text-sm font-semibold transition-all ${isActive('/dashboard') ? 'text-purple-600 underline underline-offset-4' : 'text-slate-600 hover:text-purple-700'}`}
        >
          Dashboard
        </Link>
        <Link 
          to="/create-plan" 
          className={`text-sm font-semibold transition-all ${isActive('/create-plan') ? 'text-indigo-600 underline underline-offset-4' : 'text-slate-600 hover:text-purple-700'}`}
        >
          Create Plan
        </Link>

        <button 
          onClick={onLogout}
          className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors ml-4 border-l border-slate-300 pl-4 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export function LoginPage({ setUser }: { setUser: (u: UserSession) => void }) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authError, setAuthError] = useState('');

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const payload = authMode === 'login' 
        ? { email: authEmail, password: authPassword }
        : { username: authUsername, email: authEmail, password: authPassword };

      const res = await axios.post(`${API_BASE}${endpoint}`, payload);
      const sessionData: UserSession = {
        id: res.data.user.id,
        username: res.data.user.username,
        email: res.data.user.email,
        token: res.data.token,
      };

      localStorage.setItem('aura_user', JSON.stringify(sessionData));
      setUser(sessionData);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setAuthError(err.response?.data?.message || 'Authentication failed');
      } else {
        setAuthError('An unexpected error occurred');
      }
    }
  };

  return (
    <IllusionBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/70 border border-white/80 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl shadow-purple-900/10 transition-all hover:-translate-y-1">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-purple-500/30">
              <Calendar className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              AI Daily Planner
            </h1>
            <p className="text-xs text-slate-500">Sign in to sync tasks with voice assistant Aura</p>
          </div>

          <div className="flex bg-slate-200/60 p-1.5 rounded-2xl mb-6 border border-slate-300/40">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'login' ? 'bg-white text-purple-700 shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'register' ? 'bg-white text-purple-700 shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign Up
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Username</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder="john_doe"
                    className="w-full bg-white/80 border border-purple-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/80 border border-purple-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/80 border border-purple-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-purple-500/25 mt-2 cursor-pointer"
            >
              {authMode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </IllusionBackground>
  );
}

// ==================== DASHBOARD PAGE ====================
export function DashboardPage({ user }: { user: UserSession }) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      axios
        .get(`${API_BASE}/tasks/${user.id}`)
        .then((res) => {
          if (isMounted) setTasks(res.data);
        })
        .catch((err) => console.error(err));
    }
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const urgentCount = tasks.filter((t) => t.priority?.toLowerCase() === 'urgent' || t.priority?.toLowerCase() === 'high').length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <IllusionBackground>
      <div className="p-4 sm:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="flex items-center justify-between border-b border-purple-200/60 pb-6">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-sm text-slate-600">Welcome back, <span className="text-purple-700 font-bold">@{user.username}</span></p>
            </div>

            <button
              onClick={() => navigate('/create-plan')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white font-bold px-5 py-2.5 rounded-2xl transition-all flex items-center gap-2 text-sm cursor-pointer shadow-lg shadow-pink-500/20"
            >
              <Sparkles className="w-4 h-4" />
              Create New Plan
            </button>
          </header>

          {/* Analytics Cards with Glassmorphism Depth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/60 border border-white/80 rounded-2xl p-5 flex items-center justify-between backdrop-blur-xl shadow-xl shadow-indigo-900/5 transition-all hover:-translate-y-1">
              <div>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Total Tasks</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1">{tasks.length}</h3>
              </div>
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                <ListTodo className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white/60 border border-white/80 rounded-2xl p-5 flex items-center justify-between backdrop-blur-xl shadow-xl shadow-purple-900/5 transition-all hover:-translate-y-1">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Pending Tasks</p>
                <h3 className="text-3xl font-black text-amber-600 mt-1">{pendingCount}</h3>
              </div>
              <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white/60 border border-white/80 rounded-2xl p-5 flex items-center justify-between backdrop-blur-xl shadow-xl shadow-emerald-900/5 transition-all hover:-translate-y-1">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Completed</p>
                <h3 className="text-3xl font-black text-emerald-600 mt-1">{completedCount}</h3>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white/60 border border-white/80 rounded-2xl p-5 flex items-center justify-between backdrop-blur-xl shadow-xl shadow-pink-900/5 transition-all hover:-translate-y-1">
              <div>
                <p className="text-xs font-bold text-pink-600 uppercase tracking-wide">Completion Rate</p>
                <h3 className="text-3xl font-black text-pink-600 mt-1">{completionRate}%</h3>
              </div>
              <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Dashboard Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white/60 border border-white/80 rounded-3xl p-6 flex flex-col backdrop-blur-2xl shadow-xl shadow-purple-900/5">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                High Priority & Urgent Tasks ({urgentCount})
              </h2>
              <div className="space-y-3 flex-1">
                {tasks.filter((t) => t.priority?.toLowerCase() === 'urgent' || t.priority?.toLowerCase() === 'high').length > 0 ? (
                  tasks
                    .filter((t) => t.priority?.toLowerCase() === 'urgent' || t.priority?.toLowerCase() === 'high')
                    .map((task) => (
                      <div key={task._id} className="bg-white/80 border border-purple-100 rounded-2xl p-3.5 text-sm flex items-center justify-between shadow-sm">
                        <span className={task.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                          {task.title}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-lg border font-bold uppercase bg-rose-100 text-rose-600 border-rose-200">
                          {task.priority}
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-slate-500 py-8 text-center border border-dashed border-purple-200 rounded-2xl">
                    No high priority tasks right now.
                  </p>
                )}
              </div>
            </section>

            <section className="bg-white/60 border border-white/80 rounded-3xl p-6 flex flex-col backdrop-blur-2xl shadow-xl shadow-purple-900/5">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-purple-600" />
                Quick Actions
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Need to add new tasks or use Aura voice AI to generate today's schedule?
                </p>
                <button
                  onClick={() => navigate('/create-plan')}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold py-3.5 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  Go to Interactive Planner (Create Plan)
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </IllusionBackground>
  );
}

// ==================== CREATE PLAN PAGE ====================
export function CreatePlanPage({ user }: { user: UserSession }) {
  const [topPrompt, setTopPrompt] = useState('');
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const { isListening, toggleListening, setText: setVoiceText } = useSpeechRecognition((transcript) => {
    setTopPrompt(transcript);
  });

  const fetchTasks = async (userId: string) => {
    try {
      const res = await axios.get(`${API_BASE}/tasks/${userId}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      axios
        .get(`${API_BASE}/tasks/${user.id}`)
        .then((res) => {
          if (isMounted) setTasks(res.data);
        })
        .catch((err) => console.error(err));
    }
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const speakAura = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleGeneratePlan = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!topPrompt.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/agent/parse`, { prompt: topPrompt, userId: user.id });
      if (res.data.scheduleItem) {
        setScheduleItems((prev) => [...prev, res.data.scheduleItem]);
      }
      setTopPrompt('');
      setVoiceText('');
      fetchTasks(user.id);
      speakAura("I've updated your schedule and task list.");
    } catch (err) {
      console.error('Error generating plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    try {
      await axios.post(`${API_BASE}/tasks`, { title: taskTitle, userId: user.id });
      setTaskTitle('');
      fetchTasks(user.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuraPrompt = async (e: FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      await axios.post(`${API_BASE}/agent/parse`, { prompt: aiPrompt, userId: user.id });
      setAiPrompt('');
      fetchTasks(user.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      await axios.patch(`${API_BASE}/tasks/${id}`);
      fetchTasks(user.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/tasks/${id}`);
      fetchTasks(user.id);
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <IllusionBackground>
      <div className="p-4 sm:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="flex items-center justify-between border-b border-purple-200/60 pb-6">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Create Plan
              </h1>
              <p className="text-sm text-slate-600">Generate schedules and manage tasks with Aura</p>
            </div>

            <button
              onClick={() => {
                if (isSpeaking) window.speechSynthesis.cancel();
                setVoiceEnabled(!voiceEnabled);
              }}
              className={`p-2.5 rounded-2xl border transition-all ${
                voiceEnabled ? 'bg-white text-purple-700 border-purple-200 shadow-md' : 'bg-slate-200 text-slate-400 border-slate-300'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </header>

          {(isListening || isSpeaking) && (
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl animate-pulse shadow-lg">
              <span className="text-sm font-bold">
                {isListening ? 'Aura is listening...' : 'Aura is speaking...'}
              </span>
            </div>
          )}

          <section className="bg-white/60 border border-white/80 rounded-3xl p-6 backdrop-blur-2xl shadow-xl shadow-purple-900/5">
            <form onSubmit={handleGeneratePlan} className="space-y-4">
              <label className="block text-sm font-bold text-purple-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                Ask Aura
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex items-center flex-1">
                  <input
                    type="text"
                    placeholder="Ask Aura to plan your day or tap the mic..."
                    value={topPrompt}
                    onChange={(e) => setTopPrompt(e.target.value)}
                    className="w-full bg-white/80 border border-purple-200 rounded-2xl pr-28 pl-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm"
                  />
                  <button
                    type="button"
                    onClick={toggleListening}
                    className="absolute right-2.5 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold border border-purple-200"
                  >
                    {isListening ? <MicOff className="w-4 h-4 text-rose-600" /> : <Mic className="w-4 h-4 text-purple-700" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple-500/25 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Plan
                </button>
              </div>
            </form>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white/60 border border-white/80 rounded-3xl p-6 flex flex-col backdrop-blur-2xl shadow-xl shadow-purple-900/5">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Generated Schedule
              </h2>

              <div className="flex-1">
                {scheduleItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-400 border border-dashed border-purple-200 rounded-2xl">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50 text-purple-400" />
                    <p className="text-sm">Speak or type a command to generate your schedule.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {scheduleItems.map((item) => (
                      <li key={item.id} className="bg-white/80 border border-purple-100 rounded-2xl p-4 text-sm flex items-center justify-between shadow-sm">
                        <div>
                          <strong className="text-purple-700 font-bold">{item.timeSlot}</strong> - <span className="text-slate-800 font-medium">{item.title}</span>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold uppercase ${getPriorityBadge(item.priority)}`}>
                          {item.priority}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="bg-white/60 border border-white/80 rounded-3xl p-6 flex flex-col backdrop-blur-2xl shadow-xl shadow-purple-900/5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Database Tasks
                </h2>
                <span className="text-xs bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-full font-mono font-bold">
                  {filteredTasks.length} tasks
                </span>
              </div>

              <form onSubmit={handleAuraPrompt} className="flex gap-2 mb-3 bg-purple-50/80 border border-purple-200 p-3 rounded-2xl">
                <input
                  type="text"
                  placeholder="Ask Aura (e.g., 'Study Unit 4 notes urgent')"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 bg-white border border-purple-200 rounded-xl px-4 py-2 text-slate-800 placeholder-slate-400 text-sm focus:outline-none"
                />
                <button type="submit" disabled={isAiLoading} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer shrink-0 shadow-md">
                  Ask Aura
                </button>
              </form>

              <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Add new task manually..."
                  className="flex-1 bg-white/80 border border-purple-200 rounded-xl px-4 py-2 text-slate-800 placeholder-slate-400 text-sm focus:outline-none"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 cursor-pointer shrink-0 shadow-md">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>

              <div className="flex bg-slate-200/60 p-1.5 rounded-2xl mb-4 border border-slate-300/40">
                {(['all', 'pending', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl capitalize transition-all ${
                      filter === status ? 'bg-white text-purple-700 shadow-md' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {filteredTasks.length > 0 ? (
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px] pr-1">
                  {filteredTasks.map((task) => (
                    <div key={task._id} className="group flex items-center justify-between bg-white/80 border border-purple-100 rounded-2xl p-3.5 text-sm shadow-sm">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleToggleTask(task._id)} className="text-slate-400 hover:text-emerald-600 cursor-pointer">
                          {task.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-slate-300" />}
                        </button>
                        <div>
                          <p className={`font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold uppercase ${getPriorityBadge(task.priority)}`}>
                          {task.priority || 'normal'}
                        </span>
                        <button onClick={() => handleDeleteTask(task._id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 cursor-pointer transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-400 border border-dashed border-purple-200 rounded-2xl">
                  <p className="text-sm">No tasks in database.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </IllusionBackground>
  );
}

export function HomePage() {
  const navigate = useNavigate();

  return (
    <IllusionBackground>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="p-5 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white rounded-3xl shadow-2xl shadow-purple-500/30 mb-6 transition-all hover:-translate-y-2">
          <Sparkles className="w-12 h-12" />
        </div>
        <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Welcome to Aura Daily Planner
        </h1>
        <p className="max-w-xl text-slate-600 text-base sm:text-lg mb-8 font-medium">
          Organize your schedule effortlessly using artificial intelligence and natural voice interaction.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-purple-500/25 flex items-center gap-2 cursor-pointer"
        >
          Go to Dashboard
          <Sparkles className="w-5 h-5" />
        </button>
      </div>
    </IllusionBackground>
  );
}

export const App: React.FC = () => {
  const [user, setUser] = useState<UserSession | null>(() => {
    const stored = localStorage.getItem('aura_user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('aura_user');
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/login" element={!user ? <LoginPage setUser={setUser} /> : <Navigate to="/dashboard" />} />
          <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={user ? <DashboardPage user={user} /> : <Navigate to="/login" />} />
          <Route path="/create-plan" element={user ? <CreatePlanPage user={user} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;