import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface AnalyticsData {
  totalTasks: number;
  completedCount: number;
  pendingCount: number;
  completionRate: number;
  totalFocusMinutes: number;
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
}

interface Props {
  userId: string;
}

export const AnalyticsDashboard: React.FC<Props> = ({ userId }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`/api/agent/analytics?userId=${userId}`);
        setData(response.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchAnalytics();
  }, [userId]);

  if (loading) {
    return <div className="p-6 text-slate-400">Loading productivity stats...</div>;
  }

  if (!data) return null;

  const focusHours = (data.totalFocusMinutes / 60).toFixed(1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white my-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span>📊</span> Productivity Analytics
      </h2>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* Completion Rate */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <p className="text-sm text-slate-400">Completion Rate</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1">
            {data.completionRate}%
          </p>
          <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${data.completionRate}%` }}
            />
          </div>
        </div>

        {/* Focus Hours */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <p className="text-sm text-slate-400">Total Focus Time</p>
          <p className="text-3xl font-extrabold text-blue-400 mt-1">
            {focusHours} <span className="text-sm font-normal text-slate-400">hrs</span>
          </p>
          <p className="text-xs text-slate-400 mt-3">
            {data.totalFocusMinutes} minutes completed
          </p>
        </div>

        {/* Tasks Overview */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <p className="text-sm text-slate-400">Tasks Completed</p>
          <p className="text-3xl font-extrabold text-purple-400 mt-1">
            {data.completedCount} <span className="text-sm font-normal text-slate-400">/ {data.totalTasks}</span>
          </p>
          <p className="text-xs text-slate-400 mt-3">
            {data.pendingCount} tasks remaining
          </p>
        </div>

      </div>

      {/* Priority Breakdown Bar */}
      <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Workload Priority Breakdown</h3>
        <div className="flex gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            High: {data.priorityBreakdown.high}
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Medium: {data.priorityBreakdown.medium}
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Low: {data.priorityBreakdown.low}
          </span>
        </div>
      </div>
    </div>
  );
};