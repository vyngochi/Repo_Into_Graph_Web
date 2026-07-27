import React from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle } from "@phosphor-icons/react";
import { useAppStore } from "../../../store/useAppStore";
import ReposTab from "./ReposTab";
import FewShotTab from "./FewShotTab";

const Dashboard = () => {
  const location = useLocation();
  const { serverUrl } = useAppStore();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "repos";

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)]">
      {/* Top bar */}
      <header className="h-[64px] px-8 flex items-center justify-between border-b border-slate-200 bg-white flex-shrink-0">
        <div>
          <h1 className="text-[17px] font-bold text-slate-900 tracking-tight font-sans">
            {currentTab === "repos"
              ? "Quản lý Repository"
              : "Ngân hàng câu hỏi mẫu (Few-Shot)"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentTab === "repos"
              ? "Phân tích static code và theo dõi lịch sử chạy"
              : "Quản lý danh sách câu hỏi và câu trả lời mẫu cho AI"}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 font-mono transition-colors hover:border-slate-300 hover:text-slate-800">
            <CheckCircle size={12} weight="fill" className="text-green-500" />
            {serverUrl}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-8 relative">
        <div className="max-w-[1280px] mx-auto w-full h-full flex flex-col">
          {currentTab === "repos" ? <ReposTab /> : <FewShotTab />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
