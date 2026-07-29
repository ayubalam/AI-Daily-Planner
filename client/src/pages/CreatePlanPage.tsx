import React, { useState, useEffect, type SyntheticEvent } from 'react';
import axios from 'axios';
import { Sparkles, Mic, MicOff, Clock, CheckCircle2, AlertCircle, Plus, Circle, Trash2 } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface Props {
  userId: string;
}

interface ScheduleItem {
  id: string;
  timeSlot: string;
  title: string;
  priority: string;
}

interface TaskItem {
  _id: string;
  title: string;
  completed: boolean;
  priority?: string;
}

const API_BASE = 'http://localhost:5000/api';

export const CreatePlanPage: React.FC<Props> = ({ userId }) => {
  const [topPrompt, setTopPrompt] = useState('');
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const { isListening, toggleListening, setText: setVoiceText } = useSpeechRecognition((transcript) => {
    setTopPrompt(transcript);
  });

  const fetchTasks = async (uid: string) => {
    try {
      const res = await axios.get(`${API_BASE}/tasks/${uid}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (userId) {
      axios
        .get(`${API_BASE}/tasks/${userId}`)
        .then((res) => {
          if (isMounted) setTasks(res.data);
        })
        .catch((err) => console.error(err));
    }
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleGeneratePlan = async (e?: SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!topPrompt.trim() || !userId) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/agent/parse`, { prompt: topPrompt, userId });
      if (res.data.scheduleItem) {
        setScheduleItems((prev) => [...prev, res.data.scheduleItem]);
      }
      setTopPrompt('');
      if (setVoiceText) setVoiceText('');
      fetchTasks(userId);
    } catch (err) {
      console.error('Error generating plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !userId) return;
    try {
      await axios.post(`${API_BASE}/tasks`, { title: taskTitle, userId });
      setTaskTitle('');
      fetchTasks(userId);
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleAuraPrompt = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || !userId) return;
    setIsAiLoading(true);
    try {
      await axios.post(`${API_BASE}/agent/parse`, { prompt: aiPrompt, userId });
      setAiPrompt('');
      fetchTasks(userId);
    } catch (err) {
      console.error('Error using Aura prompt:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      await axios.patch(`${API_BASE}/tasks/${id}`);
      fetchTasks(userId);
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/tasks/${id}`);
      fetchTasks(userId);
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
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

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <form onSubmit={handleGeneratePlan} className="space-y-3">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Ask Aura
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex items-center flex-1">
                <input
                  type="text"
                  placeholder="Ask Aura to plan your day or tap the mic..."
                  value={topPrompt}
                  onChange={(e) => setTopPrompt(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-xl pr-10 pl-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  className="absolute right-3 text-slate-400 hover:text-white"
                >
                  {isListening ? <MicOff className="w-4 h-4 text-rose-500" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white font-medium px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'Generating...' : 'Generate Plan'}
              </button>
            </div>
          </form>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col min-h-[400px]">
            <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Generated Schedule
            </h2>

            <div className="flex-1 flex flex-col">
              {scheduleItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-500 border border-dashed border-slate-800/80 rounded-xl">
                  <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">Speak or type a command to generate your schedule.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {scheduleItems.map((item) => (
                    <li key={item.id} className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-3.5 text-sm flex items-center justify-between">
                      <div>
                        <strong className="text-indigo-400 font-medium">{item.timeSlot}</strong> - <span className="text-slate-200">{item.title}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold uppercase ${getPriorityBadge(item.priority)}`}>
                        {item.priority}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Database Tasks
              </h2>
              <span className="text-xs bg-slate-800/80 text-slate-400 px-2.5 py-0.5 rounded-full font-mono">
                {filteredTasks.length} tasks
              </span>
            </div>

            <form onSubmit={handleAuraPrompt} className="flex gap-2 mb-3 bg-[#0d1020] border border-indigo-500/20 p-2.5 rounded-xl">
              <input
                type="text"
                placeholder="Ask Aura (e.g., 'Study Unit 4 notes urgent')"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm focus:outline-none px-2"
              />
              <button
                type="submit"
                disabled={isAiLoading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
              >
                {isAiLoading ? 'Asking...' : 'Ask Aura'}
              </button>
            </form>

            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Add new task manually..."
                className="flex-1 bg-[#0b0f19] border border-slate-800 rounded-xl px-4 py-2 text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>

            <div className="flex bg-[#0b0f19] p-1 rounded-xl mb-4 border border-slate-800/80">
              {(['all', 'pending', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                    filter === status ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {filteredTasks.length > 0 ? (
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[320px] pr-1">
                {filteredTasks.map((task) => (
                  <div key={task._id} className="group flex items-center justify-between bg-[#0b0f19] border border-slate-800/60 rounded-xl p-3 text-sm">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleToggleTask(task._id)} className="text-slate-500 hover:text-emerald-400 cursor-pointer">
                        {task.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5 text-slate-600" />}
                      </button>
                      <p className={`font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {task.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold uppercase ${getPriorityBadge(task.priority)}`}>
                        {task.priority || 'normal'}
                      </span>
                      <button onClick={() => handleDeleteTask(task._id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-500 border border-dashed border-slate-800/80 rounded-xl">
                <p className="text-sm">No tasks in database.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};