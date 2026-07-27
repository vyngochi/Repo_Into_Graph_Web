import { ChalkboardTeacher, SpinnerGap } from "@phosphor-icons/react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../../store/useAppStore";
import { useCheckHealth } from "../hooks/useCheckHealth";

const Login = () => {
  const navigate = useNavigate();
  const { serverUrl, setServerUrl } = useAppStore();
  const [inputUrl, setInputUrl] = useState(serverUrl);
  
  const checkHealthMutation = useCheckHealth();

  const handleLogin = () => {
    setServerUrl(inputUrl.trim() || serverUrl);
    navigate("/dashboard");
  };

  const handleTestConnection = () => {
    checkHealthMutation.mutate(inputUrl.trim() || serverUrl);
  };

  return (
    <div className="flex items-center justify-center w-full h-full bg-[var(--bg-base)]">
      <div className="w-[400px] bg-white rounded-2xl border border-[var(--border-default)] shadow-md p-8">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-[var(--radius-sm)] bg-[#0B3D9114] flex items-center justify-center flex-shrink-0">
            <ChalkboardTeacher size={24} weight="duotone" className="text-[var(--color-primary)]" />
          </div>
          <div>
            <div className="text-[18px] font-bold text-[var(--text-primary)] tracking-tight font-sans">
              RepoGraph
            </div>
            <div className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
              Automated Grading Tool
            </div>
          </div>
        </div>

        {/* Server URL Input */}
        <div className="mb-6">
          <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-2 tracking-wide uppercase">
            Địa chỉ Backend Server
          </label>
          <input
            type="text"
            className="w-full px-4 py-2.5 bg-[var(--surface-muted)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-[var(--text-primary)] font-mono text-[13px] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[#0B3D9114]"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="http://localhost:55061"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
            Địa chỉ API backend (ASP.NET Core)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-2">
          <button 
            className="flex items-center justify-center w-full py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-[var(--radius-sm)] font-sans font-semibold text-[14px] transition-all hover:-translate-y-[1px] shadow-sm active:translate-y-0"
            onClick={handleLogin}
          >
            Đăng nhập
          </button>
          <button
            className="flex items-center justify-center w-full py-2.5 bg-transparent border border-[var(--color-secondary)] text-[var(--color-secondary)] hover:bg-[#0F513110] rounded-[var(--radius-sm)] font-sans font-medium text-[13px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleTestConnection}
            disabled={checkHealthMutation.isPending}
          >
            {checkHealthMutation.isPending ? (
              <SpinnerGap className="animate-spin mr-2" size={16} weight="bold" />
            ) : null}
            {checkHealthMutation.isPending ? "Đang kiểm tra..." : "Kiểm tra kết nối"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
