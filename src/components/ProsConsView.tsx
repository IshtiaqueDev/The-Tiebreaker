import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Filter, AlertCircle, PlusCircle, CheckCircle, Scale } from "lucide-react";
import { ProCon } from "../types";

interface ProsConsViewProps {
  prosCons: ProCon[];
  customWeights: Record<string, number>;
  onWeightChange: (id: string, weight: number) => void;
  onAddItem: (item: Omit<ProCon, "id">) => void;
  onDeleteItem: (id: string) => void;
}

export default function ProsConsView({
  prosCons,
  customWeights,
  onWeightChange,
  onAddItem,
  onDeleteItem,
}: ProsConsViewProps) {
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [newText, setNewText] = useState("");
  const [newType, setNewType] = useState<"pro" | "con">("pro");
  const [newWeight, setNewWeight] = useState<"high" | "medium" | "low">("medium");
  const [newCategory, setNewCategory] = useState("Personal");

  // Get unique list of categories for filter dropdown
  const categories = ["All", ...Array.from(new Set(prosCons.map((item) => item.category)))];

  // Filter items
  const filteredItems = filterCategory === "All"
    ? prosCons
    : prosCons.filter((item) => item.category === filterCategory);

  const pros = filteredItems.filter((item) => item.type === "pro");
  const cons = filteredItems.filter((item) => item.type === "con");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    onAddItem({
      text: newText.trim(),
      type: newType,
      weight: newWeight,
      category: newCategory,
    });

    setNewText("");
  };

  const getWeightMultiplier = (base: "high" | "medium" | "low") => {
    switch (base) {
      case "high": return 3;
      case "medium": return 2;
      case "low": return 1;
    }
  };

  return (
    <div id="pros-cons-interactive-workspace" className="space-y-6">
      {/* Category Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold uppercase text-slate-400 tracking-widest">Filter by Category:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                filterCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Pros and Cons columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PROS Column */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <div className="text-xs font-semibold text-emerald-600 px-2.5 py-0.5 bg-emerald-50 rounded-lg">Pros</div>
            <h3 className="font-display font-bold text-slate-900 text-base flex-1">Positive Drivers</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-md">
              {pros.length} factors
            </span>
          </div>

          {pros.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Scale className="w-8 h-8 mb-2 stroke-[1.5]" />
              <p className="text-xs">No pros matching current filter</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
              <AnimatePresence initial={false}>
                {pros.map((item) => {
                  const baseVal = getWeightMultiplier(item.weight);
                  const customVal = customWeights[item.id] || 3; // 1 to 5, default is 3

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="group bg-slate-50/50 border border-slate-200 hover:border-indigo-100 rounded-lg p-4 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-indigo-50 border border-indigo-100/30 text-indigo-700 rounded-md">
                              {item.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Priority: <span className="font-bold uppercase text-slate-500">{item.weight}</span>
                            </span>
                          </div>
                          <p className="text-slate-800 text-sm leading-snug font-medium">
                            {item.text}
                          </p>
                        </div>

                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 cursor-pointer"
                          title="Delete factor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Weight Adjuster Slider */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <span>Value Multiplier:</span>
                          <span className="px-1.5 py-0.5 bg-indigo-50 rounded-md font-bold text-indigo-700 text-[10px]">
                            {customVal === 3 ? "Standard" : customVal > 3 ? "Critical" : "Secondary"} (x{customVal})
                          </span>
                        </span>
                        
                        {/* Selector stars/dots */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              onClick={() => onWeightChange(item.id, val)}
                              className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                                customVal === val
                                  ? "bg-indigo-600 text-white scale-110 shadow-sm"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-500"
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* CONS Column */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <div className="text-xs font-semibold text-rose-600 px-2.5 py-0.5 bg-rose-50 rounded-lg">Cons</div>
            <h3 className="font-display font-bold text-slate-900 text-base flex-1">Risks & Trade-offs</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-md">
              {cons.length} factors
            </span>
          </div>

          {cons.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Scale className="w-8 h-8 mb-2 stroke-[1.5]" />
              <p className="text-xs">No cons matching current filter</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
              <AnimatePresence initial={false}>
                {cons.map((item) => {
                  const baseVal = getWeightMultiplier(item.weight);
                  const customVal = customWeights[item.id] || 3; // 1 to 5, default is 3

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="group bg-slate-50/50 border border-slate-200 hover:border-indigo-100 rounded-lg p-4 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-indigo-50 border border-indigo-100/30 text-indigo-700 rounded-md">
                              {item.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Priority: <span className="font-bold uppercase text-slate-500">{item.weight}</span>
                            </span>
                          </div>
                          <p className="text-slate-800 text-sm leading-snug font-medium">
                            {item.text}
                          </p>
                        </div>

                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 cursor-pointer"
                          title="Delete factor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Weight Adjuster Slider */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <span>Value Multiplier:</span>
                          <span className="px-1.5 py-0.5 bg-indigo-50 rounded-md font-bold text-indigo-700 text-[10px]">
                            {customVal === 3 ? "Standard" : customVal > 3 ? "Critical" : "Secondary"} (x{customVal})
                          </span>
                        </span>
                        
                        {/* Selector stars/dots */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              onClick={() => onWeightChange(item.id, val)}
                              className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                                customVal === val
                                  ? "bg-indigo-600 text-white scale-110 shadow-sm"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-500"
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>

      {/* Manual Pro/Con Contributor form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-1.5">
          <PlusCircle className="w-4 h-4 text-indigo-500" />
          <span>Add Custom Factor Override</span>
        </h4>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Factor Description</label>
            <input
              type="text"
              required
              placeholder="e.g., Higher equity potential (targeted $2M+ exit value)"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800"
            >
              <option value="Financial">Financial</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Career">Career</option>
              <option value="Health & Wellness">Health & Wellness</option>
              <option value="Relationships">Relationships</option>
              <option value="Personal Growth">Personal Growth</option>
              <option value="Risk & Security">Risk & Security</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Type</label>
              <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setNewType("pro")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-all ${
                    newType === "pro"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Pro
                </button>
                <button
                  type="button"
                  onClick={() => setNewType("con")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-all ${
                    newType === "con"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Con
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition cursor-pointer flex items-center justify-center gap-1 shrink-0 h-[38px] shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Factor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
