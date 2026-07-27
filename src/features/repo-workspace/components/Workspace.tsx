import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AnalysisView from '../../analysis/components/AnalysisView';
import FeaturesView from '../../features-list/components/FeaturesView';
import BusinessFlowView from '../../business-flow/components/BusinessFlowView';
import GraphScreen from '../../graph/components/GraphScreen';
import QuizGeneratorView from '../../question-generator/components/QuestionGeneratorView';
import { useAppStore } from '../../../store/useAppStore';
import { ArrowLeft } from '@phosphor-icons/react';

const TABS = [
  { id: 'analyze', label: 'Phân tích', pageTitle: 'Phân tích Repository' },
  { id: 'bizflow', label: 'Business Flow', pageTitle: 'Business Flow' },
  { id: 'features', label: 'Features', pageTitle: 'Danh sách Features' },
  { id: 'graph', label: 'Graph', pageTitle: 'Dependency Graph' },
  { id: 'quizgen', label: 'Quiz Generator', pageTitle: 'Tạo câu hỏi tự động' },
] as const;

type TabId = typeof TABS[number]['id'];

const Workspace = () => {
  const { repoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setSelectedRepoPath, selectedRepoPath } = useAppStore();

  const searchParams = new URLSearchParams(location.search);
  const activeTab = (searchParams.get('tab') as TabId) || 'analyze';
  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];

  // Sync repo path from URL into store
  useEffect(() => {
    if (repoId) {
      const decoded = decodeURIComponent(repoId);
      if (decoded !== selectedRepoPath) {
        setSelectedRepoPath(decoded);
      }
    }
  }, [repoId, selectedRepoPath, setSelectedRepoPath]);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)]">
      <header className="h-[64px] px-8 flex items-center justify-between border-b border-slate-200 bg-white flex-shrink-0">
        <div>
          <h1 className="text-[17px] font-bold text-slate-900 tracking-tight font-sans">
            {currentTab.pageTitle}
          </h1>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-[600px]">
            {repoId ? decodeURIComponent(repoId) : 'Chưa chọn repository'}
          </p>
        </div>
        <div>
          <button
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-300"
            onClick={() => navigate('/dashboard')}
            title="Quay lại Dashboard"
          >
            <ArrowLeft size={14} weight="bold" />
            Dashboard
          </button>
        </div>
      </header>

      {/* Workspace uses the sidebar nav for tab switching — rendered by Sidebar.tsx */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0">
          {activeTab === 'analyze' && <AnalysisView />}
          {activeTab === 'features' && <FeaturesView />}
          {activeTab === 'bizflow' && <BusinessFlowView />}
          {activeTab === 'graph' && <GraphScreen />}
          {activeTab === 'quizgen' && <QuizGeneratorView />}
        </div>
      </div>
    </div>
  );
};

export default Workspace;