import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { 
  CheckCircle2, 
  CircleDot, 
  ListTodo, 
  TrendingUp, 
  Activity, 
  Clock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

/**
 * Dashboard Page displaying overview statistics and recent activities.
 */
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/tasks/dashboard/stats');
        setStats(response.data.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 mt-4 text-sm font-medium animate-pulse">Loading dashboard statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl text-rose-300 max-w-lg mx-auto text-center">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-rose-900/30 hover:bg-rose-900/50 rounded-lg text-xs font-semibold text-white transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { totalTasks, completedTasks, pendingTasks, recentActivity } = stats;
  
  // Calculate completion percentage safely
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Format date helper
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Get Priority Badge Color Utility
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'LOW': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  // Get Status Badge Color Utility
  const getStatusColor = (status) => {
    switch (status) {
      case 'DONE': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'IN_PROGRESS': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome banner header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Workspace Overview <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Real-time statistics of your active items</p>
        </div>
      </div>

      {/* Grid of Statistical Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Tasks Card */}
        <div className="glass-card p-6 rounded-2xl hover:border-slate-700/60 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400 tracking-wide">Total Tasks</span>
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
              <ListTodo className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline">
            <span className="text-3xl font-extrabold text-white">{totalTasks}</span>
            <span className="text-xs text-slate-500 ml-2">assigned items</span>
          </div>
        </div>

        {/* Completed Tasks Card */}
        <div className="glass-card p-6 rounded-2xl hover:border-slate-700/60 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400 tracking-wide">Completed</span>
            <div className="p-2.5 rounded-xl bg-emerald-950/20 text-emerald-400 border border-emerald-900/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline">
            <span className="text-3xl font-extrabold text-emerald-400">{completedTasks}</span>
            <span className="text-xs text-slate-500 ml-2">done</span>
          </div>
        </div>

        {/* Pending Tasks Card */}
        <div className="glass-card p-6 rounded-2xl hover:border-slate-700/60 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400 tracking-wide">Pending</span>
            <div className="p-2.5 rounded-xl bg-indigo-950/20 text-indigo-400 border border-indigo-900/30">
              <CircleDot className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline">
            <span className="text-3xl font-extrabold text-indigo-400">{pendingTasks}</span>
            <span className="text-xs text-slate-500 ml-2">in queue</span>
          </div>
        </div>

        {/* Completion rate progress card */}
        <div className="glass-card p-6 rounded-2xl hover:border-slate-700/60 hover:-translate-y-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400 tracking-wide">Completion Rate</span>
            <div className="p-2.5 rounded-xl bg-purple-950/20 text-purple-400 border border-purple-900/30">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-white">{completionPercentage}%</span>
              <span className="text-xs text-slate-500 mt-1">overall progress</span>
            </div>
            
            {/* Visual Progress Arc circle overlay */}
            <div className="relative w-14 h-14">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="28" cy="28" r="24"
                  className="stroke-slate-800"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="28" cy="28" r="24"
                  className="stroke-indigo-500 transition-all duration-500"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - completionPercentage / 100)}`}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity section */}
      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mb-6">
          <Activity className="w-4 h-4 text-indigo-400" /> Recent Updates
        </h2>

        {recentActivity.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 font-medium">No recent activity logged yet.</p>
            <p className="text-xs text-slate-600 mt-1">Modify or create tasks in a project to populate this feed.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 space-y-4">
            {recentActivity.map((task) => (
              <div 
                key={task.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 first:pt-0 group hover:bg-slate-800/10 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                onClick={() => navigate(`/project/${task.projectId}`)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-1.5 rounded-lg mt-0.5 ${
                    task.status === 'DONE' ? 'bg-emerald-950/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {task.status === 'DONE' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <CircleDot className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors leading-snug">
                      {task.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">Project:</span>
                      <span className="text-xs font-semibold text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/30">
                        {task.project.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(task.updatedAt)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
