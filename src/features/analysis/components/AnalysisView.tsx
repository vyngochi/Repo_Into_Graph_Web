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
          <div className="bg-white border border-slate-200 rounded-[var(--radius-md)] shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20" className="text-cyan-600">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-[15px] font-semibold text-slate-900 tracking-tight">Phân tích Repository</div>
            </div>
            <p className="text-[13px] text-slate-500 mb-6">
              Phân tích cấu trúc code và tạo dependency graph từ repository.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Repository đang chọn</label>
              <input
                type="text"
                className={`w-full px-3 py-2.5 border border-slate-300 rounded-md text-[13px] font-mono outline-none ${selectedRepoPath ? 'bg-slate-50 text-slate-900' : 'bg-slate-100 text-slate-400'}`}
                value={selectedRepoPath || ""}
                readOnly
                placeholder="Chưa chọn repository nào"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Thư mục output <span className="font-normal lowercase opacity-70">(tùy chọn)</span>
              </label>
              <div className="flex bg-white border border-slate-300 rounded-md overflow-hidden focus-within:border-blue-500">
                <input
                  type="text"
                  className="flex-1 px-3 py-2.5 text-[13px] font-mono outline-none text-slate-900 bg-transparent"
                  value={outputDir}
                  onChange={(e) => setOutputDir(e.target.value)}
                  placeholder="Mặc định: thư mục gốc của backend"
                />
                <button
                  className="px-3 bg-slate-50 border-l border-slate-300 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  onClick={handleSelectFolder}
                  title="Chọn thư mục"
                >
                  <Folder size={18} weight="fill" />
                </button>
              </div>
            </div>

            <button
              className="w-full py-3 bg-[var(--color-primary)] text-white text-sm font-medium rounded-md hover:bg-[var(--color-primary-hover)] flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="bg-white border border-slate-200 rounded-[var(--radius-md)] shadow-sm p-12 flex flex-col items-center justify-center min-h-[300px]">
              <SpinnerGap size={40} className="animate-spin text-blue-500 mb-4" />
              <span className="text-[15px] font-medium text-slate-600">Đang phân tích codebase...</span>
            </div>
          )}

          {!isAnalyzing && !analysisResult && (
            <div className="bg-white border border-slate-200 rounded-[var(--radius-md)] shadow-sm p-12 flex flex-col items-center justify-center min-h-[300px] text-center">
              <Database size={64} weight="duotone" className="text-slate-300 mb-4" />
              <div className="text-[15px] font-semibold text-slate-700 mb-1">Chưa có kết quả phân tích</div>
              <div className="text-[13px] text-slate-500 max-w-sm">
                Nhấn <strong>Chạy phân tích</strong> để bắt đầu quét dependency graph của repository.
              </div>
            </div>
          )}

          {analysisResult && !isAnalyzing && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center flex-shrink-0 text-cyan-600">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="24" height="24"><path d="M13 7H7v6h6V7z" /><path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">{analysisResult.callEdges ?? "—"}</div>
                    <div className="text-[12px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">Call Edges</div>
                  </div>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="24" height="24"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">{analysisResult.methods ?? "—"}</div>
                    <div className="text-[12px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">Methods</div>
                  </div>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 text-green-600">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="24" height="24"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900 tracking-tight">{analysisResult.status || "—"}</div>
                    <div className="text-[12px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">Trạng thái</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[var(--radius-md)] shadow-sm p-6">
                <div className="text-[15px] font-semibold text-slate-900 tracking-tight mb-4 border-b border-slate-100 pb-3">Chi tiết phân tích</div>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-4">
                    <span className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider w-32 flex-shrink-0">Repository</span>
                    <span className="text-[13px] font-mono text-slate-900 break-all" title={analysisResult.repositoryPath}>
                      {analysisResult.repositoryPath?.split(/[\\/]/).pop() || analysisResult.repositoryPath}
                    </span>
                  </div>
                  {analysisResult.message && (
                    <div className="flex gap-4 pt-3 border-t border-slate-100">
                      <span className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider w-32 flex-shrink-0">Thông báo</span>
                      <span className="text-[13px] text-slate-700 bg-slate-50 px-3 py-2 rounded-md border border-slate-100 flex-1 break-words">
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
