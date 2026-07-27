import React, { useState, useMemo, useRef, useEffect } from "react";
import { MagnifyingGlass, Database, TreeStructure, SpinnerGap } from "@phosphor-icons/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAppStore } from "../../../store/useAppStore";
import { graphApi } from "../../../services/graphApi";
import { parseMermaid, FeatureInteractiveGraph } from "./FeatureInteractiveGraph";
import { useAnalysisRuns } from "../../dashboard/hooks/useDashboardQueries";
import { useFeatures, useFeatureDetail } from "../hooks/useFeatureQueries";
import { FeatureDetail } from "../types";

const FeaturesView = () => {
  const { selectedRepoPath, showToast } = useAppStore();
  const [search, setSearch] = useState("");
  const [selectedRunId, setSelectedRunId] = useState<string>("");
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  
  const { data: analysisRuns = [] } = useAnalysisRuns();
  const { data: features = [], isLoading: isFeaturesLoading } = useFeatures(selectedRunId || undefined);
  const { data: featureDetail, isLoading: isDetailLoading } = useFeatureDetail(selectedFeatureId || undefined);

  const [activeViewTab, setActiveViewTab] = useState<"graph" | "visual" | "mermaid">("graph");

  // Code Viewer Drawer State
  const [selectedNodeCode, setSelectedNodeCode] = useState<{
    code: string;
    highlightLine: number;
    className: string;
    method: string;
    filePath: string;
  } | null>(null);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  
  // Resizable Panel State
  const [isGraphFullscreen, setIsGraphFullscreen] = useState(false);
  const [codePanelWidth, setCodePanelWidth] = useState(600);
  const [isResizingPanel, setIsResizingPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingPanel) return;
      let panelLeft = panelRef.current?.getBoundingClientRect().left || 0;
      let newWidth = e.clientX - panelLeft;
      if (newWidth < 300) newWidth = 300;
      if (newWidth > 1200) newWidth = 1200;
      if (panelRef.current) panelRef.current.style.width = `${newWidth}px`;
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (isResizingPanel) {
        setIsResizingPanel(false);
        let panelLeft = panelRef.current?.getBoundingClientRect().left || 0;
        let newWidth = e.clientX - panelLeft;
        if (newWidth < 300) newWidth = 300;
        if (newWidth > 1200) newWidth = 1200;
        setCodePanelWidth(newWidth);
      }
    };

    if (isResizingPanel) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingPanel]);

  const handleNodeClick = async (nodeId: string, label: string) => {
    if (!selectedRepoPath) {
      showToast("Không có thư mục được chọn trong Workspace.", "error");
      return;
    }

    const parts = label.split(".");
    if (parts.length < 2) return;
    const method = parts.pop()!;
    const className = parts.pop()!;

    setIsCodeLoading(true);
    try {
      const scanRes = await graphApi.scanLocal(selectedRepoPath.trim());
      if (scanRes?.success && scanRes.nodes) {
        const fileNode = scanRes.nodes.find((n: any) => n.id.endsWith(`/${className}.cs`) || n.id.endsWith(`\\${className}.cs`) || n.id === `${className}.cs`);
        if (fileNode) {
          const absPath = selectedRepoPath.replace(/[\\/]$/, "") + "\\" + fileNode.id.replace(/\//g, "\\");
          const fileRes = await graphApi.readFile(absPath);
          if (fileRes?.success && fileRes.content) {
            const lines = fileRes.content.split("\n");
            let highlightLine = -1;
            const methodRegex = new RegExp(`\\b${method.replace(/\(\)/g, "")}\\b\\s*\\(`);
            for (let i = 0; i < lines.length; i++) {
              if (methodRegex.test(lines[i])) {
                highlightLine = i + 1;
                break;
              }
            }
            setSelectedNodeCode({ code: fileRes.content, highlightLine, className, method, filePath: fileNode.id });
          } else {
            showToast("Không thể đọc nội dung file.", "error");
          }
        } else {
          showToast(`Không tìm thấy file cho lớp ${className}.cs trong Workspace.`, "error");
        }
      }
    } catch (err) {
      showToast("Lỗi khi tìm code.", "error");
    } finally {
      setIsCodeLoading(false);
    }
  };

  const mermaidGraph = featureDetail?.dataFlowMermaidGraph || "";
  const entryPoint = featureDetail?.entryPoint || "";
  const steps = featureDetail?.steps || [];

  const parsedGraph = useMemo(() => {
    let result = parseMermaid(mermaidGraph);
    if (result.nodes.length === 0 && steps.length > 0) {
      const nodeMap = new Map<string, string>();
      const edgesList: { source: string; target: string; label?: string }[] = [];

      steps.forEach((step, idx) => {
        const caller = `${step.callerClass || "Unknown"}.${step.callerMethod || "Unknown"}`;
        const callee = `${step.calleeClass || "Unknown"}.${step.calleeMethod || "Unknown"}`;
        const order = step.stepOrder !== undefined ? step.stepOrder : idx + 1;

        const getOrAddNode = (name: string) => {
          let id = Array.from(nodeMap.entries()).find(([_, v]) => v === name)?.[0];
          if (!id) {
            id = `n_${nodeMap.size}`;
            nodeMap.set(id, name);
          }
          return id;
        };

        const sId = getOrAddNode(caller);
        const tId = getOrAddNode(callee);
        edgesList.push({ source: sId, target: tId, label: `${order}` });
      });

      const nodesList = Array.from(nodeMap.entries()).map(([id, label]) => ({ id, label }));
      result = { nodes: nodesList, edges: edgesList };
    }
    return result;
  }, [mermaidGraph, steps]);

  const handleCopyMermaid = () => {
    if (mermaidGraph) {
      navigator.clipboard.writeText(mermaidGraph);
      showToast("Đã sao chép mã Mermaid!", "success");
    }
  };

  return (
    <div className="p-6 h-full flex gap-6 overflow-hidden relative">
      {/* Code Drawer Overlay */}
      {selectedNodeCode && (
        <div
          ref={panelRef}
          className="fixed top-0 left-0 bottom-0 bg-white shadow-2xl z-[10000] flex flex-col animate-[slideInLeft_0.2s_ease-out]"
          style={{ width: `${codePanelWidth}px`, minWidth: "600px" }}
        >
          <div
            onMouseDown={() => setIsResizingPanel(true)}
            className={`absolute top-0 -right-1 bottom-0 w-2 cursor-col-resize z-[10001] transition-colors ${isResizingPanel ? 'bg-blue-500' : 'bg-transparent'}`}
          />
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div>
              <div className="text-base font-semibold text-slate-800 mb-1">
                {selectedNodeCode.className}.<span className="text-blue-500">{selectedNodeCode.method}</span>
              </div>
              <div className="text-xs text-slate-500 font-mono">{selectedNodeCode.filePath}</div>
            </div>
            <button
              onClick={() => setSelectedNodeCode(null)}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-auto relative">
            <SyntaxHighlighter
              language="csharp"
              style={oneLight}
              customStyle={{ margin: 0, padding: "20px", fontSize: "13px", minHeight: "100%" }}
              showLineNumbers={true}
              wrapLines={true}
              lineProps={(lineNumber) => {
                const isHighlight = lineNumber === selectedNodeCode.highlightLine;
                return {
                  style: {
                    display: "block",
                    backgroundColor: isHighlight ? "#fffbeb" : "transparent",
                    borderLeft: isHighlight ? "3px solid #f59e0b" : "3px solid transparent",
                    paddingLeft: "8px",
                  }
                };
              }}
            >
              {selectedNodeCode.code}
            </SyntaxHighlighter>
          </div>
        </div>
      )}

      {/* Left panel - Features List */}
      {!isGraphFullscreen && (
        <div className="w-[320px] flex-shrink-0 flex flex-col bg-white/65 backdrop-blur-md border border-white/40 rounded-[var(--radius-md)] shadow-sm overflow-hidden h-full">
          <div className="p-4 border-b border-slate-200/60 bg-white/40">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                <TreeStructure size={14} weight="bold" />
              </div>
              <div className="font-semibold text-slate-800 text-[15px]">Features</div>
            </div>
            <p className="text-xs text-slate-500">Chọn một feature để xem chi tiết.</p>
          </div>
          
          <div className="p-4 flex flex-col gap-3 border-b border-slate-200/60 bg-white/20">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} weight="bold" />
              <input
                type="text"
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-[13px] outline-none focus:border-blue-500"
                placeholder="Tìm kiếm feature..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-[11px] text-slate-500 mb-1 font-semibold uppercase tracking-wider">Lọc theo Analysis Run</label>
              <select
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs outline-none focus:border-blue-500"
                value={selectedRunId}
                onChange={(e) => { setSelectedRunId(e.target.value); setSelectedFeatureId(null); }}
              >
                <option value="">-- Tất cả (Mặc định) --</option>
                {analysisRuns.map((run) => (
                  <option key={run.id} value={run.id}>{run.repoName || run.repositoryPath?.split(/[\\/]/).pop() || run.id}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-2">
            {isFeaturesLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <SpinnerGap size={24} className="animate-spin mb-2" />
              </div>
            ) : features.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="font-semibold text-slate-700 text-sm">Chưa có flow nào</div>
                <div className="text-xs text-slate-500 mt-1">Hãy phân tích repository trước.</div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {features.filter((f) => !search || f.name.toLowerCase().includes(search.toLowerCase())).map((flow) => (
                  <button
                    key={flow.id}
                    className={`text-left px-3 py-2 rounded-md text-[13px] font-medium transition-colors border ${
                      selectedFeatureId === flow.id 
                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                        : 'bg-transparent border-transparent text-slate-700 hover:bg-slate-100'
                    }`}
                    onClick={() => setSelectedFeatureId(flow.id)}
                  >
                    <div className="truncate">{flow.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right panel - Detail View */}
      <div className="flex-1 flex flex-col bg-white/65 backdrop-blur-md border border-white/40 rounded-[var(--radius-md)] shadow-sm overflow-hidden h-full">
        {!selectedFeatureId ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Database size={48} weight="duotone" className="text-slate-300 mb-3" />
            <div className="font-semibold text-slate-700 text-sm">Chưa chọn Feature</div>
            <div className="text-xs text-slate-500 mt-1">Chọn một flow từ danh sách bên trái để xem chi tiết.</div>
          </div>
        ) : isDetailLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <SpinnerGap size={32} className="animate-spin mb-2" />
            <span className="text-sm">Đang tải chi tiết...</span>
          </div>
        ) : featureDetail ? (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-slate-200/60 flex justify-between items-start flex-wrap gap-4 bg-white/40">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase tracking-wider">Feature</span>
                  <span className="text-xs font-mono text-slate-400">{featureDetail.id}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">{featureDetail.name}</h2>
                {featureDetail.description && <p className="text-[13px] text-slate-500 mt-1 max-w-2xl">{featureDetail.description}</p>}
              </div>
              
              <div className="flex gap-1 p-1 bg-black/5 rounded-lg">
                {(["graph", "visual", "mermaid"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveViewTab(tab)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      activeViewTab === tab 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'bg-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab === "graph" ? "Đồ thị" : tab === "visual" ? "Sơ đồ" : "Mermaid"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto p-5 relative bg-white/20">
              {activeViewTab === "graph" ? (
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center px-4 py-2 bg-indigo-50/50 border border-indigo-100 rounded-lg mb-4 text-[13px]">
                    <div>
                      <span className="font-semibold text-indigo-600">Entry Point: </span>
                      <span className="font-mono font-semibold text-slate-800">{entryPoint || "Chưa định nghĩa"}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Tổng số: {parsedGraph.nodes.length} nút, {parsedGraph.edges.length} liên kết</span>
                  </div>
                  
                  {parsedGraph.nodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-center border-2 border-dashed border-slate-200 rounded-xl">
                      <div className="text-[15px] font-semibold text-slate-700">Chưa có dữ liệu đồ thị</div>
                      <div className="text-[13px] text-slate-500 mt-1 max-w-sm">Flow này chưa có dữ liệu Mermaid Graph hoặc Steps để vẽ đồ thị.</div>
                    </div>
                  ) : (
                    <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-inner relative">
                      <FeatureInteractiveGraph
                        parsedGraph={parsedGraph}
                        entryPoint={featureDetail?.name || ""}
                        onNodeClick={handleNodeClick}
                        onToggleFullscreen={() => setIsGraphFullscreen(!isGraphFullscreen)}
                      />
                    </div>
                  )}
                </div>
              ) : activeViewTab === "visual" ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <span>Visual Flow (Coming soon)</span>
                </div>
              ) : (
                <div className="flex flex-col h-full gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-semibold text-slate-600">Raw Mermaid Script</span>
                    <button onClick={handleCopyMermaid} className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      Copy
                    </button>
                  </div>
                  <textarea
                    readOnly
                    className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-700 outline-none resize-none"
                    value={mermaidGraph}
                  />
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FeaturesView;
