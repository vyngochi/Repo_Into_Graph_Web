import React from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import {
  Folder,
  Question,
  MagnifyingGlass,
  ListBullets,
  TreeStructure,
  Graph,
  Exam,
  CaretLeft,
  CaretRight,
  ArrowLeft,
} from "@phosphor-icons/react";

const Sidebar = () => {
  const { serverUrl, isSidebarCollapsed, setIsSidebarCollapsed } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { repoId } = useParams();

  const isWorkspace = location.pathname.includes("/workspace");
  const encodedRepoId = repoId ? encodeURIComponent(repoId) : "";

  const NavItem = ({ icon: Icon, label, tabName, path, activeMatch }: any) => {
    const isActive = location.search.includes(activeMatch) || (!location.search && activeMatch === "tab=analyze");
    
    return (
      <button
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-sm)] transition-colors w-full text-left font-sans text-[13px] font-medium
          ${isActive 
            ? 'bg-[#0B3D9110] text-[var(--color-primary)] font-semibold' 
            : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
          }
          ${isSidebarCollapsed ? 'justify-center py-2.5 px-0' : 'justify-start'}
        `}
        onClick={() => navigate(path)}
        title={label}
      >
        <Icon size={18} weight={isActive ? "fill" : "regular"} className="flex-shrink-0" />
        {!isSidebarCollapsed && <span>{label}</span>}
      </button>
    );
  };

  return (
    <aside
      className="flex flex-col flex-shrink-0 bg-[var(--bg-base)] border-r border-[var(--border-default)] h-full relative"
      style={{
        width: isSidebarCollapsed ? "70px" : "220px",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div className={`flex items-center gap-2.5 ${isSidebarCollapsed ? 'justify-center pt-5 pb-4 px-0' : 'justify-start pt-5 pb-4 px-4'}`}>
        <div
          className="flex-shrink-0 cursor-pointer text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          <Graph weight="duotone" size={28} />
        </div>
        {!isSidebarCollapsed && (
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-[var(--text-primary)] tracking-tight font-sans">Repo Into Graph</span>
            <span className="text-[10px] text-[var(--text-muted)] font-medium tracking-wider uppercase">
              {isWorkspace ? "Workspace" : "2026"}
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-2.5 py-2">
        {!isWorkspace ? (
          <>
            <NavItem icon={Folder} label="Danh sách Repo" activeMatch="tab=repos" path="/dashboard?tab=repos" />
            <NavItem icon={Question} label="Bộ câu hỏi AI" activeMatch="tab=questions" path="/dashboard?tab=questions" />
          </>
        ) : (
          <>
            <button
              className={`flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-sm)] transition-colors w-full text-left font-sans text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] ${isSidebarCollapsed ? 'justify-center py-2.5 px-0' : 'justify-start'}`}
              onClick={() => navigate("/dashboard")}
              title="Back to Dashboard"
            >
              <ArrowLeft size={16} weight="bold" />
              {!isSidebarCollapsed && <span>Back to Dashboard</span>}
            </button>
            <div className="h-px bg-[var(--border-default)] my-1 mx-2" />
            <NavItem icon={MagnifyingGlass} label="Phân tích" activeMatch="tab=analyze" path={`/workspace/${encodedRepoId}?tab=analyze`} />
            <NavItem icon={ListBullets} label="Features" activeMatch="tab=features" path={`/workspace/${encodedRepoId}?tab=features`} />
            <NavItem icon={TreeStructure} label="Business Flow" activeMatch="tab=bizflow" path={`/workspace/${encodedRepoId}?tab=bizflow`} />
            <NavItem icon={Graph} label="Graph" activeMatch="tab=graph" path={`/workspace/${encodedRepoId}?tab=graph`} />
            <NavItem icon={Exam} label="Quiz Generator" activeMatch="tab=quizgen" path={`/workspace/${encodedRepoId}?tab=quizgen`} />
          </>
        )}
      </nav>

      <div className={`border-t border-[var(--border-default)] flex items-center ${isSidebarCollapsed ? 'flex-col p-3 gap-3' : 'flex-row px-4 py-3 gap-2'}`}>
        <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'justify-center' : 'justify-start flex-1'}`}>
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" title={serverUrl} />
          {!isSidebarCollapsed && <span className="text-[11px] text-[var(--text-muted)] font-medium truncate">{serverUrl}</span>}
        </div>
        <button
          className="w-7 h-7 rounded bg-transparent border-none text-[var(--text-muted)] cursor-pointer flex items-center justify-center transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          title={isSidebarCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          {isSidebarCollapsed ? <CaretRight size={16} weight="bold" /> : <CaretLeft size={16} weight="bold" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
