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
      <header className="app-page-header">
        <div>
          <h1 className="app-page-title">
            {currentTab === "repos"
              ? "Quản lý Repository"
              : "Ngân hàng câu hỏi mẫu (Few-Shot)"}
          </h1>
          <p className="app-page-subtitle">
            {currentTab === "repos"
              ? "Phân tích static code và theo dõi lịch sử chạy"
              : "Quản lý danh sách câu hỏi và câu trả lời mẫu cho AI"}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-full text-xs text-[var(--text-secondary)] font-mono transition-colors hover:border-[#cbd5e1] hover:text-[var(--text-primary)]">
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
