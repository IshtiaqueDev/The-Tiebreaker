import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Scale, 
  Plus, 
  Trash2, 
  Play, 
  Sparkles, 
  History, 
  HelpCircle, 
  ChevronRight, 
  Info, 
  RefreshCw, 
  Award, 
  LayoutGrid, 
  Flame, 
  PlusCircle, 
  X, 
  BookOpen, 
  ArrowRight
} from "lucide-react";

import { Decision, ProCon, DecisionAnalysis } from "./types";
import VerdictView from "./components/VerdictView";
import ProsConsView from "./components/ProsConsView";
import ComparisonView from "./components/ComparisonView";
import SWOTView from "./components/SWOTView";

const PRESETS = [
  {
    title: "Should I accept the Senior Developer offer at TechCorp?",
    context: "TechCorp pays 20% higher base salary and provides stock options. However, it requires a 45-minute daily commute and has a reputation for longer working hours. My current job is fully remote, has an outstanding and supportive culture, but salary growth has stalled.",
    options: ["Accept Senior Offer at TechCorp", "Decline and Stay at Current Job"]
  },
  {
    title: "Should we buy a Tesla Model Y or keep our reliable Toyota RAV4?",
    context: "We drive around 15,000 miles per year and have solar panels at home, meaning charging would be virtually free. However, the Model Y has high upfront costs and insurance, whereas our RAV4 is fully paid off, runs flawlessly, but gas prices are high.",
    options: ["Buy Tesla Model Y", "Keep Toyota RAV4 Gas SUV"]
  },
  {
    title: "Should we move from our Downtown Apartment to a Suburban House?",
    context: "We have a toddler and want more space, a backyard, and better schools. However, the suburbs are quiet, suburban homes have high interest rates now, and we would lose our walkable lifestyle, favorite coffee shops, and short commute to the office.",
    options: ["Move to Suburban House", "Stay in Downtown Apartment"]
  }
];

export default function App() {
  // Application State
  const [history, setHistory] = useState<Decision[]>([]);
  const [activeDecision, setActiveDecision] = useState<Decision | null>(null);
  
  // Intake Form State
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  
  // UI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"verdict" | "proscons" | "comparison" | "swot">("verdict");
  
  // Live custom weight adjustments for active analysis (ID -> Weight multiplier 1-5, default 3)
  const [customWeights, setCustomWeights] = useState<Record<string, number>>({});

  // Loading witty status text sequences
  const loadingMessages = [
    "Spinning up the rational decision engines...",
    "Evaluating risk curves & strategic boundaries...",
    "Synthesizing pros, cons, and weighted priorities...",
    "Drafting customized SWOT structures...",
    "Formulating the ultimate tiebreaker question..."
  ];

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tiebreaker_decisions");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load local storage decisions", e);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: Decision[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem("tiebreaker_decisions", JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save to local storage", e);
    }
  };

  // Intake options management
  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    const next = [...options];
    next.splice(index, 1);
    setOptions(next);
  };

  const handleOptionChange = (index: number, val: string) => {
    const next = [...options];
    next[index] = val;
    setOptions(next);
  };

  // Load preset helper
  const handleLoadPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.title);
    setContext(preset.context);
    setOptions([...preset.options]);
    setError(null);
  };

  // Submit to API
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please specify a decision question.");
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setLoadingStep(0);

    // Dynamic loading text increments
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingMessages.length - 1) return prev + 1;
        return prev;
      });
    }, 1200);

    // Clean options: remove blanks
    const cleanOptions = options.filter(opt => opt.trim() !== "");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          context: context.trim(),
          options: cleanOptions,
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }

      const data: DecisionAnalysis = await response.json();
      
      const newDecision: Decision = {
        id: "dec_" + Date.now(),
        title: title.trim(),
        context: context.trim(),
        options: cleanOptions,
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        analysis: data
      };

      const updatedHistory = [newDecision, ...history];
      saveHistory(updatedHistory);
      setActiveDecision(newDecision);
      setCustomWeights({}); // Reset overrides
      setActiveTab("verdict");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to conduct analysis. Please verify your connection or retry.");
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  // Custom weights manipulation
  const handleWeightChange = (id: string, weightVal: number) => {
    setCustomWeights(prev => ({
      ...prev,
      [id]: weightVal
    }));
  };

  // Delete factors
  const handleDeleteItem = (id: string) => {
    if (!activeDecision || !activeDecision.analysis) return;
    
    const updatedProsCons = activeDecision.analysis.prosCons.filter(item => item.id !== id);
    const updatedDecision: Decision = {
      ...activeDecision,
      analysis: {
        ...activeDecision.analysis,
        prosCons: updatedProsCons
      }
    };

    setActiveDecision(updatedDecision);
    const updatedHistory = history.map(d => d.id === activeDecision.id ? updatedDecision : d);
    saveHistory(updatedHistory);
  };

  // Add factor
  const handleAddItem = (newItem: Omit<ProCon, "id">) => {
    if (!activeDecision || !activeDecision.analysis) return;

    const itemWithId: ProCon = {
      ...newItem,
      id: "custom_" + Date.now(),
    };

    const updatedProsCons = [...activeDecision.analysis.prosCons, itemWithId];
    const updatedDecision: Decision = {
      ...activeDecision,
      analysis: {
        ...activeDecision.analysis,
        prosCons: updatedProsCons
      }
    };

    setActiveDecision(updatedDecision);
    const updatedHistory = history.map(d => d.id === activeDecision.id ? updatedDecision : d);
    saveHistory(updatedHistory);
  };

  const handleDeleteDecision = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(d => d.id !== id);
    saveHistory(updated);
    if (activeDecision?.id === id) {
      setActiveDecision(null);
    }
  };

  // Scoring engine helper
  const getBaseValue = (weight: "high" | "medium" | "low") => {
    switch (weight) {
      case "high": return 3;
      case "medium": return 2;
      case "low": return 1;
    }
  };

  const calculateDynamicScores = () => {
    if (!activeDecision || !activeDecision.analysis) return { netScore: 0, totalPros: 0, totalCons: 0 };
    
    let totalPros = 0;
    let totalCons = 0;

    activeDecision.analysis.prosCons.forEach((item) => {
      const baseVal = getBaseValue(item.weight);
      const customMultiplier = customWeights[item.id] || 3; // 1-5, 3 is standard
      const finalWeight = baseVal * (customMultiplier / 3);

      if (item.type === "pro") {
        totalPros += finalWeight;
      } else {
        totalCons += finalWeight;
      }
    });

    return {
      totalPros,
      totalCons,
      netScore: totalPros - totalCons
    };
  };

  const { netScore, totalPros, totalCons } = calculateDynamicScores();

  return (
    <div id="tiebreaker-root" className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-800">
      
      {/* Premium Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 sticky top-0 z-40 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-xs">
              <div className="w-4 h-1 bg-white rotate-45"></div>
              <div className="w-4 h-1 bg-white -rotate-45 -mt-1"></div>
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-900 font-display">The Tiebreaker</span>
              <span className="hidden sm:inline-block text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold ml-2">PROFESSIONAL EDITION</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest hidden md:block">
              Decision Analysis Platform
            </div>
            {activeDecision && (
              <button
                onClick={() => {
                  setActiveDecision(null);
                  setTitle("");
                  setContext("");
                  setOptions(["", ""]);
                }}
                className="text-xs font-semibold px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> New Decision
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto w-full px-4 py-6 md:py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT column (Intake OR History Sidebar) */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* Intake Intake Panel */}
          {!activeDecision && (
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6"
            >
              <div>
                <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Define Dilemma</h2>
                <h3 className="font-display font-bold text-slate-900 text-lg leading-snug">Let's Break the Tie</h3>
                <p className="text-xs text-slate-500 mt-1">Submit your options and details to start the multi-dimensional strategic grading.</p>
              </div>

              {/* Presets/Templates */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-indigo-500" />
                  <span>Choose a Sandbox Template</span>
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleLoadPreset(preset)}
                      className="text-left px-3 py-2.5 bg-slate-50 hover:bg-indigo-50/50 text-xs font-semibold text-slate-700 hover:text-indigo-900 rounded-lg border border-slate-200/60 hover:border-indigo-100 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <span className="truncate flex-1 pr-2">{preset.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-4 pt-2">
                {/* Decision statement */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Your Decision / Question <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Accept CTO offer at 'Veridian' vs. Principal Engineer at 'Meta'"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* Background Context */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Context & Constraints (Optional)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g., Provide details like salary differences, commuter stress, long term career goals, work culture..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* Options Compare (dynamic tags) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Specific Options to Compare
                    </label>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Option
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 w-5 text-center">#{idx + 1}</span>
                        <input
                          type="text"
                          placeholder={idx === 0 ? "Option A (e.g., Veridian)" : idx === 1 ? "Option B (e.g., Meta)" : `Option ${idx + 1}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="block text-[10px] text-slate-400 italic">Leave options blank to analyze as a direct Yes/No decision.</span>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-lg flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  <Sparkles className="w-4 h-4 text-white fill-white/20" />
                  <span>Execute AI Analysis</span>
                </button>
              </form>
            </motion.div>
          )}

          {/* History Sidebar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-400 text-xs uppercase tracking-widest flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-400" />
              <span>Decision History ({history.length})</span>
            </h3>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No previously saved decisions. They will show up here once analyzed.</p>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {history.map((dec) => (
                  <div
                    key={dec.id}
                    onClick={() => {
                      setActiveDecision(dec);
                      setCustomWeights({}); // Reset overrides
                      setActiveTab("verdict");
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer text-left flex items-start justify-between gap-2 group ${
                      activeDecision?.id === dec.id
                        ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <h4 className="text-xs font-bold leading-snug truncate">
                        {dec.title}
                      </h4>
                      <p className={`text-[9px] ${activeDecision?.id === dec.id ? "text-slate-300" : "text-slate-400"}`}>
                        {dec.createdAt}
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleDeleteDecision(dec.id, e)}
                      className={`p-1 rounded-md hover:bg-rose-50/20 text-slate-400 group-hover:opacity-100 hover:text-rose-500 cursor-pointer ${
                        activeDecision?.id === dec.id ? "opacity-40" : "opacity-0"
                      }`}
                      title="Delete decision"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </section>

        {/* RIGHT Column (Interactive Workspace or Loading State) */}
        <section className="lg:col-span-8">
          
          <AnimatePresence mode="wait">
            {/* 1. LOADING STATE */}
            {isAnalyzing && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl border border-slate-200 p-12 shadow-sm text-center min-h-[500px] flex flex-col items-center justify-center space-y-6"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  <Scale className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                
                <div className="space-y-2 max-w-sm">
                  <h3 className="font-display font-bold text-lg text-slate-900">Evaluating Choices</h3>
                  
                  {/* Cycling Loading Step */}
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingStep}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs text-indigo-600 font-medium italic h-8 flex items-center justify-center"
                    >
                      {loadingMessages[loadingStep]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* 2. INACTIVE STATE (Instructions) */}
            {!isAnalyzing && !activeDecision && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center min-h-[500px] flex flex-col items-center justify-center space-y-6"
              >
                <div className="p-4 bg-indigo-50 text-indigo-500 rounded-xl border border-indigo-100">
                  <Scale className="w-10 h-10" />
                </div>
                
                <div className="space-y-2 max-w-md">
                  <h3 className="font-display font-bold text-xl text-slate-900">No Active Decision Under Analysis</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Break analysis paralysis. Choose a template or enter your custom dilemma parameters in the left panel to execute a rigorous multi-criterion SWOT and comparison assessment.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg w-full pt-6 border-t border-slate-100 text-left">
                  <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                    <span className="block font-bold text-indigo-950 text-xs uppercase tracking-wider mb-1">1. Setup</span>
                    <span className="text-[10px] text-slate-500">Formulate dilemma and specify targets</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                    <span className="block font-bold text-indigo-950 text-xs uppercase tracking-wider mb-1">2. Calibrate</span>
                    <span className="text-[10px] text-slate-500">Fine-tune weights based on values</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                    <span className="block font-bold text-indigo-950 text-xs uppercase tracking-wider mb-1">3. Resolve</span>
                    <span className="text-[10px] text-slate-500">Synthesize deep SWOT & tiebreakers</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. ACTIVE DECISION WORKSPACE */}
            {!isAnalyzing && activeDecision && activeDecision.analysis && (
              <motion.div
                key="workspace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Active Question Bar */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Decision Under Review</span>
                    <h2 className="text-lg md:text-xl font-bold font-display tracking-tight text-slate-900">
                      {activeDecision.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setTitle(activeDecision.title);
                      setContext(activeDecision.context || "");
                      setOptions(activeDecision.options || ["", ""]);
                      setActiveDecision(null);
                    }}
                    className="text-xs font-semibold px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition cursor-pointer self-start md:self-auto shrink-0 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Redraft Options
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setActiveTab("verdict")}
                    className={`flex-1 py-3 text-xs md:text-sm font-semibold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "verdict"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>The Verdict</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("proscons")}
                    className={`flex-1 py-3 text-xs md:text-sm font-semibold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "proscons"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                    }`}
                  >
                    <Scale className="w-4 h-4" />
                    <span>Pros & Cons</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("comparison")}
                    className={`flex-1 py-3 text-xs md:text-sm font-semibold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "comparison"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Comparison Grid</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("swot")}
                    className={`flex-1 py-3 text-xs md:text-sm font-semibold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "swot"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>SWOT Analysis</span>
                  </button>
                </div>

                {/* Tab content renders */}
                <div className="mt-4">
                  {activeTab === "verdict" && (
                    <VerdictView 
                      analysis={activeDecision.analysis} 
                      netScore={netScore} 
                      totalPros={totalPros} 
                      totalCons={totalCons} 
                    />
                  )}

                  {activeTab === "proscons" && (
                    <ProsConsView
                      prosCons={activeDecision.analysis.prosCons}
                      customWeights={customWeights}
                      onWeightChange={handleWeightChange}
                      onAddItem={handleAddItem}
                      onDeleteItem={handleDeleteItem}
                    />
                  )}

                  {activeTab === "comparison" && (
                    <ComparisonView table={activeDecision.analysis.comparisonTable} />
                  )}

                  {activeTab === "swot" && (
                    <SWOTView swot={activeDecision.analysis.swotAnalysis} />
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </section>

      </main>

      {/* Humble footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-auto font-medium">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} The Tiebreaker. Strictly rational framework coaching.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-800 cursor-help flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Built for Google AI Studio
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
