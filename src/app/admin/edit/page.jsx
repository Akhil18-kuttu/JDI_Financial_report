"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
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
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import {
  getSubmissionById,
  updateSubmissionData,
  getAdminSession,
  SUBMISSION_STATUSES,
} from "@/lib/services/formStorage";
import { formatINR, formatDate, calculateAgeFromDOB } from "@/lib/utils/formatters";
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

const SECTIONS = [
  { id: "personal", label: "1. Personal", icon: User },
  { id: "family", label: "2. Family", icon: Users },
  { id: "income", label: "3. Income", icon: IndianRupee },
  { id: "expenses", label: "4. Expenses", icon: CreditCard },
  { id: "assets", label: "5. Assets", icon: Landmark },
  { id: "liabilities", label: "6. Liabilities", icon: Scale },
  { id: "investments", label: "7. Investments", icon: LineChart },
  { id: "goals", label: "8. Goals", icon: Target },
  { id: "retirement", label: "9. Retirement", icon: Palmtree },
  { id: "additional", label: "10. Protection & Notes", icon: Shield },
];

function AdminEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [formData, setFormData] = useState(null);
  const [status, setStatus] = useState("UNDER REVIEW");
  const [activeTab, setActiveTab] = useState("personal");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Authentication check
  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      router.replace("/adminlogin");
      return;
    }

    if (!submissionId) {
      router.replace("/admin");
      return;
    }

    const sub = getSubmissionById(submissionId);
    if (!sub) {
      alert("Submission not found.");
      router.replace("/admin");
      return;
    }

    setSubmission(sub);
    setFormData(JSON.parse(JSON.stringify(sub.data || {})));
    setStatus(sub.status || SUBMISSION_STATUSES.UNDER_REVIEW);
    setIsLoading(false);
  }, [submissionId, router]);

  // Live Calculations
  const calculated = useMemo(() => {
    if (!formData) return {};
    const monthlyIncome = calculateTotalMonthlyIncome(formData.incomes);
    const monthlyExpenses = calculateTotalMonthlyExpenses(formData.expenses);
    const surplus = calculateSurplus(monthlyIncome, monthlyExpenses);
    const totalAssets = calculateTotalAssets(formData.assets);
    const totalLiabilities = calculateTotalLiabilities(formData.liabilities);
    const netWorth = calculateNetWorth(totalAssets, totalLiabilities);

    return { monthlyIncome, monthlyExpenses, surplus, totalAssets, totalLiabilities, netWorth };
  }, [formData]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExpenseChange = (category, value) => {
    setFormData((prev) => ({
      ...prev,
      expenses: { ...prev.expenses, [category]: value },
    }));
  };

  // Family dynamic rows
  const handleAddFamily = () => {
    setFormData((prev) => ({
      ...prev,
      familyMembers: [
        ...(prev.familyMembers || []),
        { id: `fam-${Date.now()}`, name: "", relationship: "Spouse", age: "", occupation: "", isDependent: true },
      ],
    }));
  };

  const handleRemoveFamily = (index) => {
    setFormData((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateFamily = (index, key, val) => {
    const list = [...(formData.familyMembers || [])];
    list[index] = { ...list[index], [key]: val };
    setFormData((prev) => ({ ...prev, familyMembers: list }));
  };

  // Income dynamic rows
  const handleAddIncome = () => {
    setFormData((prev) => ({
      ...prev,
      incomes: [
        ...(prev.incomes || []),
        { id: `inc-${Date.now()}`, type: "Salary", frequency: "monthly", amount: "", description: "" },
      ],
    }));
  };

  const handleRemoveIncome = (index) => {
    setFormData((prev) => ({
      ...prev,
      incomes: prev.incomes.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateIncome = (index, key, val) => {
    const list = [...(formData.incomes || [])];
    list[index] = { ...list[index], [key]: val };
    setFormData((prev) => ({ ...prev, incomes: list }));
  };

  // Assets dynamic rows
  const handleAddAsset = () => {
    setFormData((prev) => ({
      ...prev,
      assets: [
        ...(prev.assets || []),
        { id: `ast-${Date.now()}`, type: "Savings Account", institution: "", currentValue: "", description: "" },
      ],
    }));
  };

  const handleRemoveAsset = (index) => {
    setFormData((prev) => ({
      ...prev,
      assets: prev.assets.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateAsset = (index, key, val) => {
    const list = [...(formData.assets || [])];
    list[index] = { ...list[index], [key]: val };
    setFormData((prev) => ({ ...prev, assets: list }));
  };

  // Liabilities dynamic rows
  const handleAddLiability = () => {
    setFormData((prev) => ({
      ...prev,
      liabilities: [
        ...(prev.liabilities || []),
        { id: `lia-${Date.now()}`, type: "Home Loan", lender: "", outstandingAmount: "", emi: "", interestRate: "" },
      ],
    }));
  };

  const handleRemoveLiability = (index) => {
    setFormData((prev) => ({
      ...prev,
      liabilities: prev.liabilities.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateLiability = (index, key, val) => {
    const list = [...(formData.liabilities || [])];
    list[index] = { ...list[index], [key]: val };
    setFormData((prev) => ({ ...prev, liabilities: list }));
  };

  // Investments dynamic rows
  const handleAddInvestment = () => {
    setFormData((prev) => ({
      ...prev,
      investments: [
        ...(prev.investments || []),
        { id: `inv-${Date.now()}`, type: "Mutual Funds", name: "", currentValue: "", monthlySIP: "", expectedReturn: 12, linkedGoal: "Unallocated / Flexible" },
      ],
    }));
  };

  const handleRemoveInvestment = (index) => {
    setFormData((prev) => ({
      ...prev,
      investments: prev.investments.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateInvestment = (index, key, val) => {
    const list = [...(formData.investments || [])];
    list[index] = { ...list[index], [key]: val };
    setFormData((prev) => ({ ...prev, investments: list }));
  };

  // Goals dynamic rows
  const handleAddGoal = () => {
    const currentYear = new Date().getFullYear();
    setFormData((prev) => ({
      ...prev,
      goals: [
        ...(prev.goals || []),
        { id: `gol-${Date.now()}`, category: "Education", goalName: "Higher Education", beneficiary: "Child", currentCost: "", targetYear: currentYear + 5, yearsRemaining: 5, inflationRate: 6, expectedReturn: 12, priority: "High" },
      ],
    }));
  };

  const handleRemoveGoal = (index) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateGoal = (index, key, val) => {
    const list = [...(formData.goals || [])];
    list[index] = { ...list[index], [key]: val };
    setFormData((prev) => ({ ...prev, goals: list }));
  };

  // Save changes
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      const success = updateSubmissionData(submissionId, formData, status);
      setIsSaving(false);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Failed to save changes.");
      }
    }, 400);
  };

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Sticky Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="relative h-7 w-28 hidden sm:block">
              <Image src="/jdi-logo.png" alt="JDI Wealth" fill sizes="120px" className="object-contain" priority />
            </div>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-700">{submission.submissionId}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-800">{formData.fullName || "Client"}</span>
              </div>
              <p className="text-[11px] text-slate-500">Administrator Full Data Editor</p>
            </div>
          </div>

          {/* Status selector & Save button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 hidden md:inline">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:border-blue-500"
              >
                {Object.values(SUBMISSION_STATUSES).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>

        {/* Live Calculation Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto text-xs gap-4">
            <div className="flex items-center gap-4 min-w-max text-slate-600">
              <div>
                Income: <strong className="text-slate-900">{formatINR(calculated.monthlyIncome)}/mo</strong>
              </div>
              <div>
                Expenses: <strong className="text-slate-900">{formatINR(calculated.monthlyExpenses)}/mo</strong>
              </div>
              <div>
                Surplus: <strong className={calculated.surplus >= 0 ? "text-emerald-600" : "text-rose-600"}>{formatINR(calculated.surplus)}/mo</strong>
              </div>
              <div>
                Assets: <strong className="text-slate-900">{formatINR(calculated.totalAssets)}</strong>
              </div>
              <div>
                Debt: <strong className="text-rose-600">{formatINR(calculated.totalLiabilities)}</strong>
              </div>
              <div>
                Net Worth: <strong className="text-blue-700">{formatINR(calculated.netWorth)}</strong>
              </div>
            </div>

            {saveSuccess && (
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 text-[11px] shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All changes saved successfully!</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Editor Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Navigation Tabs (Sidebar on desktop) */}
        <aside className="w-full md:w-56 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl p-2 space-y-1 sticky top-28">
            <span className="block px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Sections to Edit
            </span>
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeTab === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveTab(sec.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Section Editing Canvas */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* SECTION 1: PERSONAL */}
          {activeTab === "personal" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                1. Edit Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName || ""}
                    onChange={(e) => handleFieldChange("fullName", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob || ""}
                    onChange={(e) => {
                      const dob = e.target.value;
                      handleFieldChange("dob", dob);
                      const age = calculateAgeFromDOB(dob);
                      if (age) handleFieldChange("age", age);
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age ?? ""}
                    onChange={(e) => handleFieldChange("age", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender || "Male"}
                    onChange={(e) => handleFieldChange("gender", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={formData.mobile || ""}
                    onChange={(e) => handleFieldChange("mobile", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address || ""}
                    onChange={(e) => handleFieldChange("address", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city || ""}
                    onChange={(e) => handleFieldChange("city", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state || ""}
                    onChange={(e) => handleFieldChange("state", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={formData.occupation || ""}
                    onChange={(e) => handleFieldChange("occupation", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: FAMILY */}
          {activeTab === "family" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">2. Edit Family Members</h3>
                <button
                  type="button"
                  onClick={handleAddFamily}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              </div>

              {formData.familyMembers?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No family members registered.</p>
              ) : (
                <div className="space-y-3">
                  {formData.familyMembers?.map((m, i) => (
                    <div key={i} className="p-3 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-500">Name</label>
                        <input
                          type="text"
                          value={m.name || ""}
                          onChange={(e) => handleUpdateFamily(i, "name", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-500">Relationship</label>
                        <input
                          type="text"
                          value={m.relationship || ""}
                          onChange={(e) => handleUpdateFamily(i, "relationship", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-500">Age</label>
                        <input
                          type="number"
                          value={m.age ?? ""}
                          onChange={(e) => handleUpdateFamily(i, "age", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-500">Occupation</label>
                        <input
                          type="text"
                          value={m.occupation || ""}
                          onChange={(e) => handleUpdateFamily(i, "occupation", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="sm:col-span-1 flex flex-col items-center">
                        <span className="text-[10px] text-slate-500">Dep.</span>
                        <input
                          type="checkbox"
                          checked={m.isDependent !== false}
                          onChange={(e) => handleUpdateFamily(i, "isDependent", e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveFamily(i)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: INCOME */}
          {activeTab === "income" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">3. Edit Income Sources</h3>
                <button
                  type="button"
                  onClick={handleAddIncome}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Income</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.incomes?.map((inc, i) => (
                  <div key={i} className="p-3 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-500">Type</label>
                      <select
                        value={inc.type || "Salary"}
                        onChange={(e) => handleUpdateIncome(i, "type", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      >
                        <option value="Salary">Salary</option>
                        <option value="Business">Business</option>
                        <option value="Rental">Rental</option>
                        <option value="Pension">Pension</option>
                        <option value="Investments">Investments</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-500">Frequency</label>
                      <select
                        value={inc.frequency || "monthly"}
                        onChange={(e) => handleUpdateIncome(i, "frequency", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="annual">Annual</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-500">Amount (₹)</label>
                      <input
                        type="number"
                        value={inc.amount ?? ""}
                        onChange={(e) => handleUpdateIncome(i, "amount", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-500">Description</label>
                      <input
                        type="text"
                        value={inc.description || ""}
                        onChange={(e) => handleUpdateIncome(i, "description", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveIncome(i)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: EXPENSES */}
          {activeTab === "expenses" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                4. Edit Monthly Expenses (₹)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "household", label: "Household & Groceries" },
                  { key: "rent", label: "House Rent" },
                  { key: "education", label: "Education & Children" },
                  { key: "medical", label: "Medical & Healthcare" },
                  { key: "loanEMI", label: "Loan EMIs" },
                  { key: "insurance", label: "Insurance Premiums" },
                  { key: "travel", label: "Travel & Fuel" },
                  { key: "other", label: "Lifestyle & Discretionary" },
                ].map((item) => (
                  <div key={item.key}>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{item.label}</label>
                    <input
                      type="number"
                      value={formData.expenses?.[item.key] ?? ""}
                      onChange={(e) => handleExpenseChange(item.key, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: ASSETS */}
          {activeTab === "assets" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">5. Edit Assets & Holdings</h3>
                <button
                  type="button"
                  onClick={handleAddAsset}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Asset</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.assets?.map((ast, i) => (
                  <div key={i} className="p-3 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-500">Type</label>
                      <input
                        type="text"
                        value={ast.type || ""}
                        onChange={(e) => handleUpdateAsset(i, "type", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-500">Institution / Name</label>
                      <input
                        type="text"
                        value={ast.institution || ""}
                        onChange={(e) => handleUpdateAsset(i, "institution", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-500">Current Value (₹)</label>
                      <input
                        type="number"
                        value={ast.currentValue ?? ""}
                        onChange={(e) => handleUpdateAsset(i, "currentValue", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-semibold text-slate-500">Notes</label>
                      <input
                        type="text"
                        value={ast.description || ""}
                        onChange={(e) => handleUpdateAsset(i, "description", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset(i)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: LIABILITIES */}
          {activeTab === "liabilities" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">6. Edit Liabilities & Debt</h3>
                <button
                  type="button"
                  onClick={handleAddLiability}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Liability</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.liabilities?.map((l, i) => (
                  <div key={i} className="p-3 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-500">Type</label>
                      <input
                        type="text"
                        value={l.type || ""}
                        onChange={(e) => handleUpdateLiability(i, "type", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-500">Lender</label>
                      <input
                        type="text"
                        value={l.lender || ""}
                        onChange={(e) => handleUpdateLiability(i, "lender", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-500">Outstanding (₹)</label>
                      <input
                        type="number"
                        value={l.outstandingAmount ?? ""}
                        onChange={(e) => handleUpdateLiability(i, "outstandingAmount", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-500">EMI (₹)</label>
                      <input
                        type="number"
                        value={l.emi ?? ""}
                        onChange={(e) => handleUpdateLiability(i, "emi", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveLiability(i)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 7: INVESTMENTS */}
          {activeTab === "investments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">7. Edit Investments & SIPs</h3>
                <button
                  type="button"
                  onClick={handleAddInvestment}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Investment</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.investments?.map((inv, i) => (
                  <div key={i} className="p-3 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-500">Type</label>
                      <input
                        type="text"
                        value={inv.type || ""}
                        onChange={(e) => handleUpdateInvestment(i, "type", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-500">Scheme Name</label>
                      <input
                        type="text"
                        value={inv.name || ""}
                        onChange={(e) => handleUpdateInvestment(i, "name", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-500">Value (₹)</label>
                      <input
                        type="number"
                        value={inv.currentValue ?? ""}
                        onChange={(e) => handleUpdateInvestment(i, "currentValue", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-500">SIP (₹/mo)</label>
                      <input
                        type="number"
                        value={inv.monthlySIP ?? ""}
                        onChange={(e) => handleUpdateInvestment(i, "monthlySIP", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-semibold text-slate-500">Ret.%</label>
                      <input
                        type="number"
                        value={inv.expectedReturn ?? ""}
                        onChange={(e) => handleUpdateInvestment(i, "expectedReturn", e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveInvestment(i)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 8: GOALS */}
          {activeTab === "goals" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">8. Edit Financial Goals</h3>
                <button
                  type="button"
                  onClick={handleAddGoal}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Goal</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.goals?.map((g, i) => (
                  <div key={i} className="p-3 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-500">Goal Name</label>
                      <input
                        type="text"
                        value={g.goalName || ""}
                        onChange={(e) => handleUpdateGoal(i, "goalName", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-500">Beneficiary</label>
                      <input
                        type="text"
                        value={g.beneficiary || ""}
                        onChange={(e) => handleUpdateGoal(i, "beneficiary", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-500">Cost in Today's ₹</label>
                      <input
                        type="number"
                        value={g.currentCost ?? ""}
                        onChange={(e) => handleUpdateGoal(i, "currentCost", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-500">Target Year</label>
                      <input
                        type="number"
                        value={g.targetYear ?? ""}
                        onChange={(e) => handleUpdateGoal(i, "targetYear", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-semibold text-slate-500">Priority</label>
                      <select
                        value={g.priority || "High"}
                        onChange={(e) => handleUpdateGoal(i, "priority", e.target.value)}
                        className="w-full px-1 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Med</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(i)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 9: RETIREMENT */}
          {activeTab === "retirement" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                9. Edit Retirement & Pension
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Age</label>
                  <input
                    type="number"
                    value={formData.currentAge ?? ""}
                    onChange={(e) => handleFieldChange("currentAge", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Retirement Age</label>
                  <input
                    type="number"
                    value={formData.retirementAge ?? ""}
                    onChange={(e) => handleFieldChange("retirementAge", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Life Expectancy</label>
                  <input
                    type="number"
                    value={formData.lifeExpectancy ?? ""}
                    onChange={(e) => handleFieldChange("lifeExpectancy", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Desired Monthly Income (₹)</label>
                  <input
                    type="number"
                    value={formData.desiredMonthlyIncome ?? ""}
                    onChange={(e) => handleFieldChange("desiredMonthlyIncome", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Savings (₹)</label>
                  <input
                    type="number"
                    value={formData.currentRetirementSavings ?? ""}
                    onChange={(e) => handleFieldChange("currentRetirementSavings", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Existing Pension (₹/mo)</label>
                  <input
                    type="number"
                    value={formData.existingPension ?? ""}
                    onChange={(e) => handleFieldChange("existingPension", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pension Hike (% p.a.)</label>
                  <input
                    type="number"
                    value={formData.expectedPensionIncrease ?? ""}
                    onChange={(e) => handleFieldChange("expectedPensionIncrease", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Retirement Notes</label>
                  <textarea
                    rows={2}
                    value={formData.otherRetirementNotes || ""}
                    onChange={(e) => handleFieldChange("otherRetirementNotes", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 10: PROTECTION & NOTES */}
          {activeTab === "additional" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                10. Edit Insurance & Planner Notes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Term Life Insurance Cover (₹)</label>
                  <input
                    type="number"
                    value={formData.lifeInsuranceCover ?? ""}
                    onChange={(e) => handleFieldChange("lifeInsuranceCover", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Health Insurance Cover (₹)</label>
                  <input
                    type="number"
                    value={formData.healthInsuranceCover ?? ""}
                    onChange={(e) => handleFieldChange("healthInsuranceCover", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.hasEmergencyFund === true}
                      onChange={(e) => handleFieldChange("hasEmergencyFund", e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Emergency fund maintained</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.hasWill === true}
                      onChange={(e) => handleFieldChange("hasWill", e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Registered Will / Estate Plan Executed</span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Planner Notes</label>
                  <textarea
                    rows={3}
                    value={formData.plannerNotes || ""}
                    onChange={(e) => handleFieldChange("plannerNotes", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel & Return to Dashboard
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save All Changes"}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminEditPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminEditContent />
    </Suspense>
  );
}
