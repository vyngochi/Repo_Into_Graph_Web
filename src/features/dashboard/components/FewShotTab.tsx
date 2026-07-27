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
      <div className="bg-white border border-slate-200 rounded-[var(--radius-md)] shadow-sm px-6 py-5 flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">Quản lý ngân hàng câu hỏi mẫu</h2>
          <p className="text-[13px] text-slate-500 mt-1">
            Định nghĩa các câu hỏi và câu trả lời chất lượng cao để hướng dẫn AI sinh câu hỏi chính xác hơn.
          </p>
        </div>
        <button
          className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium rounded-md transition-colors flex items-center"
          onClick={() => showForm ? resetForm() : setShowForm(true)}
        >
          {showForm ? "Đóng biểu mẫu" : "+ Thêm câu hỏi mẫu"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-[var(--radius-md)] shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4">
            {editingId ? "Chỉnh sửa câu hỏi mẫu" : "Tạo câu hỏi mẫu mới"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nội dung câu hỏi mẫu</label>
              <textarea 
                className="w-full px-4 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-[var(--color-primary)] min-h-[80px]" 
                placeholder="Nhập câu hỏi mẫu giảng viên biên soạn..."
                value={form.question} onChange={(e) => setForm({...form, question: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Đáp án gợi ý tương ứng</label>
              <textarea 
                className="w-full px-4 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-[var(--color-primary)] min-h-[100px]" 
                placeholder="Nhập đáp án gợi ý chi tiết làm tiêu chuẩn..."
                value={form.suggestedAnswer} onChange={(e) => setForm({...form, suggestedAnswer: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Mức độ khó</label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-[var(--color-primary)] bg-white" value={form.difficulty} onChange={(e) => setForm({...form, difficulty: e.target.value})}>
                <option value="Easy">Dễ (Easy)</option>
                <option value="Medium">Trung bình (Medium)</option>
                <option value="Hard">Khó (Hard)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Nhãn (Tag) - Tùy chọn</label>
              <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-[var(--color-primary)]" placeholder="Ví dụ: validation, business-rule..." value={form.tag} onChange={(e) => setForm({...form, tag: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Ghi chú thêm - Tùy chọn</label>
              <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-[var(--color-primary)]" placeholder="Mục đích câu hỏi hoặc lưu ý đặc biệt..." value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50" onClick={resetForm}>Hủy</button>
            <button 
              className="px-6 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-md hover:bg-[var(--color-primary-hover)] flex items-center"
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
      <div className="bg-white border border-slate-200 rounded-[var(--radius-md)] shadow-sm px-6 py-5 flex-1 min-h-[400px]">
        <h2 className="text-[15px] font-semibold text-slate-900 mb-4">Danh sách câu hỏi hiện tại</h2>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <SpinnerGap size={32} className="animate-spin mb-4 text-blue-500" />
            <span>Đang tải danh sách câu hỏi mẫu...</span>
          </div>
        ) : fewShots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Database size={48} weight="duotone" className="text-slate-300 mb-4" />
            <div className="text-sm font-semibold text-slate-700">Chưa có câu hỏi mẫu nào</div>
            <div className="text-sm text-slate-500 mt-1 max-w-sm">Nhấn nút "Thêm câu hỏi mẫu" ở góc trên bên phải để tạo câu hỏi mẫu đầu tiên.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {fewShots.map((shot) => (
              <div key={shot.id} className="p-4 border border-slate-200 bg-slate-50 rounded-lg flex flex-col gap-3 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800 break-words mb-1">Hỏi: {shot.question}</h4>
                    <div className="text-[13px] text-slate-600 break-words whitespace-pre-wrap">Đáp án: {shot.suggestedAnswer}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs font-semibold border border-slate-300 bg-white text-slate-600 rounded hover:bg-slate-100" onClick={() => handleEdit(shot)}>Sửa</button>
                    <button className="px-3 py-1 text-xs font-semibold border border-red-200 bg-red-50 text-red-600 rounded hover:bg-red-100 hover:border-red-300" onClick={() => handleDelete(shot.id)}>Xóa</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-medium items-center">
                  <span className={`px-2 py-0.5 rounded border ${shot.difficulty === 'Easy' ? 'bg-green-50 border-green-200 text-green-700' : shot.difficulty === 'Hard' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                    {shot.difficulty || "Medium"}
                  </span>
                  {shot.tag && <span className="px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700">#{shot.tag}</span>}
                  {shot.description && <span className="text-slate-400 max-w-[300px] truncate">{shot.description}</span>}
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
