import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { Calendar, CheckCircle2, Circle, Clock, Trash2, Sparkles, Plus, AlertCircle, Mic, MicOff, Volume2, VolumeX, LogOut, User as UserIcon, Lock, Mail } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

interface TaskItem {
  _id: string;
  title: string;
  duration?: number;
  priority?: string;
  completed?: boolean;
}

interface ScheduleItem {
  time: string;
  task: string;
  priority?: string;
}

interface PlanData {
  summary: string;
  schedule: ScheduleItem[];
}

interface UserSession {
  id: string;
  username: string;
  email: string;
  token: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function App() {
  const [user, setUser] = useState<UserSession | null>(() => {
    const stored = localStorage.getItem('aura_user');
    if (stored) {
      try {
        return JSON.parse(stored) as UserSession;
      } catch {
        localStorage.removeItem('aura_user');
      }
    }
    return null;
  });

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authError, setAuthError] = useState('');

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const fetchTasks = async (userId: string) => {
    try {
      const res = await axios.get(`${API_BASE}/tasks/${userId}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !user) return;
    try {
      await axios.post(`${API_BASE}/tasks`, { title: taskTitle, userId: user.id });
      setTaskTitle('');
      fetchTasks(user.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (id: string) => {
    if (!user) return;
    try {
      await axios.patch(`${API_BASE}/tasks/${id}`);
      fetchTasks(user.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!user) return;
    try {
      await axios.delete(`${API_BASE}/tasks/${id}`);
      fetchTasks(user.id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      axios.get(`${API_BASE}/tasks/${user.id}`)
        .then((res) => {
          if (isMounted) setTasks(res.data);
        })
        .catch((err) => console.error(err));
    }
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const speakAura = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;

    const voices = window.speechSynthesis.getVoices();
    const auraVoice = voices.find((v) => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Zira'));
    if (auraVoice) utterance.voice = auraVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

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
      setAuthPassword('');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setAuthError(err.response?.data?.message || 'Authentication failed');
      } else {
        setAuthError('An unexpected error occurred');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aura_user');
    setUser(null);
    setTasks([]);
    setPlan(null);
  };

  const handleGeneratePlan = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt || !user) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/agent/plan`, {
        userId: user.id,
        prompt,
      });

      let parsed = res.data.plan;
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          parsed = { summary: parsed, schedule: [] };
        }
      }
      setPlan(parsed);
      fetchTasks(user.id);

      if (parsed?.summary) {
        speakAura(`Here is your plan: ${parsed.summary}`);
      } else {
        speakAura("I've updated your schedule and task list.");
      }
    } catch (err) {
      console.error(err);
      speakAura("Sorry, I encountered an issue while planning your day.");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Calendar className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              AI Daily Planner
            </h1>
            <p className="text-xs text-slate-400">Sign in to sync tasks with voice assistant Aura</p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                authMode === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                authMode === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Username</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder="john_doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20 mt-2"
            >
              {authMode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                AI Daily Planner
              </h1>
              <p className="text-sm text-slate-400">Powered by Voice Assistant <span className="text-indigo-400 font-semibold">Aura</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isSpeaking) window.speechSynthesis.cancel();
                setVoiceEnabled(!voiceEnabled);
              }}
              className={`p-2 rounded-xl border transition-all ${
                voiceEnabled
                  ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title={voiceEnabled ? "Mute Aura's Voice" : "Enable Aura's Voice"}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <span className="text-xs font-medium px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-300">
                @{user.username}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl border border-transparent hover:border-slate-800 transition-all"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {(isListening || isSpeaking) && (
          <div className="flex items-center justify-between p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
              <span className="text-sm font-medium text-indigo-300">
                {isListening ? 'Aura is listening...' : 'Aura is speaking...'}
              </span>
            </div>
          </div>
        )}

        <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
          <form onSubmit={handleGeneratePlan} className="space-y-4">
            <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Ask Aura
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask Aura to plan your day or tap the mic..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pr-12 pl-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                    isListening
                      ? 'bg-rose-600 text-white animate-bounce'
                      : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'
                  }`}
                  title="Voice Command"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white font-medium px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/20 cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Aura is Planning...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Plan
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Generated Schedule
            </h2>

            {plan ? (
              <div className="space-y-6 flex-1">
                <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-sm text-slate-300">
                  <span className="font-semibold text-indigo-300">Summary: </span>
                  {plan.summary}
                </div>

                {plan.schedule && plan.schedule.length > 0 ? (
                  <div className="space-y-3">
                    {plan.schedule.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-slate-950/50 border border-slate-800/60 rounded-xl p-3.5 text-sm hover:border-slate-700 transition-all"
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-slate-200">{item.task}</p>
                          <p className="text-xs text-slate-500">{item.time}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-md border font-medium uppercase tracking-wider ${getPriorityBadge(item.priority)}`}>
                          {item.priority || 'normal'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No scheduled time blocks returned.</p>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">Speak or type a command for Aura to generate your schedule.</p>
              </div>
            )}
          </section>

          <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Database Tasks
              </h2>
              <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-mono">
                {filteredTasks.length} tasks
              </span>
            </div>

            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Add new task manually..."
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1 text-sm font-medium shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </form>

            <div className="flex bg-slate-950 p-1 rounded-xl mb-4 border border-slate-800">
              {(['all', 'pending', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                    filter === status ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {filteredTasks.length > 0 ? (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px] pr-1">
                {filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    className="group flex items-center justify-between bg-slate-950/50 border border-slate-800/60 rounded-xl p-3.5 text-sm hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3 space-y-1">
                      <button
                        onClick={() => handleToggleTask(task._id)}
                        className="text-slate-500 hover:text-emerald-400 transition-colors"
                        title={task.completed ? "Mark incomplete" : "Mark completed"}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600 hover:text-emerald-400" />
                        )}
                      </button>
                      <div>
                        <p className={`font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                          <span>{task.duration ? `${task.duration} mins` : 'No duration'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-md border font-medium uppercase tracking-wider ${getPriorityBadge(task.priority)}`}>
                        {task.priority || 'normal'}
                      </span>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                <Plus className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No tasks in database.</p>
              </div>
            )}
          </section>

        </div>

      </div>
    </div>
  );
}