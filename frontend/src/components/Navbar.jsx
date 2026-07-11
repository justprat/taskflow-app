import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { LogOut, CheckSquare, User as UserIcon } from 'lucide-react';

/**
 * Navbar renders the application header with user details and logout action.
 */
export default function Navbar() {
  const { user, logout } = useAuth();

  // Extract initials for the profile avatar placeholder
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6">
      {/* Brand logo & header */}
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20">
          <CheckSquare className="w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          TaskFlow
        </span>
      </div>

      {/* User settings & actions */}
      {user && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-slate-800/40 border border-slate-700/50 rounded-full py-1.5 pl-2 pr-4">
            {/* User Profile Avatar with Initials */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-inner">
              {getInitials(user.name)}
            </div>
            
            <div className="text-left hidden sm:block">
              <p className="text-xs text-slate-400 leading-tight">Signed in as</p>
              <p className="text-sm font-semibold text-slate-200 leading-tight">{user.name}</p>
            </div>
          </div>

          {/* Logout Action Button */}
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-slate-400 hover:text-rose-400 bg-slate-800/20 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900/30 px-3.5 py-2 rounded-lg transition-all text-sm font-medium"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
