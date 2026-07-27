import React, { useState } from "react";
import { Database, SpinnerGap } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useAnalysisRuns, useUpdateAnalysisRun, useAnalyzeRepo } from "../hooks/useDashboardQueries";
import { AnalysisRun } from "../types";

const ReposTab = () => {
  const navigate = useNavigate();
  const { data: runs = [], isLoading } = useAnalysisRuns();
  const updateRunMutation = useUpdateAnalysisRun();
  const analyzeRepoMutation = useAnalyzeRepo();

  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);
  const [repoPath, setRepoPath] = useState("");
  const [editingRun, setEditingRun] = useState<AnalysisRun | null>(null);
  const [runForm, setRunForm] = useState({
    repoName: "",
    repoOwner: "",
    repoDescription: "",
    repoUrl: "",
    repoLanguage: "",
  });

  const handleAnalyze = () => {
    if (!repoPath.trim()) return;
    analyzeRepoMutation.mutate(
      { repositoryPath: repoPath.trim() },
      {
        onSuccess: () => {
          setShowAnalyzeModal(false);
          const repoId = encodeURIComponent(repoPath.trim());
          navigate(`/workspace/${repoId}?tab=analyze`);
        }
      }
    );
  };

  const handleUpdateRun = () => {
    if (!editingRun) return;
    updateRunMutation.mutate(
      { id: editingRun.id, payload: runForm },
      {
        onSuccess: () => {
          setEditingRun(null);
        }
      }
    );
  };

  const openWorkspace = (path: string) => {
    const repoId = encodeURIComponent(path);
    navigate(`/workspace/${repoId}?tab=analyze`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="app-card flex flex-col flex-1 min-h-[400px]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-default)]">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Lịch sử các lượt phân tích</h2>
          <button 
            className="app-btn-primary"
            onClick={() => setShowAnalyzeModal(true)}
          >
            + Phân tích repository mới
          </button>
        </div>

        {/* Modal for Analyze */}
        {showAnalyzeModal && (
          <div className="p-6 border-b border-[var(--border-default)] bg-[var(--bg-subtle)] flex gap-4 items-end">
            <div className="flex-1">
              <label className="app-label">Đường dẫn Repository (Local)</label>
              <input 
                type="text" 
                className="app-input app-input-mono"
                value={repoPath}
                onChange={(e) => setRepoPath(e.target.value)}
                placeholder="D:\\Projects\\MyAwesomeApp"
              />
            </div>
            <div className="flex gap-2">
              <button className="app-btn-secondary" onClick={() => setShowAnalyzeModal(false)}>Hủy</button>
              <button 
                className="app-btn-primary bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]"
                onClick={handleAnalyze}
                disabled={analyzeRepoMutation.isPending}
              >
                {analyzeRepoMutation.isPending && <SpinnerGap className="animate-spin mr-2" />}
                {analyzeRepoMutation.isPending ? "Đang phân tích..." : "Bắt đầu"}
              </button>
            </div>
          </div>
        )}

        <div className="p-6">
          {isLoading ? (
            <div className="app-empty-state py-12">
              <SpinnerGap size={32} className="animate-spin mb-4 text-[var(--color-primary)]" />
              <span>Đang tải danh sách lịch sử...</span>
            </div>
          ) : runs.length === 0 ? (
            <div className="app-empty-state py-12">
              <Database size={48} weight="duotone" className="text-[var(--text-muted)] mb-4" />
              <div className="text-sm font-semibold text-[var(--text-secondary)]">Chưa có dữ liệu lịch sử</div>
              <div className="text-sm text-[var(--text-muted)] mt-1 max-w-sm">Các lượt phân tích thành công trước đó sẽ được lưu lại tại đây.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="app-section-label flex px-4 gap-4 tracking-wider">
                <div className="flex-1">Repository</div>
                <div className="w-24">Ngôn ngữ</div>
                <div className="w-36">Thời gian chạy</div>
                <div className="w-28">Trạng thái</div>
                <div className="w-36 text-right">Hành động</div>
              </div>
              
              {runs.map((run) => {
                const pathStr = run.repositoryPath || "";
                const isFailed = run.status?.toLowerCase() === "failed";
                const isEditing = editingRun?.id === run.id;

                return (
                  <div key={run.id} className="bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] hover:border-[#cbd5e1]">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 flex flex-col gap-1 overflow-hidden" title={pathStr}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                            {run.repoName || pathStr.split(/[\\/]/).pop()}
                          </span>
                          {run.isPublic !== undefined && (
                            <span className="text-[10px] px-2 py-0.5 border border-[var(--border-default)] rounded-full text-[var(--text-secondary)] font-bold bg-[var(--bg-base)]">
                              {run.isPublic ? "Public" : "Private"}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 truncate">
                          {run.repoOwner && <span>{run.repoOwner} •</span>}
                          <span className="font-mono text-[11px] truncate">{pathStr}</span>
                        </div>
                      </div>
                      
                      <div className="w-24 text-sm font-medium text-[var(--text-secondary)]">{run.repoLanguage || "—"}</div>
                      
                      <div className="w-36 text-xs font-medium text-[var(--text-secondary)]">
                        {run.createdAt ? new Date(run.createdAt).toLocaleString("vi-VN") : "—"}
                      </div>
                      
                      <div className="w-28">
                        <span className={`app-badge ${isFailed ? "app-badge-error" : "app-badge-success"}`}>
                          {run.status || "Success"}
                        </span>
                      </div>
                      
                      <div className="w-36 text-right flex gap-2 justify-end">
                        <button 
                          className="app-btn-secondary px-2.5 py-1.5"
                          onClick={() => {
                            setEditingRun(isEditing ? null : run);
                            if (!isEditing) {
                              setRunForm({
                                repoName: run.repoName || "",
                                repoOwner: run.repoOwner || "",
                                repoDescription: run.repoDescription || "",
                                repoUrl: run.repoUrl || "",
                                repoLanguage: run.repoLanguage || "",
                              });
                            }
                          }}
                        >
                          {isEditing ? "Đóng" : "Sửa"}
                        </button>
                        <button 
                          className="app-btn-secondary px-3 py-1.5 text-[var(--color-primary)]"
                          onClick={() => openWorkspace(pathStr)}
                        >
                          Workspace
                        </button>
                      </div>
                    </div>
                    
                    {/* Edit Form */}
                    {isEditing && (
                      <div className="mt-4 pt-4 border-t border-[var(--border-default)] grid grid-cols-2 gap-4">
                        <div>
                          <label className="app-label">Tên Repo</label>
                          <input type="text" className="app-input" value={runForm.repoName} onChange={(e) => setRunForm({...runForm, repoName: e.target.value})} />
                        </div>
                        <div>
                          <label className="app-label">Ngôn ngữ</label>
                          <input type="text" className="app-input" value={runForm.repoLanguage} onChange={(e) => setRunForm({...runForm, repoLanguage: e.target.value})} />
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <button 
                            className="app-btn-primary"
                            onClick={handleUpdateRun}
                            disabled={updateRunMutation.isPending}
                          >
                            {updateRunMutation.isPending && <SpinnerGap className="animate-spin mr-2" />}
                            Lưu thay đổi
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReposTab;
