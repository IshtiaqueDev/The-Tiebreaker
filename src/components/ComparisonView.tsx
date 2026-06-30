import React from "react";
import { motion } from "motion/react";
import { LayoutGrid, Scale, Sparkles } from "lucide-react";
import { ComparisonTable } from "../types";

interface ComparisonViewProps {
  table: ComparisonTable;
}

export default function ComparisonView({ table }: ComparisonViewProps) {
  if (!table || !table.headers || table.headers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        <p>No comparison data available for this analysis.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <LayoutGrid className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Grid View</h2>
            <h3 className="font-display font-bold text-slate-900 text-base leading-tight">Comparison Table</h3>
          </div>
        </div>

        {/* Responsive Table Wrap */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-xs">
            <thead className="text-slate-400 font-medium">
              <tr className="border-b border-slate-200">
                {table.headers.map((header, index) => (
                  <th
                    key={index}
                    className={`pb-3 font-medium text-left ${
                      index === 0 ? "w-1/4" : "text-slate-900 font-semibold"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {index > 0 && <Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                      <span>{header}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-slate-600 divide-y divide-slate-100/50">
              {table.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors duration-150"
                >
                  <td className="py-3 font-semibold text-slate-900">
                    {row.aspect}
                  </td>
                  {row.values.map((value, colIndex) => (
                    <td key={colIndex} className="py-3 text-slate-600">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight Banner */}
      <div className="bg-indigo-50/50 border border-indigo-100/40 rounded-xl p-4 flex gap-3 text-indigo-900 text-xs">
        <Scale className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Evaluation Method:</span> Scan the metrics row-by-row to identify which options align best with your specific high-multiplier relevance categories.
        </div>
      </div>
    </motion.div>
  );
}
