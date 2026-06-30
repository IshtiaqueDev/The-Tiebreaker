import React from "react";
import { motion } from "motion/react";
import { SWOTAnalysis } from "../types";
import { Flame, ShieldAlert, Sparkles, AlertTriangle, Lightbulb } from "lucide-react";

interface SWOTViewProps {
  swot: SWOTAnalysis;
}

export default function SWOTView({ swot }: SWOTViewProps) {
  if (!swot) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <Lightbulb className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Strategic Matrix</h2>
            <h3 className="font-display font-bold text-slate-900 text-base leading-tight">SWOT Analysis</h3>
          </div>
        </div>

        {/* 2x2 Grid Layout from Theme Mockup */}
        <div className="grid grid-cols-2 gap-3">
          {/* STRENGTHS */}
          <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/50">
            <div className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Strengths</div>
            <ul className="space-y-1.5">
              {swot.strengths.map((s, idx) => (
                <li key={idx} className="text-[11px] leading-snug text-emerald-800 flex items-start gap-1">
                  <span className="text-emerald-600 font-bold shrink-0">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* WEAKNESSES */}
          <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">
            <div className="text-[10px] font-bold text-amber-700 uppercase mb-1">Weaknesses</div>
            <ul className="space-y-1.5">
              {swot.weaknesses.map((w, idx) => (
                <li key={idx} className="text-[11px] leading-snug text-amber-800 flex items-start gap-1">
                  <span className="text-amber-600 font-bold shrink-0">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* OPPORTUNITIES */}
          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
            <div className="text-[10px] font-bold text-blue-700 uppercase mb-1">Opportunities</div>
            <ul className="space-y-1.5">
              {swot.opportunities.map((o, idx) => (
                <li key={idx} className="text-[11px] leading-snug text-blue-800 flex items-start gap-1">
                  <span className="text-blue-600 font-bold shrink-0">•</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* THREATS */}
          <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-100/50">
            <div className="text-[10px] font-bold text-rose-700 uppercase mb-1">Threats</div>
            <ul className="space-y-1.5">
              {swot.threats.map((t, idx) => (
                <li key={idx} className="text-[11px] leading-snug text-rose-800 flex items-start gap-1">
                  <span className="text-rose-600 font-bold shrink-0">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
