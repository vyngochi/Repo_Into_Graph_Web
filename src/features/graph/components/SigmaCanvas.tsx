import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Play,
  CaretRight,
  ArrowsClockwise,
  DatabaseIcon,
  FileTextIcon,
} from "@phosphor-icons/react";
import { useAppStore } from "../../../store/useAppStore";
import CodeViewer from "./CodeViewer";
import { graphApi } from "../../../services/graphApi";

interface GraphNode {
  id: string;
  attributes: {
    label: string;
    size: number;
    color: string;
    ext: string;
    x: number;
    y: number;
  };
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  attributes: { size: number; color: string };
}

interface SelectedNode {
  id: string;
  label: string;
  ext: string;
  imports: string[];
  importedBy: string[];
}

// Extension color palette
const EXT_COLORS: Record<string, string> = {
  ".ts": "#2563eb",
  ".tsx": "#0ea5e9",
  ".cs": "#7c3aed",
  ".js": "#d97706",
  ".jsx": "#06b6d4",
  ".css": "#2563eb",
  ".json": "#b45309",
};

const SigmaCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedRepoPath, showToast } = useAppStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [stats, setStats] = useState<{ files: number; edges: number } | null>(
    null,
  );
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [graphData, setGraphData] = useState<{
    nodes: GraphNode[];
    edges: GraphEdge[];
  } | null>(null);
  const [hoveredExt, setHoveredExt] = useState<string | null>(null);

  const sigmaRef = useRef<unknown>(null);
  const highlightedNodes = new Set<string>();

  // Animated scan progress
  useEffect(() => {
    if (!isScanning) {
      setScanProgress(0);
      return;
    }
    setScanProgress(10);
    const t1 = setTimeout(() => setScanProgress(40), 400);
    const t2 = setTimeout(() => setScanProgress(70), 1200);
    const t3 = setTimeout(() => setScanProgress(90), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isScanning]);

  const killSigma = useCallback(() => {
    if (
      sigmaRef.current &&
      typeof (sigmaRef.current as { kill: () => void }).kill === "function"
    ) {
      (sigmaRef.current as { kill: () => void }).kill();
      sigmaRef.current = null;
    }
  }, []);

  const handleScan = async () => {
    if (!selectedRepoPath?.trim()) {
      showToast("Không có thư mục được chọn trong Workspace.", "error");
      return;
    }
    setIsScanning(true);
    setSelectedNode(null);
    killSigma();

    try {
      const result = await graphApi.scanLocal(selectedRepoPath.trim());
      if (!result?.success) {
        showToast(result?.error || "Quét thất bại.", "error");
        return;
      }
      setStats(result.stats || null);
      setGraphData({ nodes: result.nodes || [], edges: result.edges || [] });

      if ((result.nodes?.length ?? 0) === 0) {
        showToast("Không tìm thấy source files.", "info");
        return;
      }

      const [{ default: Graph }, { default: Sigma }, { default: forceAtlas2 }] =
        await Promise.all([
          import("graphology"),
          import("sigma"),
          import("graphology-layout-forceatlas2"),
        ]);

      const graph = new Graph({ multi: false, type: "directed" });

      for (const node of result.nodes || []) {
        graph.addNode(node.id, {
          ...node.attributes,
          // Slightly larger nodes, better colors
          size: Math.max(node.attributes.size, 1),
        });
      }
      for (const edge of result.edges || []) {
        if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
          graph.addEdgeWithKey(
            edge.id,
            edge.source,
            edge.target,
            edge.attributes,
          );
        }
      }

      // ForceAtlas2 with more iterations for better layout
      forceAtlas2.assign(graph, {
        iterations: 300,
        settings: {
          gravity: 0.3,
          scalingRatio: 8,
          strongGravityMode: true,
          slowDown: 8,
        },
      });

      if (!containerRef.current) return;

      containerRef.current.innerHTML = "";

      const renderer = new Sigma(graph, containerRef.current, {
        renderEdgeLabels: false,
        defaultEdgeColor: "#34d399",
        defaultEdgeType: "arrow",
        labelFont: "Montserrat, sans-serif",
        labelSize: 11,
        labelWeight: "500",
        labelColor: { color: "#374151" },
        nodeReducer: (node, data) => {
          const isHighlighted = highlightedNodes.has(node);

          if (highlightedNodes.size === 0) {
            return {
              ...data,
            };
          }

          return {
            ...data,
            color: isHighlighted ? data.color : "#d1d5db",
            label:
              highlightedNodes.size === 0
                ? ""
                : isHighlighted
                  ? data.label
                  : "",
            borderColor: "#fff",
            borderSize: isHighlighted ? 2 : 1,
            zIndex: isHighlighted ? 1 : 0,
          };
        },
        edgeReducer: (edge, data) => {
          const source = graph.source(edge);
          const target = graph.target(edge);

          const visible =
            highlightedNodes.size === 0 ||
            (highlightedNodes.has(source) && highlightedNodes.has(target));

          return {
            ...data,
            color: visible ? "#0000FF" : "rgba(0,0,0,0.03)",
            hidden: !visible,
          };
        },
      });

      renderer.on("clickNode", ({ node }) => {
        const attrs = graph.getNodeAttributes(node);
        const imports = graph.outNeighbors(node);
        const importedBy = graph.inNeighbors(node);
        setSelectedNode({
          id: node,
          label: attrs.label,
          ext: attrs.ext,
          imports,
          importedBy,
        });
      });

      renderer.on("clickStage", () => setSelectedNode(null));

      renderer.on("enterNode", ({ node }) => {
        highlightedNodes.clear();

        highlightedNodes.add(node);

        graph.inNeighbors(node).forEach((n: string) => {
          highlightedNodes.add(n);
        });

        graph.outNeighbors(node).forEach((n: string) => {
          highlightedNodes.add(n);
        });

        renderer.refresh();
      });

      renderer.on("leaveNode", () => {
        highlightedNodes.clear();
        renderer.refresh();
      });

      sigmaRef.current = renderer;
      setScanProgress(100);
      showToast(
        `Đã tải ${result.stats?.files} files, ${result.stats?.edges} edges`,
        "success",
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi không xác định";
      showToast(`Lỗi: ${msg}`, "error");
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return killSigma;
  }, [killSigma]);

  useEffect(() => {
    if (selectedRepoPath) handleScan();
  }, [selectedRepoPath]);

  const hasGraph = graphData && graphData.nodes.length > 0;

  const extLegend = [
    { ext: ".ts", color: EXT_COLORS[".ts"], label: "TypeScript" },
    { ext: ".tsx", color: EXT_COLORS[".tsx"], label: "React TSX" },
    { ext: ".cs", color: EXT_COLORS[".cs"], label: "C#" },
    { ext: ".js", color: EXT_COLORS[".js"], label: "JavaScript" },
    { ext: ".css", color: EXT_COLORS[".css"], label: "CSS" },
    { ext: ".json", color: EXT_COLORS[".json"], label: "JSON" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-slate-50">
      {/* ── Loading overlay ── */}
      {isScanning && (
        <div className="absolute inset-0 z-[200] bg-slate-50/95 backdrop-blur-md flex flex-col items-center justify-center gap-5">
          {/* Animated graph art */}
          <div className="relative w-[100px] h-[100px] text-indigo-500">
            <DatabaseIcon size={100} weight="duotone" className="text-indigo-500" />
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#1e293b",
                marginBottom: 4,
              }}
            >
              Đang xây dựng đồ thị...
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Phân tích dependency graph cho{" "}
              {selectedRepoPath?.split("\\").pop()}
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-[240px]">
            <div className="bg-slate-200 rounded-full h-1 overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out bg-gradient-to-r from-indigo-500 to-sky-500"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 text-center mt-1.5">
              {scanProgress < 40
                ? "Đọc file structure..."
                : scanProgress < 70
                  ? "Phân tích imports..."
                  : "Tính toán layout..."}
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Stats + Legend (bottom-left) ── */}
      {stats && !isScanning && (
        <div className="absolute bottom-5 left-5 z-[80] flex flex-col gap-2.5">
          {/* Stats badge */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex gap-4 items-center">
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-500 leading-none">
                {stats.files}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#94a3b8",
                  marginTop: 2,
                  fontWeight: 500,
                }}
              >
                FILES
              </div>
            </div>
            <div style={{ width: 1, height: 28, background: "#e2e8f0" }} />
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#0ea5e9",
                  lineHeight: 1,
                }}
              >
                {stats.edges}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#94a3b8",
                  marginTop: 2,
                  fontWeight: 500,
                }}
              >
                EDGES
              </div>
            </div>
            {/* Rescan button */}
            <div style={{ width: 1, height: 28, background: "#e2e8f0" }} />
            <button
              onClick={handleScan}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                padding: "2px 4px",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#6366f1")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
              title="Quét lại"
            >
              <ArrowsClockwise size={14} weight="bold" />
              Rescan
            </button>
          </div>

          {/* Legend */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex flex-col gap-1.5">
            <div className="text-[9px] font-bold text-slate-400 tracking-[0.8px] uppercase mb-0.5">
              LEGEND
            </div>
            {extLegend.map(({ ext, color, label }) => (
              <div
                key={ext}
                className={`flex items-center gap-1.5 cursor-default transition-opacity duration-150 ${hoveredExt && hoveredExt !== ext ? "opacity-45" : "opacity-100"}`}
                onMouseEnter={() => setHoveredExt(ext)}
                onMouseLeave={() => setHoveredExt(null)}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[11px] text-slate-600 font-[family-name:var(--font-mono)]">
                  {ext}
                </span>
                <span className="text-[10px] text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Hint tooltip (top-right) ── */}
      {hasGraph && !isScanning && (
        <div className="absolute top-5 right-5 z-[80] bg-white/85 backdrop-blur-md border border-slate-200 rounded-lg px-3.5 py-2 text-[11px] text-slate-500 shadow-[0_4px_16px_rgba(0,0,0,0.05)] flex items-center gap-1.5">
          <FileTextIcon size={16} weight="bold" />
          Click vào node để xem source code · Scroll để zoom · Kéo để di chuyển
        </div>
      )}

      {/* ── Main Canvas ── */}
      <div className="flex-1 relative overflow-hidden">
        <div ref={containerRef} className="w-full h-full" />

        {/* Empty state */}
        {!hasGraph && !isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-50">
            <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-blue-50 to-violet-50 border-2 border-slate-200 flex items-center justify-center">
              <DatabaseIcon size={52} weight="duotone" className="text-slate-300" />
            </div>
            <div className="text-center">
              <div className="text-[15px] font-semibold text-slate-800 mb-1">
                Dependency Graph
              </div>
              <div className="text-[13px] text-slate-500 max-w-[300px]">
                Mở một Workspace để tự động hiển thị đồ thị phụ thuộc giữa các files.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CodeViewer overlay ── */}
      {selectedNode && (
        <div className="absolute inset-0 z-[100]">
          <CodeViewer
            selectedNode={selectedNode}
            nodes={graphData?.nodes || []}
            edges={graphData?.edges || []}
            scanPath={selectedRepoPath || ""}
            onBack={() => setSelectedNode(null)}
            onSelectNode={(nodeId) => {
              const node = graphData?.nodes.find((n) => n.id === nodeId);
              if (node) {
                const imports =
                  graphData?.edges
                    .filter((e) => e.source === nodeId)
                    .map((e) => e.target) || [];
                const importedBy =
                  graphData?.edges
                    .filter((e) => e.target === nodeId)
                    .map((e) => e.source) || [];
                setSelectedNode({
                  id: nodeId,
                  label: node.attributes.label,
                  ext: node.attributes.ext,
                  imports,
                  importedBy,
                });
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SigmaCanvas;
