// src/contexts/ProjectContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [supervisorConfirmations, setSupervisorConfirmations] = useState({});
  
  useEffect(() => {
    // Load projects from localStorage on app start
    const storedProjects = localStorage.getItem('projects');
    const storedConfirmations = localStorage.getItem('supervisorConfirmations');
    
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
    
    if (storedConfirmations) {
      setSupervisorConfirmations(JSON.parse(storedConfirmations));
    }
  }, []);

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }, [projects]);

  // Save confirmations to localStorage
  useEffect(() => {
    localStorage.setItem('supervisorConfirmations', JSON.stringify(supervisorConfirmations));
  }, [supervisorConfirmations]);

  const createProject = (projectData) => {
    const newProject = {
      id: 'PROJ-' + Date.now(),
      ...projectData.projectDetails,
      scopeOfWork: projectData.scopeOfWork || [],
      materials: projectData.materialToolList?.materials || [],
      tools: projectData.materialToolList?.tools || [],
      supervisors: projectData.manpower?.supervisors || [],
      employees: projectData.manpower?.employees || [],
      createdAt: new Date().toISOString(),
      status: 'Active',
      createdBy: 'admin' // This should come from auth context
    };

    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (projectId, updates) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    ));
  };

  const addSupervisorToProject = (projectId, supervisor) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const updatedSupervisors = [...(project.supervisors || [])];
        
        // Check if supervisor already exists
        const existingIndex = updatedSupervisors.findIndex(s => s.id === supervisor.id);
        if (existingIndex === -1) {
          updatedSupervisors.push({
            ...supervisor,
            addedAt: new Date().toISOString(),
            needsConfirmation: true
          });
        }
        
        return {
          ...project,
          supervisors: updatedSupervisors,
          updatedAt: new Date().toISOString()
        };
      }
      return project;
    }));
  };

  const getProjectBySupervisor = (supervisorId) => {
    return projects.find(project => 
      project.supervisors?.some(supervisor => 
        supervisor.id === supervisorId || supervisor.employeeId === supervisorId
      )
    );
  };

  const getSupervisorConfirmationStatus = (projectId, supervisorId) => {
    const key = `${projectId}-${supervisorId}`;
    return supervisorConfirmations[key] || null;
  };

  const setSupervisorConfirmation = (projectId, supervisorId, confirmationData) => {
    const key = `${projectId}-${supervisorId}`;
    setSupervisorConfirmations(prev => ({
      ...prev,
      [key]: {
        ...confirmationData,
        confirmedAt: new Date().toISOString(),
        supervisorId,
        projectId
      }
    }));

    // Update supervisor status in project
    updateProject(projectId, {
      supervisors: projects.find(p => p.id === projectId)?.supervisors?.map(sup => 
        (sup.id === supervisorId || sup.employeeId === supervisorId) 
          ? { ...sup, needsConfirmation: false, confirmedAt: new Date().toISOString() }
          : sup
      )
    });
  };

  const needsConfirmation = (projectId, supervisorId) => {
    const project = projects.find(p => p.id === projectId);
    const supervisor = project?.supervisors?.find(s => 
      s.id === supervisorId || s.employeeId === supervisorId
    );
    
    return supervisor?.needsConfirmation || false;
  };

  const updateScopeProgress = (projectId, scopeUpdates) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const updatedScope = project.scopeOfWork.map(scope => {
          const update = scopeUpdates.find(u => u.id === scope.id);
          return update ? { ...scope, ...update } : scope;
        });
        
        return {
          ...project,
          scopeOfWork: updatedScope,
          updatedAt: new Date().toISOString()
        };
      }
      return project;
    }));
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      createProject,
      updateProject,
      addSupervisorToProject,
      getProjectBySupervisor,
      getSupervisorConfirmationStatus,
      setSupervisorConfirmation,
      needsConfirmation,
      updateScopeProgress,
      supervisorConfirmations
    }}>
      {children}
    </ProjectContext.Provider>
  );
};