import React, { useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import ProjectDetails from './ProjectDetails.jsx';
import TaskModal from '../components/TaskModal.jsx';
import api from '../services/api.js';

/**
 * ProjectDetailsPage binds route params and coordinates Task CRUD operations.
 */
export default function ProjectDetailsPage() {
  const { id } = useParams();
  const projectId = parseInt(id, 10);
  
  // Grab projects and layout refresh actions from parent context
  const { projects } = useOutletContext();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  
  // Increment trigger to signal ProjectDetails child to refresh its tasks list
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Open task modal (null for create, task object for edit)
  const handleOpenTaskModal = (task = null) => {
    setSelectedTaskForEdit(task);
    setIsTaskModalOpen(true);
  };

  // Close task modal
  const handleCloseTaskModal = () => {
    setSelectedTaskForEdit(null);
    setIsTaskModalOpen(false);
  };

  // Submit create or edit task request
  const handleTaskSubmit = async (taskData) => {
    if (selectedTaskForEdit) {
      // Edit task
      await api.put(`/tasks/${selectedTaskForEdit.id}`, {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate
      });
    } else {
      // Create task
      await api.post('/tasks', {
        ...taskData,
        projectId
      });
    }
    // Increment key to trigger child list reload
    setRefreshTrigger(prev => prev + 1);
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  // Toggle checkbox status between TODO and DONE
  const handleToggleTaskStatus = async (task) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  return (
    <div className="h-full">
      <ProjectDetails
        key={projectId} // Reset only when project selection changes
        projectId={projectId}
        projects={projects}
        refreshTrigger={refreshTrigger} // Pass as normal prop to trigger seamless background re-fetch
        onOpenTaskModal={handleOpenTaskModal}
        onDeleteTask={handleDeleteTask}
        onToggleTaskStatus={handleToggleTaskStatus}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onSubmit={handleTaskSubmit}
        task={selectedTaskForEdit}
      />
    </div>
  );
}
