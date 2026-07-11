import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Edit2, 
  Trash2, 
  Calendar, 
  CheckCircle,
  Circle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';

/**
 * ProjectDetails lists tasks inside a project.
 * Supports searching, status filtering, due date sorting, and pagination.
 */
export default function ProjectDetails({ projectId, projects, onOpenTaskModal, onDeleteTask, onToggleTaskStatus, refreshTrigger }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search, Filter, Sort and Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt' or 'dueDate'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 8; // Items per page

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [prevProjectId, setPrevProjectId] = useState(projectId);

  // Get active project details
  const activeProject = projects.find(p => p.id === projectId);

  // Fetch tasks when filters or projectId changes
  const fetchTasks = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        sortBy,
        sortOrder
      };
      
      const response = await api.get(`/tasks/project/${projectId}`, { params });
      setTasks(response.data.data);
      setTotalPages(response.data.meta.totalPages);
      setTotalCount(response.data.meta.totalCount);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError('Failed to fetch tasks.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    const isProjectChange = projectId !== prevProjectId;
    if (isProjectChange) {
      setPrevProjectId(projectId);
      setPage(1); // Reset page on project change
    }

    if (projectId) {
      const shouldShowLoader = isProjectChange || tasks.length === 0;
      fetchTasks(shouldShowLoader);
    }
  }, [projectId, page, statusFilter, sortBy, sortOrder, refreshTrigger]);

  // Debounced search trigger (can search on button submit or small timeout, here we do search on keypress/submit)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset page to 1
    fetchTasks();
  };

  // Toggle sorting utility between dueDate and createdAt
  const handleSortToggle = () => {
    setPage(1);
    if (sortBy === 'createdAt') {
      setSortBy('dueDate');
      setSortOrder('asc'); // default Ascending for dates
    } else if (sortBy === 'dueDate' && sortOrder === 'asc') {
      setSortOrder('desc'); // Descending dates
    } else {
      setSortBy('createdAt');
      setSortOrder('desc'); // Reset to default
    }
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

  // Format date utility
  const formatDate = (isoString) => {
    if (!isoString) return 'No due date';
    const date = new Date(isoString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const itemDate = new Date(date);
    itemDate.setHours(0, 0, 0, 0);

    const timeDiff = itemDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff === 0) return 'Due Today';
    if (daysDiff === 1) return 'Due Tomorrow';
    if (daysDiff === -1) return 'Overdue Yesterday';
    if (daysDiff < -1) return `Overdue by ${Math.abs(daysDiff)} days`;
    
    return `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col h-[calc(100vh-4rem)] animate-in fade-in duration-300">
      
      {/* Project Header Info */}
      {activeProject && (
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{activeProject.name}</h1>
          {activeProject.description && (
            <p className="text-slate-400 mt-2 text-sm max-w-2xl">{activeProject.description}</p>
          )}
        </div>
      )}

      {/* Toolbar filters and searches */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-slate-900/30 p-4 border border-slate-800/60 rounded-xl">
        
        {/* Search Input bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-16 py-2 bg-slate-950/60 border border-slate-800/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5" />
          <button
            type="submit"
            className="absolute right-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors"
          >
            Find
          </button>
        </form>

        {/* Filter & Sort select group */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          
          {/* Custom Sleek Status Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="flex items-center space-x-2 bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800/80 hover:border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-300 transition-all font-medium"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {statusFilter === 'TODO' ? 'Todo' : 
                 statusFilter === 'IN_PROGRESS' ? 'In Progress' : 
                 statusFilter === 'DONE' ? 'Done' : 'All Statuses'}
              </span>
            </button>

            {isStatusOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsStatusOpen(false)}></div>
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 w-40 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                  {[
                    { label: 'All Statuses', value: '' },
                    { label: 'Todo', value: 'TODO' },
                    { label: 'In Progress', value: 'IN_PROGRESS' },
                    { label: 'Done', value: 'DONE' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setPage(1);
                        setStatusFilter(item.value);
                        setIsStatusOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between ${
                        statusFilter === item.value 
                          ? 'bg-indigo-600/20 text-indigo-400 font-semibold' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span>{item.label}</span>
                      {statusFilter === item.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sort Button Toggle */}
          <button
            onClick={handleSortToggle}
            className="flex items-center space-x-2 bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800/80 hover:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 transition-all"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {sortBy === 'dueDate' 
                ? `Due Date (${sortOrder === 'asc' ? 'Asc' : 'Desc'})` 
                : 'Created Date'}
            </span>
          </button>

          {/* Create Task Button */}
          <button
            onClick={() => onOpenTaskModal(null)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/10 ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task List table/cards container */}
      <div className="flex-1 flex flex-col justify-between">
        
        {/* State rendering */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-xs mt-3 animate-pulse">Retrieving tasks...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl text-rose-300 text-center text-sm py-12">
            {error}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
            <HelpCircle className="w-10 h-10 text-slate-700 mb-2" />
            <p className="text-sm font-semibold text-slate-400">No tasks found</p>
            <p className="text-xs text-slate-600 mt-1">Try resetting your filters or create a new task above.</p>
          </div>
        ) : (
          /* Actual list items */
          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={`glass-card p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700/40 ${
                  task.status === 'DONE' ? 'opacity-65' : ''
                }`}
              >
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  {/* Status Checkbox toggle */}
                  <button
                    onClick={() => onToggleTaskStatus(task)}
                    className={`mt-0.5 p-1 rounded-full hover:bg-slate-800 transition-colors flex-shrink-0 ${
                      task.status === 'DONE' ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-400'
                    }`}
                  >
                    {task.status === 'DONE' ? (
                      <CheckCircle className="w-5 h-5 fill-indigo-500/10" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    {/* Task Title */}
                    <h3 className={`text-sm font-bold text-slate-200 tracking-wide truncate ${
                      task.status === 'DONE' ? 'line-through text-slate-500' : ''
                    }`}>
                      {task.title}
                    </h3>
                    {/* Task Description */}
                    {task.description && (
                      <p className={`text-xs mt-1 leading-snug line-clamp-2 ${
                        task.status === 'DONE' ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        {task.description}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {/* Priority Tag */}
                      <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>

                      {/* Due Date Indicator */}
                      <span className={`text-[10px] flex items-center gap-1.5 ${
                        task.status === 'DONE' 
                          ? 'text-slate-600' 
                          : task.dueDate && new Date(task.dueDate) < new Date() 
                            ? 'text-rose-400 font-semibold' 
                            : 'text-slate-500'
                      }`}>
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{formatDate(task.dueDate)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Action Panel */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => onOpenTaskModal(task)}
                    className="p-2 bg-slate-800/40 hover:bg-indigo-600/10 text-slate-400 hover:text-indigo-400 border border-slate-800 hover:border-indigo-900/30 rounded-lg transition-all"
                    title="Edit Task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
                        onDeleteTask(task.id);
                      }
                    }}
                    className="p-2 bg-slate-800/40 hover:bg-rose-600/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/30 rounded-lg transition-all"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination controls footer */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between border-t border-slate-800/60 pt-4 text-xs text-slate-500">
            <span className="font-medium">
              Showing <span className="text-slate-400">{(page - 1) * limit + 1}</span> to{' '}
              <span className="text-slate-400">{Math.min(page * limit, totalCount)}</span> of{' '}
              <span className="text-slate-400">{totalCount}</span> tasks
            </span>

            <div className="flex items-center space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />
              </button>
              <span className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-semibold">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
