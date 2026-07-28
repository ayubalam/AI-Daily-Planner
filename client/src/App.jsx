import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const USER_ID = 'user123';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tasks/${USER_ID}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGeneratePlan = async (e) => {
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

  const handleDeleteTask = async (id) => {
    await axios.delete(`${API_BASE}/tasks/${id}`);
    fetchTasks();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>AI Daily Planner</h1>

      <form onSubmit={handleGeneratePlan} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI to plan your day or create tasks..."
          style={{ flex: 1, padding: '10px', fontSize: '16px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          {loading ? 'Planning...' : 'Generate Plan'}
        </button>
      </form>

      {plan && (
        <div style={{ background: '#f4f4f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h2>Generated Plan</h2>
          <p><strong>Summary:</strong> {plan.summary}</p>
          {plan.schedule && plan.schedule.length > 0 && (
            <ul>
              {plan.schedule.map((item, idx) => (
                <li key={idx}>
                  <strong>{item.time}:</strong> {item.task} ({item.priority || 'normal'})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <h2>Stored Database Tasks</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task._id} style={{ marginBottom: '8px' }}>
            <strong>{task.title}</strong> - {task.duration ? `${task.duration} mins` : 'No duration'} [{task.priority}]
            <button onClick={() => handleDeleteTask(task._id)} style={{ marginLeft: '10px', color: 'red' }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}