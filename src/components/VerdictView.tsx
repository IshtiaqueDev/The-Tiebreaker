import React from "react";
import { motion } from "motion/react";
import { Award, HelpCircle, ArrowRight, Zap, RefreshCw, FileDown, Share2 } from "lucide-react";
import { DecisionAnalysis } from "../types";

interface VerdictViewProps {
  analysis: DecisionAnalysis;
  netScore: number;
  totalPros: number;
  totalCons: number;
}

export default function VerdictView({ analysis, netScore, totalPros, totalCons }: VerdictViewProps) {
  const { verdict, tiebreakerFactor } = analysis;

  // Calculate percentage balance
  const scoreDiff = totalPros + totalCons > 0 
    ? ((totalPros - totalCons) / (totalPros + totalCons)) * 100 
    : 0;
  
  // Normalize to 0-100 where 50 is center
  const balancePercentage = Math.max(5, Math.min(95, 50 + scoreDiff / 2));

  let balanceText = "Balanced Decision";
  let balanceColor = "text-slate-500 bg-slate-50 border-slate-200";
  if (scoreDiff > 35) {
    balanceText = "Pros strongly outweigh Cons";
    balanceColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  } else if (scoreDiff > 5) {
    balanceText = "Pros slightly outweigh Cons";
    balanceColor = "text-indigo-700 bg-indigo-50 border-indigo-200";
  } else if (scoreDiff < -35) {
    balanceText = "Cons strongly outweigh Pros";
    balanceColor = "text-rose-700 bg-rose-50 border-rose-200";
  } else if (scoreDiff < -5) {
    balanceText = "Cons slightly outweigh Pros";
    balanceColor = "text-amber-700 bg-amber-50 border-amber-200";
  } else {
    balanceText = "Even Split / Delicate Equilibrium";
    balanceColor = "text-indigo-600 bg-indigo-50/50 border-indigo-100";
  }

  // Calculate a mock normalized score out of 10 based on the balance percentage for thematic display
  const thematicScore = (5 + (scoreDiff / 20)).toFixed(1);

  return (
    <div id="verdict-container" className="space-y-6">
      {/* Primary Verdict Hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-stretch justify-between gap-6">
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-indigo-600 text-white flex items-center gap-1 shadow-sm">
                  <Award className="w-3.5 h-3.5" />
                  Tiebreaker Verdict
                </span>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${balanceColor}`}>
                  {balanceText}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold font-display text-slate-900 tracking-tight leading-snug">
                {verdict.title}
              </h2>

              <div className="flex items-center gap-2 bg-indigo-50/80 border border-indigo-100/50 rounded-lg p-3 text-indigo-900 font-semibold text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4 text-indigo-600 shrink-0 fill-indigo-100" />
                <span>Recommendation: <strong className="text-indigo-950 underline decoration-indigo-600/30 font-bold">{verdict.recommendation}</strong></span>
              </div>

              <p className="text-slate-600 leading-relaxed text-sm">
                {verdict.reasoning}
              </p>
            </div>
          </div>

          {/* Tiebreaker Score block inspired by professional design html */}
          <div className="flex flex-col justify-center p-5 bg-indigo-50/50 rounded-xl border border-indigo-100/80 shrink-0 w-full md:w-56">
            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1.5">Tiebreaker Score</div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold text-indigo-900 font-display">{thematicScore}</span>
              <span className="text-sm text-indigo-500 pb-1.5 font-medium">/ 10</span>
            </div>
            <p className="text-[11px] text-indigo-700/90 mt-2 leading-relaxed">
              Confidence score calculated at <strong className="text-indigo-900">{verdict.confidenceScore}%</strong> based on logical criteria weight values.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Dynamic Weight Balance Slider */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <span>⚖️ Dynamic Weighted Balance</span>
          </h3>
          <span className="text-xs text-indigo-600 font-semibold">Tweak factor multipliers in "Pros & Cons"</span>
        </div>

        {/* Custom progress slider scale */}
        <div className="relative mt-6 mb-4">
          <div className="h-3 bg-slate-100 rounded-full w-full flex overflow-hidden">
            <div className="h-full bg-rose-500/80" style={{ width: "50%" }} />
            <div className="h-full bg-emerald-500/80" style={{ width: "50%" }} />
          </div>
          
          {/* Centered Deadlock Notch */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-5 bg-slate-900 rounded-full border border-white z-10" />

          {/* User Score Indicator Pin */}
          <motion.div
            className="absolute top-1/2 transform -translate-y-1/2 -ml-2.5 z-20 flex flex-col items-center"
            animate={{ left: `${balancePercentage}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
          >
            <div className="w-5 h-5 bg-indigo-600 rounded-full border-2 border-white shadow-md flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </motion.div>
        </div>

        <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-400 font-bold px-1">
          <span className="text-rose-600">Cons Heavily Favored</span>
          <span className="text-slate-400">Deadlock Center</span>
          <span className="text-emerald-600">Pros Heavily Favored</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-emerald-50/30 rounded-lg border border-emerald-100/50 text-center">
            <span className="block text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Pros Weighted Sum</span>
            <span className="text-2xl font-bold text-emerald-800">{totalPros.toFixed(1)}</span>
          </div>
          <div className="p-3 bg-rose-50/30 rounded-lg border border-rose-100/50 text-center">
            <span className="block text-[10px] font-bold uppercase text-rose-700 tracking-wider">Cons Weighted Sum</span>
            <span className="text-2xl font-bold text-rose-800">{totalCons.toFixed(1)}</span>
          </div>
        </div>
      </motion.div>

      {/* Golden Pivot - Interactive Recommendation Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-slate-900 text-slate-100 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-md"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <div className="w-64 h-64 border-4 border-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 h-full flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">AI RECOMMENDATION & PERSPECTIVE</h3>
            <p className="text-white text-lg md:text-xl font-light leading-relaxed max-w-2xl">
              “While other aspects present trade-offs, the core decision centers on <span className="text-indigo-400 font-medium">{tiebreakerFactor.question}</span>. {tiebreakerFactor.insight}”
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileDown className="w-3.5 h-3.5" />
              Export Decision PDF
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard! Share this analysis with your stakeholders.");
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share with Stakeholders
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
