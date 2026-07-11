import React from 'react';
import { LayoutDashboard, FolderPlus, Folder, MoreVertical, Edit2, Trash2 } from 'lucide-react';

/**
 * Sidebar component lists navigation items and projects.
 * Supports active selections and project modifications.
 */
export default function Sidebar({ 
  projects, 
  activeProjectId, 
  onSelectProject, 
  onSelectDashboard, 
  isDashboardActive,
  onOpenProjectModal,
  onDeleteProject
}) {
  const [dropdownOpen, setDropdownOpen] = React.useState(null);

  const handleToggleDropdown = (e, id) => {
    e.stopPropagation();
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  React.useEffect(() => {
    const closeDropdowns = () => setDropdownOpen(null);
    window.addEventListener('click', closeDropdowns);
    return () => window.removeEventListener('click', closeDropdowns);
  }, []);

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/20 flex flex-col h-[calc(100vh-4rem)]">
      {/* Dashboard navigation button */}
      <div className="p-4">
        <button
          onClick={onSelectDashboard}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
            isDashboardActive
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </div>

      <div className="border-t border-slate-800/80 my-2"></div>

      {/* Projects section */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Projects</span>
          <button
            onClick={() => onOpenProjectModal(null)}
            className="text-slate-400 hover:text-indigo-400 transition-colors p-1"
            title="Create Project"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Project items list */}
        <div className="px-3 space-y-1 flex-1">
          {projects.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <p className="text-xs text-slate-600">No projects yet.</p>
              <button
                onClick={() => onOpenProjectModal(null)}
                className="text-xs text-indigo-400 hover:underline mt-2 font-medium"
              >
                Create one now
              </button>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                  !isDashboardActive && activeProjectId === project.id
                    ? 'bg-slate-800 text-white border-l-2 border-indigo-500 pl-2.5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <Folder className={`w-4 h-4 flex-shrink-0 ${
                    !isDashboardActive && activeProjectId === project.id ? 'text-indigo-400' : 'text-slate-500'
                  }`} />
                  <span className="truncate">{project.name}</span>
                </div>

                {/* Dropdown controls for edit / delete */}
                <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleToggleDropdown(e, project.id)}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {dropdownOpen === project.id && (
                    <div className="absolute right-0 mt-1 w-28 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProjectModal(project);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Rename</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete "${project.name}" and all its tasks?`)) {
                            onDeleteProject(project.id);
                          }
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/20 hover:text-rose-300"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
