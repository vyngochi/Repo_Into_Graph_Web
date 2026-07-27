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
      <div className="bg-white border border-slate-200 rounded-[var(--radius-md)] shadow-sm flex flex-col flex-1 min-h-[400px]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-900">Lịch sử các lượt phân tích</h2>
          <button 
            className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium rounded-md transition-colors"
            onClick={() => setShowAnalyzeModal(true)}
          >
            + Phân tích repository mới
          </button>
        </div>

        {/* Modal for Analyze */}
        {showAnalyzeModal && (
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Đường dẫn Repository (Local)</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 font-mono"
                value={repoPath}
                onChange={(e) => setRepoPath(e.target.value)}
                placeholder="D:\\Projects\\MyAwesomeApp"
              />
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50" onClick={() => setShowAnalyzeModal(false)}>Hủy</button>
              <button 
                className="px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium rounded-md flex items-center"
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
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <SpinnerGap size={32} className="animate-spin mb-4 text-blue-500" />
              <span>Đang tải danh sách lịch sử...</span>
            </div>
          ) : runs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Database size={48} weight="duotone" className="text-slate-300 mb-4" />
              <div className="text-sm font-semibold text-slate-700">Chưa có dữ liệu lịch sử</div>
              <div className="text-sm text-slate-500 mt-1 max-w-sm">Các lượt phân tích thành công trước đó sẽ được lưu lại tại đây.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex px-4 gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
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
                  <div key={run.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm hover:border-blue-300">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 flex flex-col gap-1 overflow-hidden" title={pathStr}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900 truncate">
                            {run.repoName || pathStr.split(/[\\/]/).pop()}
                          </span>
                          {run.isPublic !== undefined && (
                            <span className="text-[10px] px-2 py-0.5 border border-slate-200 rounded-full text-slate-500 font-bold bg-white">
                              {run.isPublic ? "Public" : "Private"}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                          {run.repoOwner && <span>{run.repoOwner} •</span>}
                          <span className="font-mono text-[11px] truncate">{pathStr}</span>
                        </div>
                      </div>
                      
                      <div className="w-24 text-sm font-medium text-slate-600">{run.repoLanguage || "—"}</div>
                      
                      <div className="w-36 text-xs font-medium text-slate-600">
                        {run.createdAt ? new Date(run.createdAt).toLocaleString("vi-VN") : "—"}
                      </div>
                      
                      <div className="w-28">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${isFailed ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200"}`}>
                          {run.status || "Success"}
                        </span>
                      </div>
                      
                      <div className="w-36 text-right flex gap-2 justify-end">
                        <button 
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300"
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
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-[var(--color-primary)] hover:bg-blue-50 hover:border-blue-200"
                          onClick={() => openWorkspace(pathStr)}
                        >
                          Workspace
                        </button>
                      </div>
                    </div>
                    
                    {/* Edit Form */}
                    {isEditing && (
                      <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tên Repo</label>
                          <input type="text" className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500" value={runForm.repoName} onChange={(e) => setRunForm({...runForm, repoName: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Ngôn ngữ</label>
                          <input type="text" className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500" value={runForm.repoLanguage} onChange={(e) => setRunForm({...runForm, repoLanguage: e.target.value})} />
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <button 
                            className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-md hover:bg-[var(--color-primary-hover)] flex items-center"
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
