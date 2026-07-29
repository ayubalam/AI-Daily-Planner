import React from 'react';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';

interface Props {
  userId: string;
}

export const DashboardPage: React.FC<Props> = ({ userId }) => {
  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h1 className="text-xl font-bold">Productivity Dashboard</h1>
          <span className="text-xs text-slate-400">User ID: <span className="text-emerald-400 font-mono">{userId}</span></span>
        </div>

        {/* Real-Time Productivity Analytics Component */}
        <AnalyticsDashboard userId={userId} />

        {/* Side-by-Side Timeline / Task List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">📅 Today's Scheduled Timeline</h2>
            {/* Insert Schedule Timeline component here */}
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">✅ Task List</h2>
            {/* Insert Task List component here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;