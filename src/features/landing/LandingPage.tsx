import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChalkboardTeacher,
  Graph,
  GitBranch,
  Robot,
  Code,
  ArrowRight,
  CheckCircle,
  Star,
  Lightning,
  ShieldCheck,
  TreeStructure,
  Sparkle,
  GithubLogo,
  ArrowSquareOut,
  ChartBar,
  Cpu,
} from "@phosphor-icons/react";
import "./landing.css";

// ── Types ────────────────────────────────────────────────────────────────────

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  delay?: number;
}

interface StepProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isLast?: boolean;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, badge, delay = 0 }) => (
  <div
    className="landing-feature-card landing-fade-up bg-white border border-[var(--border-default)] rounded-2xl p-7 flex flex-col gap-4"
    style={{ animationDelay: `${delay}s`, boxShadow: "var(--shadow-card)" }}
  >
    <div className="flex items-center justify-between">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(11,61,145,0.08)" }}>
        {icon}
      </div>
      {badge && (
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: "rgba(249,115,22,0.1)", color: "var(--color-accent)" }}>
          {badge}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-[17px] font-bold text-[var(--text-primary)] mb-1.5 tracking-tight">{title}</h3>
      <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">{description}</p>
    </div>
  </div>
);

const Step: React.FC<StepProps> = ({ number, title, description, icon, isLast }) => (
  <div className="flex-1 flex flex-col items-center text-center relative">
    {/* Step number bubble */}
    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5 relative z-10"
      style={{ background: "var(--gradient-cta)", boxShadow: "0 4px 16px rgba(11,61,145,0.25)" }}>
      {icon}
    </div>
    {/* Connector — shown between steps */}
    {!isLast && <div className="landing-step-connector absolute top-7 left-[calc(50%+28px)] right-0" />}
    <div className="text-xs font-bold text-[var(--color-primary)] mb-1 tracking-widest uppercase opacity-60">
      Step {number}
    </div>
    <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-2 tracking-tight">{title}</h3>
    <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed max-w-[200px]">{description}</p>
  </div>
);

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800) {
  const [count, setCount] = React.useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// ── Stat item ─────────────────────────────────────────────────────────────────
const StatItem: React.FC<{ value: number; suffix: string; label: string }> = ({ value, suffix, label }) => {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="text-center">
      <div className="landing-stat-number text-[42px] font-extrabold tracking-tight leading-none">
        {count}{suffix}
      </div>
      <div className="text-[13px] text-[var(--text-secondary)] mt-1.5 font-medium">{label}</div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-white flex flex-col" style={{ fontFamily: "var(--font-main)" }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav className="landing-navbar fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group" id="landing-logo">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--gradient-cta)" }}>
              <Graph size={18} weight="fill" className="text-white" />
            </div>
            <span className="text-[16px] font-extrabold tracking-tight text-[var(--text-primary)]">
              Repo<span style={{ color: "var(--color-primary)" }}>Graph</span>
            </span>
          </a>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How it Works" },
              { href: "#about", label: "About" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/HuongDS/Repo_Into_Graph"
              target="_blank"
              rel="noopener noreferrer"
              id="landing-github-link"
              className="hidden md:flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <GithubLogo size={18} />
              GitHub
            </a>
            <button
              id="landing-open-app-btn"
              onClick={() => navigate("/login")}
              className="landing-btn-primary flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-[13px] font-semibold"
            >
              Open App
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-[100px] pb-20 px-6 md:px-12 overflow-hidden landing-dot-grid">
        {/* Background decorative blobs */}
        <div className="absolute top-[-80px] right-[-120px] w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: "var(--gradient-hero)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-[-80px] w-[360px] h-[360px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #0F5132, transparent)", filter: "blur(60px)" }} />

        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-14">

            {/* Left: Text content */}
            <div className="flex-1 flex flex-col items-start gap-6">
              {/* Badge */}
              <div className="landing-badge landing-fade-up flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100">
                <Sparkle size={14} weight="fill" style={{ color: "var(--color-primary)" }} />
                <span className="text-[12px] font-semibold text-[var(--color-primary)]">
                  AI-Powered Repository Analysis
                </span>
              </div>

              {/* Headline */}
              <h1 className="landing-fade-up landing-fade-up-1 text-[46px] md:text-[56px] font-extrabold tracking-tight leading-[1.1] text-[var(--text-primary)]">
                Transform Code into{" "}
                <span className="landing-gradient-text">Knowledge Graphs</span>
              </h1>

              {/* Sub-headline */}
              <p className="landing-fade-up landing-fade-up-2 text-[17px] text-[var(--text-secondary)] leading-relaxed max-w-[520px]">
                RepoGraph performs deep static analysis on GitHub repositories,
                maps source code into semantic graphs, and powers AI-driven
                grading — helping instructors assess student projects at scale.
              </p>

              {/* CTA buttons */}
              <div className="landing-fade-up landing-fade-up-3 flex flex-wrap items-center gap-3">
                <button
                  id="landing-hero-get-started"
                  onClick={() => navigate("/login")}
                  className="landing-btn-primary flex items-center gap-2 px-6 py-3 text-white rounded-xl text-[15px] font-semibold"
                >
                  Get Started
                  <ArrowRight size={16} weight="bold" />
                </button>
                <a
                  href="#how-it-works"
                  id="landing-hero-how-it-works"
                  className="landing-btn-secondary flex items-center gap-2 px-6 py-3 rounded-xl text-[15px] font-semibold text-[var(--text-primary)]"
                >
                  See how it works
                </a>
              </div>

              {/* Trust indicators */}
              <div className="landing-fade-up landing-fade-up-4 flex flex-wrap items-center gap-5 pt-2">
                {[
                  "Free to use",
                  "No account required",
                  "Works with any GitHub repo",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)]">
                    <CheckCircle size={15} weight="fill" style={{ color: "var(--color-secondary)" }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hero image */}
            <div className="flex-1 flex justify-center items-center landing-fade-up landing-fade-up-2">
              <div className="landing-hero-float relative">
                <div className="rounded-2xl overflow-hidden landing-browser-mockup border border-[var(--border-default)]">
                  {/* Browser chrome */}
                  <div className="h-9 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-white border border-[var(--border-default)] rounded-md px-3 py-1 text-[11px] text-[var(--text-muted)] font-mono max-w-[280px] mx-auto">
                        localhost:5173/workspace/EVCare
                      </div>
                    </div>
                  </div>
                  {/* Screenshot */}
                  <img
                    src="/hero-graph.png"
                    alt="RepoGraph knowledge graph visualization showing code structure"
                    className="w-full max-w-[560px] block"
                    style={{ objectFit: "cover", maxHeight: 360 }}
                  />
                </div>
                {/* Floating badge overlay */}
                <div className="absolute -bottom-4 -left-6 bg-white rounded-xl px-4 py-3 shadow-lg border border-[var(--border-default)] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(15,81,50,0.1)" }}>
                    <TreeStructure size={18} weight="duotone" style={{ color: "var(--color-secondary)" }} />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-[var(--text-primary)]">Graph Built</div>
                    <div className="text-[11px] text-[var(--text-muted)]">2,847 nodes · 5,123 edges</div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-6 bg-white rounded-xl px-4 py-3 shadow-lg border border-[var(--border-default)] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(249,115,22,0.1)" }}>
                    <Robot size={18} weight="duotone" style={{ color: "var(--color-accent)" }} />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-[var(--text-primary)]">AI Score</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Coverage: 94.2%</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 landing-hero-band pointer-events-none" />
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section id="about" className="py-16 px-6 md:px-12 border-y border-[var(--border-default)] bg-[var(--bg-subtle)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value={10000} suffix="+" label="Lines of Code Analyzed" />
            <StatItem value={200} suffix="+" label="Repositories Processed" />
            <StatItem value={94} suffix="%" label="Grading Accuracy" />
            <StatItem value={12} suffix="x" label="Faster Than Manual Review" />
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <span className="landing-section-badge mb-4 inline-flex">
              <Lightning size={13} weight="fill" />
              Capabilities
            </span>
            <h2 className="text-[36px] md:text-[42px] font-extrabold tracking-tight text-[var(--text-primary)] mt-3">
              Everything you need to grade repos
            </h2>
            <p className="text-[16px] text-[var(--text-secondary)] mt-3 max-w-[560px] mx-auto">
              From raw source code to rich knowledge graphs in minutes.
              Built for educators, researchers, and engineering teams.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Code size={24} weight="duotone" style={{ color: "var(--color-primary)" }} />}
              title="Static Code Analysis"
              description="Parses C# repositories using Roslyn — extracting classes, methods, call graphs, and dependency relationships automatically."
              delay={0.1}
            />
            <FeatureCard
              icon={<Graph size={24} weight="duotone" style={{ color: "var(--color-primary)" }} />}
              title="Knowledge Graph"
              description="Builds an interactive graph where every node is a code entity and every edge is a relationship. Navigate your codebase visually."
              badge="Interactive"
              delay={0.2}
            />
            <FeatureCard
              icon={<Robot size={24} weight="duotone" style={{ color: "var(--color-primary)" }} />}
              title="AI-Powered Grading"
              description="Uses Gemini to automatically assess student implementations against feature requirements with semantic accuracy scoring."
              badge="Gemini"
              delay={0.3}
            />
            <FeatureCard
              icon={<GitBranch size={24} weight="duotone" style={{ color: "var(--color-primary)" }} />}
              title="GitHub Integration"
              description="Clone and analyze any public GitHub repository by URL. Supports branches, tags, and multi-module projects."
              delay={0.4}
            />
            <FeatureCard
              icon={<ChartBar size={24} weight="duotone" style={{ color: "var(--color-primary)" }} />}
              title="Coverage & Accuracy Reports"
              description="Get detailed coverage metrics: how many features are implemented, with per-feature semantic similarity scores."
              delay={0.5}
            />
            <FeatureCard
              icon={<Cpu size={24} weight="duotone" style={{ color: "var(--color-primary)" }} />}
              title="Few-Shot Learning"
              description="Customize the AI grader with your own example Q&A pairs, teaching it domain-specific patterns for more accurate scoring."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-6 md:px-12 bg-[var(--bg-subtle)] landing-dot-grid">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <span className="landing-section-badge mb-4 inline-flex">
              <ChalkboardTeacher size={13} weight="fill" />
              Workflow
            </span>
            <h2 className="text-[36px] md:text-[42px] font-extrabold tracking-tight text-[var(--text-primary)] mt-3">
              How RepoGraph works
            </h2>
            <p className="text-[16px] text-[var(--text-secondary)] mt-3">
              Three steps from repo URL to graded assessment.
            </p>
          </div>

          {/* Steps */}
          <div className="flex flex-col md:flex-row items-start gap-10 md:gap-6 relative">
            <Step
              number="1"
              title="Submit a Repository"
              description="Paste a GitHub repo URL. RepoGraph clones it and runs static analysis in the background."
              icon={<GitBranch size={24} weight="bold" className="text-white" />}
            />
            <div className="landing-step-connector" />
            <Step
              number="2"
              title="Build the Graph"
              description="Source code is parsed with Roslyn. Classes, methods, and relationships become nodes and edges."
              icon={<Graph size={24} weight="bold" className="text-white" />}
            />
            <div className="landing-step-connector" />
            <Step
              number="3"
              title="Grade with AI"
              description="Gemini evaluates each feature against the graph, producing a semantic coverage and accuracy score."
              icon={<Robot size={24} weight="bold" className="text-white" />}
              isLast
            />
          </div>

          {/* Code snippet */}
          <div className="mt-16 bg-white rounded-2xl border border-[var(--border-default)] overflow-hidden"
            style={{ boxShadow: "var(--shadow-card)" }}>
            {/* Tab bar */}
            <div className="flex items-center gap-1 px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-subtle)]">
              <div className="flex gap-1.5 mr-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              {["Analysis Output", "Graph JSON", "Score Report"].map((tab, i) => (
                <button key={tab}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                    i === 0
                      ? "bg-white text-[var(--color-primary)] border border-[var(--border-default)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
            {/* Code content */}
            <div className="p-6 font-mono text-[13px] leading-[1.8] overflow-x-auto">
              <pre className="text-[var(--text-secondary)]">{`{
  `}<span className="text-[var(--color-primary)] font-semibold">"repository"</span>{`: `}<span className="text-[var(--color-secondary)]">"EVCare_BackEnd"</span>{`,
  `}<span className="text-[var(--color-primary)] font-semibold">"globalNodeCount"</span>{`: `}<span className="text-[var(--color-accent)]">2847</span>{`,
  `}<span className="text-[var(--color-primary)] font-semibold">"features"</span>{`: [
    {
      `}<span className="text-[var(--color-primary)] font-semibold">"name"</span>{`: `}<span className="text-[var(--color-secondary)]">"User Authentication"</span>{`,
      `}<span className="text-[var(--color-primary)] font-semibold">"coverage"</span>{`: `}<span className="text-[var(--color-accent)]">0.94</span>{`,
      `}<span className="text-[var(--color-primary)] font-semibold">"accuracy"</span>{`: `}<span className="text-[var(--color-accent)]">0.91</span>{`,
      `}<span className="text-[var(--color-primary)] font-semibold">"status"</span>{`: `}<span className="text-[var(--color-secondary)]">"IMPLEMENTED"</span>{`
    }
  ]
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST / TECH STACK ─────────────────────────────────────────────── */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10">
            <p className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
              Built with industry-grade technologies
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            {[
              { name: "ASP.NET Core", icon: "⚙️" },
              { name: "Roslyn", icon: "🔍" },
              { name: "Google Gemini", icon: "🤖" },
              { name: "PostgreSQL", icon: "🐘" },
              { name: "React + Vite", icon: "⚡" },
              { name: "Sigma.js", icon: "🕸️" },
            ].map(({ name, icon }) => (
              <div key={name} className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl">
                <span className="text-lg">{icon}</span>
                <span className="text-[13px] font-semibold text-[var(--text-secondary)]">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 mx-6 md:mx-12 mb-16 rounded-3xl overflow-hidden relative"
        style={{ background: "var(--gradient-cta)" }}>
        {/* Decorative blur circle */}
        <div className="absolute right-[-60px] top-[-60px] w-[300px] h-[300px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #F97316, transparent)" }} />

        <div className="max-w-[700px] mx-auto text-center relative z-10">
          <div className="flex justify-center mb-5">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15">
              <ShieldCheck size={15} weight="fill" className="text-white" />
              <span className="text-[12px] font-semibold text-white/90">Open source · Free to use</span>
            </div>
          </div>
          <h2 className="text-[36px] md:text-[42px] font-extrabold text-white tracking-tight leading-tight mb-4">
            Ready to analyze your first repository?
          </h2>
          <p className="text-white/75 text-[16px] mb-8 leading-relaxed">
            Connect to your local RepoGraph backend and start exploring code graphs in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="landing-cta-get-started"
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-7 py-3.5 bg-white text-[var(--color-primary)] rounded-xl text-[15px] font-bold shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all"
            >
              Get Started Free
              <ArrowRight size={16} weight="bold" />
            </button>
            <a
              href="https://github.com/HuongDS/Repo_Into_Graph"
              target="_blank"
              rel="noopener noreferrer"
              id="landing-cta-github"
              className="flex items-center gap-2 px-7 py-3.5 border border-white/30 text-white rounded-xl text-[15px] font-semibold hover:bg-white/10 transition-colors"
            >
              <GithubLogo size={18} />
              View on GitHub
              <ArrowSquareOut size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="landing-footer border-t border-[var(--border-default)] py-10 px-6 md:px-12 mt-auto">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: "var(--gradient-cta)" }}>
                <Graph size={15} weight="fill" className="text-white" />
              </div>
              <span className="text-[15px] font-bold text-[var(--text-primary)]">
                Repo<span style={{ color: "var(--color-primary)" }}>Graph</span>
              </span>
              <span className="text-[var(--text-muted)] text-[13px] ml-2">
                — Automated Code Analysis Tool
              </span>
            </div>
            {/* Links */}
            <div className="flex items-center gap-6">
              <a href="#features" className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">Features</a>
              <a href="#how-it-works" className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">How it Works</a>
              <a href="https://github.com/HuongDS/Repo_Into_Graph" target="_blank" rel="noopener noreferrer"
                className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex items-center gap-1">
                <GithubLogo size={14} />GitHub
              </a>
            </div>
            {/* Copyright */}
            <div className="text-[12px] text-[var(--text-muted)]">
              © 2026 RepoGraph · FPT University Research
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
