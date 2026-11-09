"use client";

import React from "react";
import { formatINR } from "@/lib/utils/formatters";
import {
  calculateTotalMonthlyExpenses,
  calculateTotalMonthlyIncome,
  calculateSurplus,
} from "@/lib/utils/calculations";

const EXPENSE_FIELDS = [
  { key: "household", label: "Household & Groceries", placeholder: "e.g. 25000", desc: "Food, groceries, utilities, bills" },
  { key: "rent", label: "House Rent", placeholder: "e.g. 20000", desc: "Monthly rent (if not living in own home)" },
  { key: "education", label: "Education & Children", placeholder: "e.g. 15000", desc: "School/college fees, coaching" },
  { key: "medical", label: "Medical & Healthcare", placeholder: "e.g. 5000", desc: "Medicines, regular healthcare" },
  { key: "loanEMI", label: "Loan EMIs", placeholder: "e.g. 30000", desc: "Total monthly loan installments" },
  { key: "insurance", label: "Insurance Premiums", placeholder: "e.g. 4000", desc: "Life & health monthly equivalent" },
  { key: "travel", label: "Travel & Fuel", placeholder: "e.g. 6000", desc: "Fuel, commute, vacations" },
  { key: "other", label: "Lifestyle & Discretionary", placeholder: "e.g. 8000", desc: "Dining out, shopping, entertainment" },
];

export default function StepExpenses({ register, watch, incomes = [], errors }) {
  const expenseValues = watch("expenses") || {};
  const totalMonthlyIncome = calculateTotalMonthlyIncome(incomes);
  const totalMonthlyExpenses = calculateTotalMonthlyExpenses(expenseValues);
  const monthlySurplus = calculateSurplus(totalMonthlyIncome, totalMonthlyExpenses);

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Monthly Expenses</h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter your average monthly living expenses. Your estimated surplus is calculated automatically.
        </p>
      </div>

      {/* Expense Inputs Grid (Clean Page Type) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {EXPENSE_FIELDS.map((item) => {
          const fieldError = errors?.expenses?.[item.key];
          return (
            <div key={item.key} className="p-3 bg-white border border-slate-200 rounded-lg">
              <label className="block text-sm font-medium text-slate-800 mb-0.5">
                {item.label}
              </label>
              <span className="block text-xs text-slate-400 mb-2">{item.desc}</span>
              <div className="relative flex rounded-md border border-slate-300 overflow-hidden focus-within:border-blue-500">
                <span className="inline-flex items-center px-2.5 bg-slate-50 text-slate-500 text-xs font-semibold border-r border-slate-300">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  placeholder={item.placeholder}
                  {...register(`expenses.${item.key}`)}
                  className="w-full px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              {fieldError && (
                <p className="text-xs text-rose-600 mt-1">{fieldError.message}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Clean Calculation Summary Strip */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-xs text-slate-500 block">Total Monthly Income</span>
            <span className="font-semibold text-slate-800">{formatINR(totalMonthlyIncome)}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Total Monthly Expenses</span>
            <span className="font-semibold text-slate-800">{formatINR(totalMonthlyExpenses)}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Estimated Monthly Surplus</span>
            <span
              className={`font-bold text-base ${
                monthlySurplus >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {formatINR(monthlySurplus)}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500 border-t border-slate-200 pt-2">
          Surplus = Income − Expenses. This amount represents your available capacity for savings and investments.
        </p>
      </div>
    </div>
  );
}
