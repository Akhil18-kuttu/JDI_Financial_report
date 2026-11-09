"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/utils/formatters";
import {
  calculateFutureGoalCost,
  calculateRequiredMonthlySIP,
} from "@/lib/utils/calculations";

const QUICK_GOAL_BUTTONS = [
  { category: "Education", label: "Higher Education", defaultName: "Child's Education", defaultCost: 1500000, inflation: 8, expReturn: 12 },
  { category: "Marriage", label: "Marriage", defaultName: "Child's Marriage", defaultCost: 1500000, inflation: 7, expReturn: 11 },
  { category: "House", label: "Home Purchase", defaultName: "House Downpayment", defaultCost: 2000000, inflation: 6, expReturn: 10 },
  { category: "Retirement", label: "Retirement", defaultName: "Retirement Fund", defaultCost: 25000000, inflation: 6, expReturn: 12 },
  { category: "Vehicle", label: "Car / Vehicle", defaultName: "New Car Purchase", defaultCost: 1000000, inflation: 5, expReturn: 9 },
  { category: "Vacation", label: "Vacation", defaultName: "Family Holiday", defaultCost: 500000, inflation: 6, expReturn: 9 },
  { category: "Emergency Fund", label: "Emergency Fund", defaultName: "Emergency Reserve", defaultCost: 300000, inflation: 5, expReturn: 7 },
  { category: "Other", label: "Custom Goal", defaultName: "Wealth Creation", defaultCost: 1000000, inflation: 6, expReturn: 12 },
];

export default function StepGoals({
  goals = [],
  onAddGoalWithPreset,
  onRemoveGoal,
  onUpdateGoal,
  errors,
}) {
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Financial Goals</h2>
        <p className="text-sm text-slate-500 mt-1">
          Click below to add your major life milestones (education, home, retirement, etc.).
        </p>
      </div>

      {/* Quick Add Goal Buttons */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Click to add a goal:
        </label>
        <div className="flex flex-wrap gap-2">
          {QUICK_GOAL_BUTTONS.map((btn) => (
            <button
              key={btn.category}
              type="button"
              onClick={() => onAddGoalWithPreset(btn)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium border border-slate-300 hover:border-blue-300 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {errors?.goals && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
          {errors.goals.message || "Please add at least one financial goal."}
        </div>
      )}

      {/* Goals List (Page Type) */}
      {goals.length === 0 ? (
        <div className="text-center py-8 px-4 border border-slate-200 rounded-xl bg-slate-50/60">
          <p className="text-sm text-slate-600 mb-2">No goals added yet.</p>
          <p className="text-xs text-slate-400">
            Use the buttons above to select and customize your financial goals.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, index) => {
            const currentCost = Number(goal.currentCost || 0);
            const years = Number(goal.yearsRemaining || 0);
            const inflation = Number(goal.inflationRate ?? 6);
            const expReturn = Number(goal.expectedReturn ?? 12);
            const allocated = Number(goal.allocatedInvestment || 0);

            const futureCost = calculateFutureGoalCost(currentCost, years, inflation);
            const requiredSIP = calculateRequiredMonthlySIP(futureCost, years, expReturn, allocated);

            return (
              <div
                key={goal.id || index}
                className="p-4 bg-white border border-slate-200 rounded-lg space-y-3"
              >
                {/* Goal Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {goal.category}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      Goal #{index + 1}: {goal.goalName || "Untitled"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveGoal(index)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Remove goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  {/* Goal Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Goal Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Master's in Computer Science"
                      value={goal.goalName || ""}
                      onChange={(e) => onUpdateGoal(index, "goalName", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Beneficiary */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Beneficiary
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Self / Child"
                      value={goal.beneficiary || ""}
                      onChange={(e) => onUpdateGoal(index, "beneficiary", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Priority
                    </label>
                    <select
                      value={goal.priority || "High"}
                      onChange={(e) => onUpdateGoal(index, "priority", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  {/* Current Cost */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Current Cost in Today's ₹
                    </label>
                    <div className="relative flex rounded-md border border-slate-300 overflow-hidden focus-within:border-blue-500">
                      <span className="inline-flex items-center px-2.5 bg-slate-50 text-slate-500 text-xs font-semibold border-r border-slate-300">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="10000"
                        placeholder="e.g. 2000000"
                        value={goal.currentCost ?? ""}
                        onChange={(e) => onUpdateGoal(index, "currentCost", e.target.value)}
                        className="w-full px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Target Year */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Target Year
                    </label>
                    <input
                      type="number"
                      min={currentYear}
                      max={currentYear + 45}
                      placeholder={String(currentYear + 5)}
                      value={goal.targetYear ?? ""}
                      onChange={(e) => {
                        const yr = parseInt(e.target.value, 10);
                        onUpdateGoal(index, "targetYear", yr);
                        if (!isNaN(yr)) {
                          onUpdateGoal(index, "yearsRemaining", Math.max(0, yr - currentYear));
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Inflation & Expected Return */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Inflation Assumed (% p.a.)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="25"
                      value={goal.inflationRate ?? 6}
                      onChange={(e) => onUpdateGoal(index, "inflationRate", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Expected Return (% p.a.)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="30"
                      value={goal.expectedReturn ?? 12}
                      onChange={(e) => onUpdateGoal(index, "expectedReturn", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Simple Live Projection Result */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
                  <span>
                    Years remaining: <strong className="text-slate-700">{years} years</strong>
                  </span>
                  <div className="flex items-center gap-4">
                    <span>
                      Inflated Cost: <strong className="text-slate-900">{formatINR(futureCost)}</strong>
                    </span>
                    <span>
                      Required Monthly SIP:{" "}
                      <strong className="text-blue-700">{formatINR(requiredSIP)} / mo</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
