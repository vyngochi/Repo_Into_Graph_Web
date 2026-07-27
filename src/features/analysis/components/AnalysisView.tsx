import { Folder, Database, SpinnerGap } from "@phosphor-icons/react";
import React, { useState } from "react";
import { useAppStore } from "../../../store/useAppStore";
import { useAnalyzeRepo } from "../../dashboard/hooks/useDashboardQueries";

const AnalysisView = () => {
  const { selectedRepoPath, showToast } = useAppStore();
  const [outputDir, setOutputDir] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const analyzeMutation = useAnalyzeRepo();
  const isAnalyzing = analyzeMutation.isPending;

  const handleAnalyze = () => {
    if (!selectedRepoPath) {
      showToast("Chưa có repository được chọn.", "error");
      return;
    }
    
    setAnalysisResult(null);
    analyzeMutation.mutate(
      { repositoryPath: selectedRepoPath, outputDir: outputDir || null },
      {
        onSuccess: (res: any) => {
          const data = res?.data || res;
          setAnalysisResult({
            callEdges: data.edgesCount ?? data.EdgesCount ?? data.callEdges ?? 0,
            methods: data.methodsCount ?? data.MethodsCount ?? data.methods ?? 0,
            repositoryPath: selectedRepoPath,
            status: "Completed",
            message: data.message ?? data.Message ?? "",
          });
        }
      }
    );
  };

  const handleSelectFolder = async () => {
    const folder = await window.dialog?.selectFolder();
    if (folder) setOutputDir(folder);
  };

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1200px] mx-auto">
        {/* Left — Form */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="app-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20" className="text-cyan-600">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">Phân tích Repository</div>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] mb-6">
              Phân tích cấu trúc code và tạo dependency graph từ repository.
            </p>

            <div className="mb-4">
              <label className="app-label">Repository đang chọn</label>
              <input
                type="text"
                className="app-input app-input-mono"
                value={selectedRepoPath || ""}
                readOnly
                placeholder="Chưa chọn repository nào"
              />
            </div>

            <div className="mb-6">
              <label className="app-label">
                Thư mục output <span className="font-normal lowercase opacity-70">(tùy chọn)</span>
              </label>
              <div className="flex bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[var(--radius-sm)] overflow-hidden focus-within:border-[var(--color-primary)]">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 text-[13px] font-mono outline-none text-[var(--text-primary)] bg-transparent"
                  value={outputDir}
                  onChange={(e) => setOutputDir(e.target.value)}
                  placeholder="Mặc định: thư mục gốc của backend"
                />
                <button
                  className="px-3 bg-[var(--bg-base)] border-l border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                  onClick={handleSelectFolder}
                  title="Chọn thư mục"
                >
                  <Folder size={18} weight="fill" />
                </button>
              </div>
            </div>

            <button
              className="app-btn-primary w-full py-3 text-[14px]"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedRepoPath}
            >
              {isAnalyzing ? (
                <SpinnerGap className="animate-spin mr-2" size={18} />
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18" className="mr-2">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              )}
              {isAnalyzing ? "Đang phân tích..." : "Chạy phân tích"}
            </button>
          </div>
        </div>

        {/* Right — Results */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {isAnalyzing && (
            <div className="app-card p-12 flex flex-col items-center justify-center min-h-[300px]">
              <SpinnerGap size={40} className="animate-spin text-[var(--color-primary)] mb-4" />
              <span className="text-[15px] font-medium text-[var(--text-secondary)]">Đang phân tích codebase...</span>
            </div>
          )}

          {!isAnalyzing && !analysisResult && (
            <div className="app-card app-empty-state min-h-[300px]">
              <Database size={64} weight="duotone" className="text-[var(--text-muted)] mb-4" />
              <div className="text-[15px] font-semibold text-[var(--text-secondary)] mb-1">Chưa có kết quả phân tích</div>
              <div className="text-[13px] text-[var(--text-muted)] max-w-sm mt-2">
                Nhấn <strong>Chạy phân tích</strong> để bắt đầu quét dependency graph của repository.
              </div>
            </div>
          )}

          {analysisResult && !isAnalyzing && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="app-stat-card p-5">
                  <div className="app-stat-icon bg-cyan-50 text-cyan-600">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="24" height="24"><path d="M13 7H7v6h6V7z" /><path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <div className="app-stat-value">{analysisResult.callEdges ?? "—"}</div>
                    <div className="app-stat-label">Call Edges</div>
                  </div>
                </div>
                
                <div className="app-stat-card p-5">
                  <div className="app-stat-icon bg-blue-50 text-blue-600">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="24" height="24"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <div className="app-stat-value">{analysisResult.methods ?? "—"}</div>
                    <div className="app-stat-label">Methods</div>
                  </div>
                </div>
                
                <div className="app-stat-card p-5">
                  <div className="app-stat-icon bg-green-50 text-green-600">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="24" height="24"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <div className="app-stat-value text-[18px]">{analysisResult.status || "—"}</div>
                    <div className="app-stat-label">Trạng thái</div>
                  </div>
                </div>
              </div>

              <div className="app-card p-6">
                <div className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-4 border-b border-[var(--border-default)] pb-3">Chi tiết phân tích</div>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-4">
                    <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider w-32 flex-shrink-0 pt-1">Repository</span>
                    <span className="text-[13px] font-mono text-[var(--text-primary)] break-all" title={analysisResult.repositoryPath}>
                      {analysisResult.repositoryPath?.split(/[\\/]/).pop() || analysisResult.repositoryPath}
                    </span>
                  </div>
                  {analysisResult.message && (
                    <div className="flex gap-4 pt-3 border-t border-[var(--border-default)]">
                      <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider w-32 flex-shrink-0 pt-1">Thông báo</span>
                      <span className="text-[13px] text-[var(--text-secondary)] bg-[var(--surface-muted)] px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--border-default)] flex-1 break-words">
                        {analysisResult.message}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
