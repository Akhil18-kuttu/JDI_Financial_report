"use client";

import React from "react";
import {
  Check,
  AlertCircle,
  Edit3,
  User,
  Users,
  IndianRupee,
  CreditCard,
  Landmark,
  Scale,
  LineChart,
  Target,
  Palmtree,
  Shield,
  FileText,
} from "lucide-react";
import { formatINR, formatDate } from "@/lib/utils/formatters";
import {
  calculateTotalMonthlyIncome,
  calculateTotalMonthlyExpenses,
  calculateSurplus,
  calculateTotalAssets,
  calculateTotalLiabilities,
  calculateNetWorth,
  calculateFutureGoalCost,
  calculateRequiredMonthlySIP,
} from "@/lib/utils/calculations";

export default function StepReview({
  formData,
  onJumpToStep,
  register,
  errors,
  isSubmitting = false,
}) {
  const d = formData || {};

  // Financial Metrics
  const totalMonthlyIncome = calculateTotalMonthlyIncome(d.incomes);
  const totalMonthlyExpenses = calculateTotalMonthlyExpenses(d.expenses);
  const monthlySurplus = calculateSurplus(totalMonthlyIncome, totalMonthlyExpenses);
  const totalAssets = calculateTotalAssets(d.assets);
  const totalLiabilities = calculateTotalLiabilities(d.liabilities);
  const netWorth = calculateNetWorth(totalAssets, totalLiabilities);

  // Collect any validation errors from previous steps for clear user guidance
  const previousStepErrors = [];
  if (
    errors.fullName ||
    errors.dob ||
    errors.age ||
    errors.gender ||
    errors.mobile ||
    errors.email ||
    errors.address ||
    errors.city ||
    errors.state ||
    errors.occupation
  ) {
    previousStepErrors.push({
      step: 1,
      name: "Personal Information",
      msg: "Full Name, Mobile, Email, and Location are required.",
    });
  }
  if (errors.retirementAge || errors.lifeExpectancy) {
    previousStepErrors.push({
      step: 9,
      name: "Retirement & Pension",
      msg:
        errors.retirementAge?.message ||
        errors.lifeExpectancy?.message ||
        "Check retirement age values.",
    });
  }

  return (
    <div className="space-y-6">
      {/* Title & Guidance */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
          <Check className="w-3.5 h-3.5" />
          <span>Step 11 of 11 • Review Before Submission</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Review Your Financial Information
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Please carefully inspect all 10 sections of your financial details below. You can click{" "}
          <strong className="text-blue-700">Edit</strong> on any section to make adjustments before
          submitting.
        </p>
      </div>

      {/* Snapshot Bar (Live Calculations) */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
        <div className="p-2 bg-white rounded-lg border border-slate-200">
          <span className="text-[11px] text-slate-500 block">Monthly Income</span>
          <span className="text-sm font-bold text-slate-900">{formatINR(totalMonthlyIncome)}</span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-slate-200">
          <span className="text-[11px] text-slate-500 block">Monthly Expenses</span>
          <span className="text-sm font-bold text-slate-900">{formatINR(totalMonthlyExpenses)}</span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-slate-200">
          <span className="text-[11px] text-slate-500 block">Monthly Surplus</span>
          <span
            className={`text-sm font-bold ${
              monthlySurplus >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {formatINR(monthlySurplus)}
          </span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-slate-200">
          <span className="text-[11px] text-slate-500 block">Total Assets</span>
          <span className="text-sm font-bold text-slate-900">{formatINR(totalAssets)}</span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-slate-200">
          <span className="text-[11px] text-slate-500 block">Total Debt / Loans</span>
          <span className="text-sm font-bold text-rose-600">{formatINR(totalLiabilities)}</span>
        </div>
        <div className="p-2 bg-white rounded-lg border border-blue-200 bg-blue-50/40">
          <span className="text-[11px] text-blue-700 font-semibold block">Net Worth</span>
          <span className="text-sm font-black text-blue-800">{formatINR(netWorth)}</span>
        </div>
      </div>

      {/* Notice if any previous step has missing required fields */}
      {previousStepErrors.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Please complete required fields before final submission:</span>
          </div>
          <div className="space-y-1.5 pl-6 text-xs">
            {previousStepErrors.map((err, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-rose-700">
                  <strong>Step {err.step} ({err.name})</strong>: {err.msg}
                </span>
                <button
                  type="button"
                  onClick={() => onJumpToStep(err.step)}
                  className="text-xs font-semibold text-rose-800 underline hover:text-rose-950 ml-2 cursor-pointer"
                >
                  Go to Step {err.step} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete All-10-Section Summary Blocks */}
      <div className="space-y-4">
        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">1. Personal Information</h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 pt-3">
            <div>
              <span className="text-slate-400 block">Full Name</span>
              <span className="font-semibold text-slate-900">{d.fullName || "—"}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Date of Birth & Age</span>
              <span className="font-medium text-slate-800">
                {d.dob ? formatDate(d.dob) : "—"} ({d.age ? `${d.age} yrs` : "—"})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Gender</span>
              <span className="font-medium text-slate-800">{d.gender || "—"}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Occupation</span>
              <span className="font-medium text-slate-800">{d.occupation || "—"}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Mobile Number</span>
              <span className="font-semibold text-slate-900">
                {d.mobile ? `+91 ${d.mobile}` : "—"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Email Address</span>
              <span className="font-medium text-slate-800">{d.email || "—"}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block">Residential Address</span>
              <span className="font-medium text-slate-800">
                {d.address ? `${d.address}, ${d.city}, ${d.state}` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: FAMILY INFORMATION */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                2. Family Information ({d.familyMembers?.length || 0} Members)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="pt-3">
            {d.familyMembers?.length > 0 ? (
              <div className="space-y-2">
                {d.familyMembers.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="p-2.5 bg-slate-50 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{m.name}</span>
                      <span className="text-slate-500 ml-2">
                        ({m.relationship}, {m.age} yrs{m.occupation ? ` • ${m.occupation}` : ""})
                      </span>
                    </div>
                    <div>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          m.isDependent
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {m.isDependent ? "Dependent" : "Self-supporting"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No family members registered.</p>
            )}
          </div>
        </div>

        {/* SECTION 3: INCOME SOURCES */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                3. Income Sources (Total: {formatINR(totalMonthlyIncome)} / month)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(3)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="pt-3">
            {d.incomes?.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {d.incomes.map((inc, idx) => (
                  <div key={inc.id || idx} className="py-2 first:pt-0 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">{inc.type}</span>
                      {inc.description && (
                        <span className="text-slate-500 ml-2">({inc.description})</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{formatINR(inc.amount)}</span>
                      <span className="text-slate-400 ml-1">({inc.frequency})</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No income sources listed.</p>
            )}
          </div>
        </div>

        {/* SECTION 4: MONTHLY EXPENSES */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                4. Monthly Expenses (Total: {formatINR(totalMonthlyExpenses)} / month)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(4)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-3">
            {Object.entries(d.expenses || {}).map(([key, val]) => (
              <div key={key} className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block capitalize">{key}</span>
                <span className="font-bold text-slate-900">{formatINR(val || 0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: ASSETS */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                5. Assets & Holdings (Total: {formatINR(totalAssets)})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(5)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="pt-3">
            {d.assets?.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {d.assets.map((ast, idx) => (
                  <div key={ast.id || idx} className="py-2 first:pt-0 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">{ast.type}</span>
                      {ast.institution && (
                        <span className="text-slate-500 ml-2">({ast.institution})</span>
                      )}
                      {ast.description && (
                        <span className="text-slate-400 text-[11px] block">{ast.description}</span>
                      )}
                    </div>
                    <span className="font-bold text-slate-900">{formatINR(ast.currentValue)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No assets listed.</p>
            )}
          </div>
        </div>

        {/* SECTION 6: LIABILITIES */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                6. Liabilities & Loans (Total Debt: {formatINR(totalLiabilities)})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(6)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="pt-3">
            {d.liabilities?.length > 0 ? (
              <div className="space-y-2 text-xs">
                {d.liabilities.map((lia, idx) => (
                  <div
                    key={lia.id || idx}
                    className="p-2.5 bg-slate-50 rounded-lg flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{lia.type}</span>
                      {lia.lender && <span className="text-slate-500 ml-2">({lia.lender})</span>}
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        EMI: {formatINR(lia.emi)} / mo • Rate: {lia.interestRate || "—"}% • Tenure:{" "}
                        {lia.remainingTenureMonths || "—"} months
                      </div>
                    </div>
                    <span className="font-bold text-rose-700">
                      {formatINR(lia.outstandingAmount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No loans or liabilities reported.</p>
            )}
          </div>
        </div>

        {/* SECTION 7: EXISTING INVESTMENTS */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center">
                <LineChart className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                7. Existing Investments ({d.investments?.length || 0} Holdings)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(7)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="pt-3">
            {d.investments?.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {d.investments.map((inv, idx) => (
                  <div key={inv.id || idx} className="py-2.5 first:pt-0 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-900">{inv.name || inv.type}</span>
                      <span className="text-slate-500 ml-2">({inv.type})</span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        SIP: {formatINR(inv.monthlySIP)} / mo • Exp Return: {inv.expectedReturn || "12"}% • Goal:{" "}
                        {inv.linkedGoal || "Unallocated"}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">
                        {formatINR(inv.currentValue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No investments listed.</p>
            )}
          </div>
        </div>

        {/* SECTION 8: FINANCIAL GOALS */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                8. Financial Goals ({d.goals?.length || 0} Milestones)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(8)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="pt-3">
            {d.goals?.length > 0 ? (
              <div className="space-y-2.5 text-xs">
                {d.goals.map((g, idx) => {
                  const currentCost = Number(g.currentCost || 0);
                  const years = Number(g.yearsRemaining || 0);
                  const inflation = Number(g.inflationRate ?? 6);
                  const expReturn = Number(g.expectedReturn ?? 12);
                  const allocated = Number(g.allocatedInvestment || 0);

                  const futureCost = calculateFutureGoalCost(currentCost, years, inflation);
                  const reqSIP = calculateRequiredMonthlySIP(futureCost, years, expReturn, allocated);

                  return (
                    <div
                      key={g.id || idx}
                      className="p-3 bg-slate-50 rounded-lg space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            {g.category}
                          </span>
                          <span className="font-bold text-slate-900">{g.goalName}</span>
                          <span className="text-slate-400">({g.beneficiary || "Self"})</span>
                        </div>
                        <span className="font-bold text-slate-900">
                          Today's: {formatINR(g.currentCost)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>
                          Target: {g.targetYear} ({years} yrs) • Inflation: {inflation}% • Return:{" "}
                          {expReturn}%
                        </span>
                        <div className="flex items-center gap-3">
                          <span>
                            Inflated: <strong>{formatINR(futureCost)}</strong>
                          </span>
                          <span className="text-blue-700 font-bold">
                            Required SIP: {formatINR(reqSIP)} / mo
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No financial goals specified.</p>
            )}
          </div>
        </div>

        {/* SECTION 9: RETIREMENT & PENSION */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Palmtree className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">9. Retirement & Pension</h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(9)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 pt-3">
            <div>
              <span className="text-slate-400 block">Current Age</span>
              <span className="font-semibold text-slate-900">{d.currentAge || "—"} yrs</span>
            </div>
            <div>
              <span className="text-slate-400 block">Retirement Age</span>
              <span className="font-semibold text-slate-900">{d.retirementAge || "60"} yrs</span>
            </div>
            <div>
              <span className="text-slate-400 block">Life Expectancy</span>
              <span className="font-medium text-slate-800">{d.lifeExpectancy || "85"} yrs</span>
            </div>
            <div>
              <span className="text-slate-400 block">Target Monthly Income</span>
              <span className="font-bold text-emerald-700">
                {formatINR(d.desiredMonthlyIncome)} / mo
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Current Retirement Corpus</span>
              <span className="font-medium text-slate-800">
                {formatINR(d.currentRetirementSavings)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Existing Pension</span>
              <span className="font-medium text-slate-800">
                {formatINR(d.existingPension)} / mo
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Expected Pension Increase</span>
              <span className="font-medium text-slate-800">
                {d.expectedPensionIncrease || "0"}% p.a.
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Planner Retirement Notes</span>
              <span className="font-medium text-slate-800 truncate block">
                {d.otherRetirementNotes || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 10: PROTECTION & ADDITIONAL NOTES */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                10. Protection & Additional Information
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(10)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 pt-3">
            <div>
              <span className="text-slate-400 block">Term Life Insurance</span>
              <span className="font-semibold text-slate-900">
                {formatINR(d.lifeInsuranceCover)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Health Insurance</span>
              <span className="font-semibold text-slate-900">
                {formatINR(d.healthInsuranceCover)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Emergency Fund (3-6 mo)</span>
              <span
                className={`font-semibold ${
                  d.hasEmergencyFund ? "text-emerald-700" : "text-slate-500"
                }`}
              >
                {d.hasEmergencyFund ? "Yes, maintained" : "Not yet"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Registered Will / Estate Plan</span>
              <span
                className={`font-semibold ${
                  d.hasWill ? "text-emerald-700" : "text-slate-500"
                }`}
              >
                {d.hasWill ? "Yes, executed" : "None"}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block">Attached Documents</span>
              <span className="font-medium text-slate-800">
                {d.documentNames?.length > 0 ? d.documentNames.join(", ") : "None attached"}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block">Special Notes for Planner</span>
              <span className="font-medium text-slate-800 block">
                {d.plannerNotes || "None"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("confirmationAgreed")}
            className="w-5 h-5 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0 cursor-pointer"
          />
          <div>
            <span className="text-sm font-bold text-slate-900 block">
              I confirm that the information provided is accurate to the best of my knowledge.{" "}
              <span className="text-rose-500">*</span>
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block leading-relaxed">
              By submitting this form, I authorize the certified financial planning team at JDI Wealth
              to review my financial records and prepare a customized financial roadmap.
            </span>
          </div>
        </label>
        {errors?.confirmationAgreed && (
          <p className="text-xs text-rose-600 mt-2 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.confirmationAgreed.message}</span>
          </p>
        )}
      </div>

      {/* Prominent Final Submit Button in Review Sheet */}
      <div className="pt-2 p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Ready to Submit for Admin Review?</h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Your data will be transmitted to the JDI Wealth planning portal.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-lg shadow-md transition-colors disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Submitting Your Form...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Submit Financial Information</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
