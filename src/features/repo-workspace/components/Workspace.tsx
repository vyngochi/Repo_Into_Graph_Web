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
      <header className="app-page-header">
        <div>
          <h1 className="app-page-title">
            {currentTab.pageTitle}
          </h1>
          <p className="app-page-subtitle truncate max-w-[600px]">
            {repoId ? decodeURIComponent(repoId) : 'Chưa chọn repository'}
          </p>
        </div>
        <div>
          <button
            className="app-btn-secondary px-3 py-1.5 rounded-full"
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