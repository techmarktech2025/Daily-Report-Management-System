// src/routes/index.js
import React from 'react';
import { 
  Home as HomeIcon,
  Business as ProjectIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  List as ListIcon,
  Inventory as MaterialIcon  // Add this import
  
} from '@mui/icons-material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import InventoryIcon from '@mui/icons-material/Inventory';

// Import existing components
const AdminHome = React.lazy(() => import('../Pages/Admin_Home'));
const Project = React.lazy(() => import('../Pages/Project'));
const AddEmployee = React.lazy(() => import('../Pages/AddEmployee/AddEmployee'));
const EmployeeList = React.lazy(() => import('../Pages/EmployeeList/EmployeeList'));
const ProjectCreation = React.lazy(() => import('../Pages/ProjectCreation/ProjectCreation')); 
const MaterialRequests = React.lazy(() => import('../Pages/MaterialRequests/MaterialRequests'));
const ToolRequests = React.lazy(() => import('../Pages/ToolRequests/ToolRequests')); 
const MaterialToolHub = React.lazy(() => import('../Pages/MaterialToolHub/MaterialToolHub'));


// Placeholder component
const PlaceholderComponent = ({ title }) => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>{title} Page</h2>
      <p>This page is under construction.</p>
    </div>
  );
};

// Route configuration
export const routeConfig = [
  {
    path: '/admin',
    component: AdminHome,
    title: 'Dashboard',
    icon: HomeIcon,
    showInNav: true,
    exact: true
  },
  {
    path: '/admin/projects',
    title: 'Projects',
    icon: ProjectIcon,
    showInNav: true,
    children: [
      {
        path: '/admin/projects/list',
        component: Project,
        title: 'Project List',
        icon: ListIcon,
        showInNav: true
      },
      {
        path: '/admin/projects/create',
        component: ProjectCreation,
        title: 'Create Project',
        icon: AddIcon,
        showInNav: true
      }
    ]
  },
  {
    path: '/admin/employees',
    title: 'Employee Management',
    icon: PeopleIcon,
    showInNav: true,
    children: [
      {
        path: '/admin/employees/add',
        component: AddEmployee,
        title: 'Add Employee',
        icon: PersonIcon,
        showInNav: true
      },
      {
        path: '/admin/employees/list',
        component: EmployeeList,
        title: 'Employee List',
        icon: GroupIcon,
        showInNav: true
      }
    ]
  },
    {
    path: '/admin/material-requests',
    component: MaterialRequests,
    title: 'Material Request',
    icon: MaterialIcon,
    showInNav: true
  },
  {
    path: '/admin/tool-requests',
    component: ToolRequests,
    title: 'Tool Request',
    icon : BuildCircleIcon,
    showInNav: true
  },

    {
  path: '/admin/material-tool-hub',
  component: MaterialToolHub,
  title: 'Material & Tool Hub',
  icon: InventoryIcon,
  showInNav: true
  },
  
  {
    path: '/admin/settings',
    component: () => <PlaceholderComponent title="Settings" />,
    title: 'Settings',
    icon: SettingsIcon,
    showInNav: true
  }
];

// Helper function to get flat routes for React Router
export const getFlatRoutes = (routes = routeConfig) => {
  const flatRoutes = [];
  
  routes.forEach(route => {
    if (route.component) {
      flatRoutes.push(route);
    }
    if (route.children) {
      flatRoutes.push(...getFlatRoutes(route.children));
    }
  });
  
  return flatRoutes;
};
