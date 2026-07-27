import { MagnifyingGlass, Database, SpinnerGap } from "@phosphor-icons/react";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAnalysisRuns } from "../../dashboard/hooks/useDashboardQueries";
import { useBusinessFlows } from "../hooks/useBusinessQueries";

const BusinessFlowView = () => {
  const [search, setSearch] = useState("");
  const [selectedRunId, setSelectedRunId] = useState<string>("");
  const navigate = useNavigate();
  const { repoId } = useParams();

  const { data: analysisRuns = [] } = useAnalysisRuns();

  useEffect(() => {
    if (analysisRuns.length > 0 && !selectedRunId) {
      setSelectedRunId(analysisRuns[0].id);
    }
  }, [analysisRuns, selectedRunId]);

  const { data: businessFlows = [], isLoading, refetch } = useBusinessFlows(selectedRunId);

  const filtered = businessFlows.filter(
    (f) =>
      f.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      f.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 h-full bg-[var(--bg-base)]">
      <div className="max-w-[1200px] mx-auto flex flex-col h-full gap-6">
        <div className="flex flex-wrap gap-4 items-center justify-between bg-white border border-slate-200 rounded-[var(--radius-md)] p-4 shadow-sm">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} weight="bold" />
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-blue-500 focus:bg-white transition-colors"
              placeholder="Tìm kiếm business flow..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">Analysis Run:</span>
              <select
                className="w-[260px] px-3 py-2 bg-white border border-slate-300 rounded-lg text-[13px] text-slate-700 outline-none focus:border-blue-500 shadow-sm"
                value={selectedRunId}
                onChange={(e) => setSelectedRunId(e.target.value)}
              >
                {analysisRuns.length === 0 ? (
                  <option value="">-- Trống --</option>
                ) : (
                  analysisRuns.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")} - {r.repoName || r.id}
                    </option>
                  ))
                )}
              </select>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm disabled:opacity-50"
              onClick={() => refetch()}
              disabled={isLoading || !selectedRunId}
            >
              {isLoading ? (
                <SpinnerGap size={16} className="animate-spin text-blue-500" />
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              )}
              {isLoading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading && businessFlows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] bg-white border border-slate-200 rounded-[var(--radius-md)] shadow-sm">
              <SpinnerGap size={40} className="animate-spin text-blue-500 mb-4" />
              <span className="text-[15px] font-medium text-slate-600">Đang tải danh sách business flows...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] bg-white border border-slate-200 rounded-[var(--radius-md)] shadow-sm text-center">
              <Database size={64} weight="duotone" className="text-slate-300 mb-4" />
              <div className="text-[16px] font-semibold text-slate-800 mb-1">
                {businessFlows.length === 0 ? "Chưa có business flow nào" : "Không tìm thấy kết quả"}
              </div>
              <div className="text-[13px] text-slate-500 max-w-sm">
                {businessFlows.length === 0
                  ? "Hãy phân tích repository trước để trích xuất business flows."
                  : `Không có business flow nào khớp với "${search}"`}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
              {filtered.map((feature) => (
                <div
                  key={feature.id}
                  className="bg-white border border-slate-200 rounded-[var(--radius-md)] p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col h-[220px]"
                >
                  <div className="text-[16px] font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                    {feature.businessName}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mb-3 bg-slate-50 px-2 py-1 rounded inline-block self-start border border-slate-100">
                    {feature.id}
                  </div>
                  
                  <div className="text-[13px] text-slate-600 leading-relaxed flex-1 line-clamp-3">
                    {feature.description || <span className="italic opacity-50">Không có mô tả</span>}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {feature.createdAt ? new Date(feature.createdAt).toLocaleDateString("vi-VN") : ""}
                    </span>
                    <button
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        const encodedRepoId = repoId ? encodeURIComponent(repoId) : "";
                        navigate(`/workspace/${encodedRepoId}?tab=quizgen`);
                      }}
                    >
                      Tạo câu hỏi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessFlowView;
