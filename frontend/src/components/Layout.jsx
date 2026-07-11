import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import ProjectModal from './ProjectModal.jsx';
import api from '../services/api.js';

/**
 * Layout wraps all authenticated routes and provides Navbar, Sidebar,
 * and CRUD modal dialog integrations for Project management.
 */
export default function Layout() {
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState(null);

  const navigate = useNavigate();
  const { id: activeProjectId } = useParams();
  const location = useLocation();

  const isDashboardActive = location.pathname === '/';

  // Fetch all projects for the user
  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle Project Selection from sidebar
  const handleSelectProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  // Handle Dashboard navigation
  const handleSelectDashboard = () => {
    navigate('/');
  };

  // Open Project Modal (null for create, project object for edit)
  const handleOpenProjectModal = (project = null) => {
    setSelectedProjectForEdit(project);
    setIsProjectModalOpen(true);
  };

  // Close Project Modal
  const handleCloseProjectModal = () => {
    setSelectedProjectForEdit(null);
    setIsProjectModalOpen(false);
  };

  // Handle Submit for Create / Edit Project
  const handleProjectSubmit = async (data) => {
    if (selectedProjectForEdit) {
      // Edit mode
      await api.put(`/projects/${selectedProjectForEdit.id}`, data);
    } else {
      // Create mode
      const response = await api.post('/projects', data);
      // Auto-navigate to the newly created project
      navigate(`/project/${response.data.data.id}`);
    }
    fetchProjects();
  };

  // Handle Delete Project
  const handleDeleteProject = async (projectId) => {
    try {
      await api.delete(`/projects/${projectId}`);
      fetchProjects();
      // If we are currently viewing the deleted project, redirect to dashboard
      if (activeProjectId === String(projectId)) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar panel */}
        {projectsLoading ? (
          <aside className="w-64 border-r border-slate-800 bg-slate-900/20 flex flex-col h-[calc(100vh-4rem)] items-center justify-center">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </aside>
        ) : (
          <Sidebar
            projects={projects}
            activeProjectId={activeProjectId ? parseInt(activeProjectId, 10) : null}
            onSelectProject={handleSelectProject}
            onSelectDashboard={handleSelectDashboard}
            isDashboardActive={isDashboardActive}
            onOpenProjectModal={handleOpenProjectModal}
            onDeleteProject={handleDeleteProject}
          />
        )}

        {/* Content Outlet frame */}
        <main className="flex-1 overflow-hidden relative">
          <Outlet context={{ projects, fetchProjects }} />
        </main>
      </div>

      {/* Project Modal dialog */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={handleCloseProjectModal}
        onSubmit={handleProjectSubmit}
        project={selectedProjectForEdit}
      />
    </div>
  );
}
