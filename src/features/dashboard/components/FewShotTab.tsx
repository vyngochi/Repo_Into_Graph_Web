import React, { useState } from "react";
import { Database, SpinnerGap } from "@phosphor-icons/react";
import { useFewShots, useCreateFewShot, useUpdateFewShot, useDeleteFewShot } from "../hooks/useDashboardQueries";
import { FewShot } from "../types";

const FewShotTab = () => {
  const { data: fewShots = [], isLoading } = useFewShots();
  const createMutation = useCreateFewShot();
  const updateMutation = useUpdateFewShot();
  const deleteMutation = useDeleteFewShot();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    question: "",
    suggestedAnswer: "",
    difficulty: "Medium",
    tag: "",
    description: "",
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ question: "", suggestedAnswer: "", difficulty: "Medium", tag: "", description: "" });
  };

  const handleSave = () => {
    if (!form.question.trim() || !form.suggestedAnswer.trim()) return;
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: form }, { onSuccess: resetForm });
    } else {
      createMutation.mutate(form, { onSuccess: resetForm });
    }
  };

  const handleEdit = (shot: FewShot) => {
    setEditingId(shot.id);
    setForm({
      question: shot.question || "",
      suggestedAnswer: shot.suggestedAnswer || "",
      difficulty: shot.difficulty || "Medium",
      tag: shot.tag || "",
      description: shot.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa câu hỏi mẫu này?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header card with add button */}
      <div className="app-card px-6 py-5 flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Quản lý ngân hàng câu hỏi mẫu</h2>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            Định nghĩa các câu hỏi và câu trả lời chất lượng cao để hướng dẫn AI sinh câu hỏi chính xác hơn.
          </p>
        </div>
        <button
          className="app-btn-primary"
          onClick={() => showForm ? resetForm() : setShowForm(true)}
        >
          {showForm ? "Đóng biểu mẫu" : "+ Thêm câu hỏi mẫu"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="app-card p-6">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">
            {editingId ? "Chỉnh sửa câu hỏi mẫu" : "Tạo câu hỏi mẫu mới"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="app-label">Nội dung câu hỏi mẫu</label>
              <textarea 
                className="app-input min-h-[80px]" 
                placeholder="Nhập câu hỏi mẫu giảng viên biên soạn..."
                value={form.question} onChange={(e) => setForm({...form, question: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <label className="app-label">Đáp án gợi ý tương ứng</label>
              <textarea 
                className="app-input min-h-[100px]" 
                placeholder="Nhập đáp án gợi ý chi tiết làm tiêu chuẩn..."
                value={form.suggestedAnswer} onChange={(e) => setForm({...form, suggestedAnswer: e.target.value})}
              />
            </div>
            <div>
              <label className="app-label">Mức độ khó</label>
              <select className="app-input bg-white" value={form.difficulty} onChange={(e) => setForm({...form, difficulty: e.target.value})}>
                <option value="Easy">Dễ (Easy)</option>
                <option value="Medium">Trung bình (Medium)</option>
                <option value="Hard">Khó (Hard)</option>
              </select>
            </div>
            <div>
              <label className="app-label">Nhãn (Tag) - Tùy chọn</label>
              <input type="text" className="app-input" placeholder="Ví dụ: validation, business-rule..." value={form.tag} onChange={(e) => setForm({...form, tag: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="app-label">Ghi chú thêm - Tùy chọn</label>
              <input type="text" className="app-input" placeholder="Mục đích câu hỏi hoặc lưu ý đặc biệt..." value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button className="app-btn-secondary" onClick={resetForm}>Hủy</button>
            <button 
              className="app-btn-primary"
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && <SpinnerGap className="animate-spin mr-2" />}
              {editingId ? "Cập nhật" : "Lưu lại"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="app-card px-6 py-5 flex-1 min-h-[400px]">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">Danh sách câu hỏi hiện tại</h2>
        
        {isLoading ? (
          <div className="app-empty-state py-12">
            <SpinnerGap size={32} className="animate-spin mb-4 text-[var(--color-primary)]" />
            <span>Đang tải danh sách câu hỏi mẫu...</span>
          </div>
        ) : fewShots.length === 0 ? (
          <div className="app-empty-state py-12">
            <Database size={48} weight="duotone" className="text-[var(--text-muted)] mb-4" />
            <div className="text-sm font-semibold text-[var(--text-secondary)]">Chưa có câu hỏi mẫu nào</div>
            <div className="text-sm text-[var(--text-muted)] mt-1 max-w-sm">Nhấn nút "Thêm câu hỏi mẫu" ở góc trên bên phải để tạo câu hỏi mẫu đầu tiên.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {fewShots.map((shot) => (
              <div key={shot.id} className="p-4 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[var(--radius-md)] flex flex-col gap-3 hover:border-[#cbd5e1] transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] break-words mb-1">Hỏi: {shot.question}</h4>
                    <div className="text-[13px] text-[var(--text-secondary)] break-words whitespace-pre-wrap">Đáp án: {shot.suggestedAnswer}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="app-btn-secondary px-3 py-1" onClick={() => handleEdit(shot)}>Sửa</button>
                    <button className="app-btn-danger px-3 py-1" onClick={() => handleDelete(shot.id)}>Xóa</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-medium items-center">
                  <span className={`app-badge ${shot.difficulty === 'Easy' ? 'app-badge-success' : shot.difficulty === 'Hard' ? 'app-badge-error' : 'app-badge-warning'}`}>
                    {shot.difficulty || "Medium"}
                  </span>
                  {shot.tag && <span className="app-badge app-badge-info">#{shot.tag}</span>}
                  {shot.description && <span className="text-[var(--text-muted)] max-w-[300px] truncate">{shot.description}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FewShotTab;
