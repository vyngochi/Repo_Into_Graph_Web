import { MagnifyingGlass, Question, Database, SpinnerGap } from "@phosphor-icons/react";
import React, { useState, useEffect } from "react";
import { useAppStore } from "../../../store/useAppStore";
import { BusinessFlow } from "../../business-flow/types";
import { useAnalysisRuns } from "../../dashboard/hooks/useDashboardQueries";
import { useBusinessFlows } from "../../business-flow/hooks/useBusinessQueries";
import { useFewShots } from "../hooks/useQuizQueries";
import { quizApi } from "../services/quizApi";

const QuizGeneratorView = () => {
  const { serverUrl, showToast } = useAppStore();
  
  const [selectedRunId, setSelectedRunId] = useState<string>("");
  const [selectedFlow, setSelectedFlow] = useState<BusinessFlow | null>(null);
  
  const { data: analysisRuns = [] } = useAnalysisRuns();
  useEffect(() => {
    if (analysisRuns.length > 0 && !selectedRunId) setSelectedRunId(analysisRuns[0].id);
  }, [analysisRuns, selectedRunId]);

  const { data: businessFlows = [], isLoading: isLoadingFlows } = useBusinessFlows(selectedRunId);
  const { data: fewShots = [], isLoading: isLoadingFewShots } = useFewShots();

  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [additionalContext, setAdditionalContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);

  const [selectedFewShots, setSelectedFewShots] = useState<string[]>([]);
  const [fewShotSearch, setFewShotSearch] = useState("");

  const filteredFewShots = fewShots.filter((shot: any) => {
    const qText = shot.question || shot.Question || "";
    const tagText = shot.tag || shot.Tag || "";
    const term = fewShotSearch.toLowerCase();
    return qText.toLowerCase().includes(term) || tagText.toLowerCase().includes(term);
  });

  const handleGenerate = async () => {
    if (!selectedFlow) {
      showToast("Vui lòng chọn một Business Flow.", "error");
      return;
    }
    setIsLoading(true);
    setGeneratedQuestions([]);
    try {
      const res = await quizApi.generateQuestions({
        businessId: selectedFlow.id,
        numberOfQuestions: numQuestions,
        difficulty,
        description: additionalContext || null,
        fewShotExampleIds: selectedFewShots.length > 0 ? selectedFewShots : null,
      });

      const questions = Array.isArray(res)
        ? res
        : res?.generatedQuestionDtos ||
          res?.GeneratedQuestionDtos ||
          res?.questions || [];

      setGeneratedQuestions(questions || []);
      setAssessmentResults(null);
      showToast(`Đã tạo ${(questions || []).length} câu hỏi!`, "success");
    } catch {
      showToast("Lỗi kết nối đến server.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssessQuality = async () => {
    if (!selectedFlow || generatedQuestions.length === 0) return;
    setIsAssessing(true);
    setAssessmentResults(null);
    try {
      const payload = {
        businessId: selectedFlow.id,
        businessName: selectedFlow.businessName,
        generatedQuestionDtos: generatedQuestions.map((q) => ({
          question: q.question || q.Question || "",
          suggestedAnswer: q.suggestedAnswer || q.SuggestedAnswer || "",
          difficulty: q.difficulty || q.Difficulty || "",
        })),
      };

      const coverageRes = await quizApi.assessCoverage(payload);
      const accuracyRes = await quizApi.assessAccuracy(payload);
      const difficultyRes = await quizApi.assessDifficulty(payload);

      setAssessmentResults({
        coverage: coverageRes,
        accuracy: accuracyRes,
        difficulty: difficultyRes,
      });
      showToast("Đã hoàn thành đánh giá chất lượng!", "success");
    } catch (err) {
      showToast("Lỗi khi đánh giá chất lượng.", "error");
    } finally {
      setIsAssessing(false);
    }
  };

  const difficultyLabel: Record<string, string> = { Easy: "Dễ", Medium: "Trung bình", Hard: "Khó" };

  return (
    <div className="p-8 h-full bg-[var(--bg-base)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1400px] mx-auto h-full">
        {/* Left: Form */}
        <div className="lg:col-span-5 flex flex-col gap-6 overflow-y-auto pr-2 pb-6">
          <div className="app-card p-6 flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Question size={20} weight="fill" />
                </div>
                <div className="text-[16px] font-bold text-[var(--text-primary)] tracking-tight">Tạo câu hỏi tự động</div>
              </div>
              <p className="text-[13px] text-[var(--text-secondary)]">Dùng AI sinh câu hỏi từ Business Flow</p>
            </div>

            <div>
              <label className="app-label">Lần phân tích (Analysis Run)</label>
              <select
                className="app-input"
                value={selectedRunId}
                onChange={(e) => setSelectedRunId(e.target.value)}
              >
                {analysisRuns.map((run: any) => (
                  <option key={run.id} value={run.id}>
                    {new Date(run.createdAt).toLocaleString("vi-VN")} - {run.repositoryPath?.split(/[/\\]/).pop()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="app-label">Business Flow</label>
              {isLoadingFlows ? (
                <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] py-2">
                  <SpinnerGap size={16} className="animate-spin text-[var(--color-primary)]" /> Đang tải danh sách...
                </div>
              ) : (
                <select
                  className="app-input"
                  value={selectedFlow?.id || ""}
                  onChange={(e) => setSelectedFlow(businessFlows.find((f) => f.id === e.target.value) || null)}
                >
                  <option value="">-- Chọn Business Flow --</option>
                  {businessFlows.map((flow) => (
                    <option key={flow.id} value={flow.id}>{flow.businessName}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="app-label">Độ khó mong muốn</label>
              <div className="flex gap-2">
                {(["Easy", "Medium", "Hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all border ${
                      difficulty === d
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {difficultyLabel[d]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="app-label">Số lượng câu hỏi</label>
              <input
                type="number"
                className="app-input"
                min={1} max={20}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="app-label mb-0">Câu hỏi mẫu (Few-Shot)</label>
                {selectedFewShots.length > 0 && <span className="text-[11px] font-bold text-[var(--color-primary)]">Đã chọn {selectedFewShots.length}</span>}
              </div>
              <div className="relative mb-3">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} weight="bold" />
                <input
                  type="text"
                  className="app-input pl-8"
                  placeholder="Tìm câu hỏi hoặc tag..."
                  value={fewShotSearch}
                  onChange={(e) => setFewShotSearch(e.target.value)}
                />
              </div>
              <div className="max-h-[200px] overflow-y-auto flex flex-col gap-2 pr-1">
                {isLoadingFewShots ? (
                  <div className="text-center text-xs text-slate-500 py-4"><SpinnerGap size={14} className="animate-spin inline mr-2" />Đang tải...</div>
                ) : filteredFewShots.length === 0 ? (
                  <div className="text-center text-xs text-slate-500 py-4 italic border border-dashed border-slate-200 rounded">Không có mẫu nào</div>
                ) : (
                  filteredFewShots.map((shot: any) => {
                    const id = shot.id || shot.Id;
                    const isChecked = selectedFewShots.includes(id);
                    return (
                      <div
                        key={id}
                        className={`flex items-start gap-3 p-3 rounded-md cursor-pointer border transition-colors ${
                          isChecked ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:border-blue-100'
                        }`}
                        onClick={() => setSelectedFewShots(isChecked ? selectedFewShots.filter(x => x !== id) : [...selectedFewShots, id])}
                      >
                        <input type="checkbox" checked={isChecked} readOnly className="mt-1 accent-blue-600" />
                        <div className="flex flex-col gap-1">
                          <span className={`text-[12px] leading-snug line-clamp-2 ${isChecked ? 'text-blue-900 font-semibold' : 'text-slate-700'}`}>
                            {shot.question || shot.Question}
                          </span>
                          {(shot.tag || shot.Tag) && (
                            <span className="text-[10px] text-slate-400 font-medium">#{shot.tag || shot.Tag}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <label className="app-label">Ngữ cảnh bổ sung <span className="lowercase font-normal opacity-70">(tùy chọn)</span></label>
              <textarea
                className="app-input min-h-[80px]"
                placeholder="Thêm hướng dẫn, văn phong hoặc yêu cầu đặc biệt..."
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
              />
            </div>

            <button
              className="app-btn-primary w-full py-3 mt-4 text-[14px]"
              onClick={handleGenerate}
              disabled={isLoading || !selectedFlow}
            >
              {isLoading ? <SpinnerGap size={18} className="animate-spin mr-2" /> : null}
              {isLoading ? "Đang tạo câu hỏi..." : "Tạo câu hỏi"}
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
          {!isLoading && generatedQuestions.length === 0 && (
            <div className="app-card flex flex-col items-center justify-center h-full app-empty-state p-8">
              <Database size={64} weight="duotone" className="text-[var(--text-muted)] mb-4" />
              <div className="text-[16px] font-bold text-[var(--text-secondary)] mb-2">Chưa có câu hỏi nào được sinh ra</div>
              <div className="text-[13px] text-[var(--text-muted)] max-w-sm mt-2">
                Chọn Business Flow và thiết lập tham số ở cột trái, sau đó nhấn <strong>Tạo câu hỏi</strong> để bắt đầu sinh.
              </div>
            </div>
          )}

          {isLoading && (
            <div className="app-card flex flex-col items-center justify-center h-full">
              <SpinnerGap size={40} className="animate-spin text-[var(--color-primary)] mb-4" />
              <span className="text-[15px] font-medium text-[var(--text-secondary)]">Đang sinh câu hỏi từ AI...</span>
            </div>
          )}

          {!isLoading && generatedQuestions.length > 0 && (
            <div className="flex flex-col h-full overflow-hidden app-card p-0">
              <div className="p-5 border-b border-[var(--border-default)] flex justify-between items-center bg-[var(--bg-subtle)]">
                <h3 className="text-base font-bold text-[var(--text-primary)] m-0">Danh sách câu hỏi sinh ra ({generatedQuestions.length})</h3>
                <button
                  className="app-btn-secondary px-4 py-2 disabled:opacity-50"
                  onClick={handleAssessQuality}
                  disabled={isAssessing}
                >
                  {isAssessing ? <SpinnerGap size={14} className="animate-spin text-slate-900" /> : <Database size={14} />}
                  Đánh giá chất lượng
                </button>
              </div>

              {assessmentResults && (
                <div className="grid grid-cols-3 gap-4 p-5 border-b border-slate-100 bg-blue-50/30">
                  {assessmentResults.coverage && (
                    <div className="flex flex-col">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Độ bao phủ</div>
                      <div className="text-xl font-bold text-blue-600">{(assessmentResults.coverage.averageTotalCoverage * 100).toFixed(1)}%</div>
                      <div className="text-[10px] text-slate-500 mt-1">Node WF: {assessmentResults.coverage.workflowNodeCount} | Global: {assessmentResults.coverage.globalNodeCount}</div>
                    </div>
                  )}
                  {assessmentResults.accuracy && (
                    <div className="flex flex-col border-l border-slate-200 pl-4">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Độ chính xác</div>
                      <div className="text-base font-bold text-slate-800 mt-1">
                        {assessmentResults.accuracy.questionResults?.filter((r: any) => r.accuracyResult?.isAccurate).length} / {assessmentResults.accuracy.questionResults?.length} câu đúng
                      </div>
                    </div>
                  )}
                  {assessmentResults.difficulty && (
                    <div className="flex flex-col border-l border-slate-200 pl-4">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Độ khó</div>
                      <div className="text-base font-bold text-slate-800 mt-1">{assessmentResults.difficulty.averageDifficultyScore?.toFixed(1)} / 10</div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-5">
                <div className="flex flex-col gap-6">
                  {generatedQuestions.map((q, idx) => (
                    <div key={idx} className="flex flex-col bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-slate-100/50 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-[13px] font-bold text-slate-700">Câu {idx + 1}</span>
                        <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          {q.difficulty || q.Difficulty || "N/A"}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col gap-4">
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Câu hỏi</div>
                          <div className="text-[14px] font-medium text-slate-900 whitespace-pre-wrap">{q.question || q.Question}</div>
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gợi ý trả lời</div>
                          <div className="text-[13px] text-slate-600 whitespace-pre-wrap p-3 bg-white border border-slate-100 rounded-md">{q.suggestedAnswer || q.SuggestedAnswer}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizGeneratorView;
