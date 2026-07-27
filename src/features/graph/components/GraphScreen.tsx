import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SigmaCanvas from "./SigmaCanvas";
import { useAppStore } from "../../../store/useAppStore";
import { graphApi } from "../../../services/graphApi";
import { SpinnerGap, Database } from "@phosphor-icons/react";

type ActiveTab = "graph" | "coreflow";

const GraphScreen = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlFeatureId = searchParams.get("featureId");

  const [activeTab, setActiveTab] = useState<ActiveTab>(
    urlFeatureId ? "coreflow" : "graph",
  );

  useEffect(() => {
    if (urlFeatureId) {
      setActiveTab("coreflow");
    }
  }, [urlFeatureId]);

  const getTabClass = (tab: ActiveTab) =>
    `px-4 py-2 text-[13px] font-semibold font-sans rounded-full transition-all duration-200 cursor-pointer border-none shadow-sm ${
      activeTab === tab
        ? "bg-indigo-500 text-white shadow-indigo-500/30"
        : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50"
    }`;

  return (
    <div className="flex flex-col h-full relative bg-slate-50/50">
      {/* Floating Glassmorphism Tab bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] flex gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-slate-200 shadow-sm">
        <button className={getTabClass("graph")} onClick={() => setActiveTab("graph")}>
          Interactive Graph
        </button>
        <button
          className={getTabClass("coreflow")}
          onClick={() => setActiveTab("coreflow")}
        >
          Core Flow
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 h-full">
        {activeTab === "graph" && <SigmaCanvas />}
        {activeTab === "coreflow" && (
          <CoreFlowTab initialFeatureId={urlFeatureId || ""} />
        )}
      </div>
    </div>
  );
};

// ── Core Flow Tab ─────────────────────────────────────────────────────────────

const CoreFlowTab = ({
  initialFeatureId = "",
}: {
  initialFeatureId?: string;
}) => {
  const { showToast, selectedRepoPath } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeFlow, setCodeFlow] = useState<any>(null);

  const handleLoad = async () => {
    if (!selectedRepoPath?.trim()) {
      showToast("Không có thư mục được chọn trong Workspace.", "error");
      return;
    }
    setIsLoading(true);
    setCodeFlow(null);
    try {
      const result = await graphApi.scanLocal(selectedRepoPath.trim());
      if (result?.success) {
        const nodes = result.nodes || [];
        const edges = result.edges || [];

        const mappedFiles = nodes.map((node: any) => {
          const path = node.id;
          const imports = edges.filter((e: any) => e.source === path).map((e: any) => e.target);
          const importedBy = edges.filter((e: any) => e.target === path).map((e: any) => e.source);
          return {
            path,
            imports,
            importedBy,
            sourceCode: node.attributes?.sourceCode || ""
          };
        });
        setCodeFlow({ files: mappedFiles, edgesCount: edges.length });
      } else {
        showToast(result?.error || "Không thể tải Core Flow.", "error");
      }
    } catch {
      showToast("Lỗi kết nối.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRepoPath) {
      handleLoad();
    }
  }, [selectedRepoPath]);

  // Defensive extraction of files array
  const rawFiles = codeFlow?.files || codeFlow?.Files || codeFlow?.methods || codeFlow?.Methods || [];
  let files = Array.isArray(rawFiles) ? rawFiles : [];
  const totalEdges = codeFlow?.edgesCount || 0;

  if (searchQuery.trim()) {
    files = files.filter((f: any) => f.path?.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 pt-20 pb-8 bg-slate-50/50">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
        {/* Left Search panel */}
        <div className="bg-white border border-slate-200 rounded-[var(--radius-md)] p-6 shadow-sm sticky top-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
              /
            </div>
            <div className="text-base font-bold text-slate-900">Core Flow</div>
          </div>
          <p className="text-[13px] text-slate-500 mb-6">Xem danh sách các file dự án và sự phụ thuộc giữa các file.</p>
          
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tìm kiếm file</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-[13px] outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              placeholder="Tìm theo tên file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Định dạng file</label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-[13px] outline-none text-slate-700">
              <option>Tất cả định dạng</option>
            </select>
          </div>
          
          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600 leading-none mb-1">{codeFlow ? codeFlow.files?.length : 0}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng files</div>
            </div>
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600 leading-none mb-1">{totalEdges}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phụ thuộc</div>
            </div>
          </div>
          
          <button
            className="w-full py-2.5 bg-indigo-600 text-white rounded-md text-[13px] font-semibold hover:bg-indigo-700 flex items-center justify-center transition-colors disabled:opacity-50"
            onClick={() => handleLoad()}
            disabled={isLoading}
          >
            {isLoading ? <SpinnerGap size={16} className="animate-spin mr-2" /> : null}
            {isLoading ? "Đang tải..." : "Quét lại thư mục"}
          </button>
        </div>

        {/* Right timeline result */}
        <div className="flex flex-col gap-6">
          {!codeFlow && !isLoading && (
            <div className="bg-white border border-slate-200 rounded-[var(--radius-md)] p-12 text-center shadow-sm flex flex-col items-center justify-center">
              <Database size={48} weight="duotone" className="text-slate-300 mb-4" />
              <div className="text-[15px] font-semibold text-slate-800 mb-1">Mở một Workspace để bắt đầu</div>
              <div className="text-[13px] text-slate-500 max-w-sm">
                Core Flow sẽ tự động phân tích và hiển thị cấu trúc các file dự án.
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="bg-white border border-slate-200 rounded-[var(--radius-md)] p-12 text-center shadow-sm flex flex-col items-center justify-center h-[300px]">
              <SpinnerGap size={40} className="animate-spin text-indigo-500 mb-4" />
              <span className="text-[14px] font-medium text-slate-600">Đang tải Core Flow...</span>
            </div>
          )}

          {codeFlow && files.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-[var(--radius-md)] p-12 text-center shadow-sm">
              <div className="text-[15px] font-semibold text-slate-800 mb-1">Không tìm thấy thông tin cấu trúc file</div>
              <div className="text-[13px] text-slate-500 max-w-sm mx-auto">
                Thư mục này không chứa thông tin file và sự phụ thuộc hoặc chưa được phân tích đúng.
              </div>
            </div>
          )}

          {codeFlow && files.length > 0 && (
            <div className="relative pl-10 border-l-2 border-indigo-100 ml-5 mt-2">
              {files.map((file: any, i: number) => {
                return (
                  <div key={i} className="relative mb-8">
                    {/* Circle Node */}
                    <div className="absolute -left-[47px] top-4 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow-[0_0_0_4px_rgba(99,102,241,0.15)] z-10" />
                    {/* Number Badge */}
                    <div className="absolute -left-[84px] top-2.5 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-indigo-500 shadow-sm z-10">
                      {i + 1}
                    </div>
                    <FileDependencyCard file={file} selectedRepoPath={selectedRepoPath} />
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

const FileDependencyCard = ({
  file,
  selectedRepoPath
}: {
  file: any;
  selectedRepoPath: string | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sourceCode, setSourceCode] = useState<string>("");
  const [isLoadingCode, setIsLoadingCode] = useState(false);

  const filePath = file.path || file.Path || file.className || "Unknown/File.cs";
  const fileName = filePath.split("/").pop() || filePath;
  const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));

  const imports = file.imports || file.Imports || [];
  const importedBy = file.importedBy || file.ImportedBy || [];

  useEffect(() => {
    if (isOpen && !sourceCode && !isLoadingCode && selectedRepoPath) {
      const absPath = selectedRepoPath.replace(/[\\/]$/, "") + "\\" + filePath.replace(/\//g, "\\");
      setIsLoadingCode(true);
      graphApi
        .readFile(absPath)
        .then((res) => {
          if (res?.success && res.content) {
            setSourceCode(res.content);
          } else {
            setSourceCode("// Lỗi đọc file: " + (res?.error || "Không có nội dung"));
          }
        })
        .catch((err) => {
          setSourceCode("// Lỗi: " + err);
        })
        .finally(() => {
          setIsLoadingCode(false);
        });
    }
  }, [isOpen, sourceCode, isLoadingCode, filePath, selectedRepoPath]);

  return (
    <div className={`bg-white border ${isOpen ? 'border-indigo-300 shadow-md' : 'border-slate-200 shadow-sm'} rounded-xl overflow-hidden transition-all duration-200`}>
      <div
        className={`px-5 py-4 flex justify-between items-center cursor-pointer transition-colors ${isOpen ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-[13px]">
          <span className="text-slate-400">
            {dirPath ? dirPath + " / " : ""}
          </span>
          <span className="text-indigo-600 font-bold ml-1">
            {fileName}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
          <span>{imports.length} imports &middot; {importedBy.length} dependents</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            width="16"
            height="16"
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`}
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <div className="p-6 border-t border-slate-100 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Tệp tin nhập vào ({imports.length} IMPORTS)
              </div>
              {imports.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {imports.map((imp: any, idx: number) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-center gap-2">
                      <span className="text-[14px]">📄</span> <span className="font-mono">{imp}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-slate-400 italic">Chưa có file nào</div>
              )}
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Được nhập bởi ({importedBy.length} DEPENDENTS)
              </div>
              {importedBy.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {importedBy.map((imp: any, idx: number) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-center gap-2">
                      <span className="text-[14px]">🔗</span> <span className="font-mono">{imp}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-slate-400 italic">Chưa có file nào phụ thuộc</div>
              )}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Xem trước mã nguồn
            </div>
            <pre className="p-4 m-0 text-xs font-mono max-h-[350px] overflow-auto text-slate-700 bg-slate-50 border border-slate-200 rounded-lg shadow-inner">
              {isLoadingCode ? (
                <div className="text-slate-400 italic p-3 flex items-center gap-2">
                  <SpinnerGap size={14} className="animate-spin" /> Đang tải source code...
                </div>
              ) : sourceCode ? (
                <div className="table w-full">
                  {sourceCode.split("\n").map((line: string, i: number) => {
                    let highlighted = line
                      .replace(/\b(using|namespace|public|class|private|readonly|return)\b/g, "<span class='text-purple-600'>$1</span>")
                      .replace(/\b(string|int|bool|var)\b/g, "<span class='text-amber-600'>$1</span>")
                      .replace(/("[^"]*")/g, "<span class='text-green-600'>$1</span>");
                    return (
                      <div key={i} className="table-row hover:bg-slate-100">
                        <span className="table-cell text-right pr-4 text-slate-300 select-none w-10 border-r border-slate-200">{i + 1}</span>
                        <span className="table-cell whitespace-pre-wrap pl-4" dangerouslySetInnerHTML={{ __html: highlighted }} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-slate-400 italic p-3">// Không có source code</div>
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphScreen;
