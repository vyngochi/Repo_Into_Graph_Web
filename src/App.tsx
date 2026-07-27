import { X } from "@phosphor-icons/react";
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/components/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './features/dashboard/components/Dashboard';
import Workspace from './features/repo-workspace/components/Workspace';
import { useAppStore } from './store/useAppStore';

// Global Toast notification
const Toast = () => {
  const { toast, clearToast } = useAppStore();
  if (!toast) return null;
  
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <div 
        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 min-w-[300px] rounded-[var(--radius-sm)] shadow-md border cursor-pointer transition-all ${typeStyles[toast.type]}`}
        onClick={clearToast}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18" className="flex-shrink-0">
          {toast.type === 'success' && <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>}
          {toast.type === 'error' && <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>}
          {toast.type === 'info' && <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>}
        </svg>
        <span className="flex-1 text-[13px] font-medium">{toast.message}</span>
        <X size={16} weight="bold" className="opacity-70 hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workspace/:repoId" element={<Workspace />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toast />
    </BrowserRouter>
  );
}

export default App;