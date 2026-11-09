"use client";

import React from "react";
import { formatINR } from "@/lib/utils/formatters";

export default function StepRetirement({ register, watch, errors }) {
  const currentAge = watch("currentAge") || 35;
  const retirementAge = watch("retirementAge") || 60;
  const lifeExpectancy = watch("lifeExpectancy") || 85;
  const desiredMonthlyIncome = watch("desiredMonthlyIncome") || 0;

  const yearsToRetirement = Math.max(0, Number(retirementAge) - Number(currentAge));
  const retirementDurationYears = Math.max(0, Number(lifeExpectancy) - Number(retirementAge));

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Retirement & Pension</h2>
        <p className="text-sm text-slate-500 mt-1">
          Specify your planned retirement age and post-retirement lifestyle income needs.
        </p>
      </div>

      {/* Simple Timeline Bar */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        <div>
          <span className="text-xs text-slate-500 block">Years Until Retirement</span>
          <span className="text-xl font-bold text-blue-700">{yearsToRetirement} Years</span>
        </div>
        <div>
          <span className="text-xs text-slate-500 block">Retirement Duration</span>
          <span className="text-xl font-bold text-slate-800">{retirementDurationYears} Years</span>
        </div>
        <div>
          <span className="text-xs text-slate-500 block">Target Monthly Income</span>
          <span className="text-xl font-bold text-emerald-600">
            {formatINR(desiredMonthlyIncome)}/mo
          </span>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
        {/* Current Age */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Current Age (Years) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="18"
            max="80"
            placeholder="e.g. 35"
            {...register("currentAge")}
            className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
              errors.currentAge ? "border-rose-300 focus:border-rose-500" : "border-slate-300 focus:border-blue-500"
            }`}
          />
          {errors.currentAge && (
            <p className="text-xs text-rose-600 mt-1">{errors.currentAge.message}</p>
          )}
        </div>

        {/* Expected Retirement Age */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Expected Retirement Age <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="40"
            max="90"
            placeholder="e.g. 60"
            {...register("retirementAge")}
            className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
              errors.retirementAge ? "border-rose-300 focus:border-rose-500" : "border-slate-300 focus:border-blue-500"
            }`}
          />
          {errors.retirementAge && (
            <p className="text-xs text-rose-600 mt-1">{errors.retirementAge.message}</p>
          )}
        </div>

        {/* Life Expectancy */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Assumed Life Expectancy <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="60"
            max="120"
            placeholder="e.g. 85"
            {...register("lifeExpectancy")}
            className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
              errors.lifeExpectancy ? "border-rose-300 focus:border-rose-500" : "border-slate-300 focus:border-blue-500"
            }`}
          />
          {errors.lifeExpectancy && (
            <p className="text-xs text-rose-600 mt-1">{errors.lifeExpectancy.message}</p>
          )}
        </div>

        {/* Desired Monthly Income in Retirement */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Desired Monthly Income in Retirement (in today's ₹) <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex rounded-lg border border-slate-300 overflow-hidden focus-within:border-blue-500">
            <span className="inline-flex items-center px-3 bg-slate-50 text-slate-500 text-xs font-semibold border-r border-slate-300">
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="5000"
              placeholder="e.g. 75000"
              {...register("desiredMonthlyIncome")}
              className="w-full px-3 py-2.5 text-sm focus:outline-none"
            />
          </div>
          {errors.desiredMonthlyIncome && (
            <p className="text-xs text-rose-600 mt-1">{errors.desiredMonthlyIncome.message}</p>
          )}
        </div>

        {/* Current Retirement Savings */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Current Retirement Corpus (₹)
          </label>
          <div className="relative flex rounded-lg border border-slate-300 overflow-hidden focus-within:border-blue-500">
            <span className="inline-flex items-center px-3 bg-slate-50 text-slate-500 text-xs font-semibold border-r border-slate-300">
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="10000"
              placeholder="e.g. 1000000"
              {...register("currentRetirementSavings")}
              className="w-full px-3 py-2.5 text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Existing Pension */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Existing Expected Monthly Pension (₹)
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            placeholder="e.g. 0 or 20000"
            {...register("existingPension")}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Expected Pension Increase % */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Expected Pension Increase (% p.a.)
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            max="20"
            placeholder="e.g. 5"
            {...register("expectedPensionIncrease")}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Other Notes */}
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Retirement Vision or Notes
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Looking to shift to native place post-retirement, expecting inheritance around age 55."
            {...register("otherRetirementNotes")}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
