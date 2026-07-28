import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { Calendar, CheckCircle2, Clock, Trash2, Sparkles, Plus, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';
const USER_ID = 'user123';

interface TaskItem {
  _id: string;
  title: string;
  duration?: number;
  priority?: string;
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

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tasks/${USER_ID}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    axios.get(`${API_BASE}/tasks/${USER_ID}`)
      .then((res) => {
        if (isMounted) setTasks(res.data);
      })
      .catch((err) => console.error(err));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleGeneratePlan = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/agent/plan`, {
        userId: USER_ID,
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
      fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    await axios.delete(`${API_BASE}/tasks/${id}`);
    fetchTasks();
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                AI Daily Planner
              </h1>
              <p className="text-sm text-slate-400">Smart agent-assisted daily scheduling</p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-400">
            User: {USER_ID}
          </span>
        </header>

        {/* AI Prompt Input */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
          <form onSubmit={handleGeneratePlan} className="space-y-4">
            <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Ask AI Planner
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Add task 'Review PRs' for 30m with high priority and plan my day..."
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white font-medium px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/20 cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
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

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* AI Plan Output */}
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
                <p className="text-sm">Enter a prompt above to generate your schedule.</p>
              </div>
            )}
          </section>

          {/* Database Tasks */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Database Tasks
              </h2>
              <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-mono">
                {tasks.length} tasks
              </span>
            </div>

            {tasks.length > 0 ? (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px] pr-1">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="group flex items-center justify-between bg-slate-950/50 border border-slate-800/60 rounded-xl p-3.5 text-sm hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-slate-200">{task.title}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{task.duration ? `${task.duration} mins` : 'No duration'}</span>
                      </p>
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