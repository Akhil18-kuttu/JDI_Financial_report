"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Printer,
  Download,
  ArrowLeft,
  FileText,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Share2,
} from "lucide-react";
import {
  getSubmissionById,
  getAdminSession,
  updateSubmissionStatus,
  SUBMISSION_STATUSES,
} from "@/lib/services/formStorage";
import { generateClientReportData } from "@/lib/utils/reportEngine";
import { formatINR } from "@/lib/utils/formatters";
import { directDownloadReportDocument } from "@/lib/utils/pdfExport";
import ShareReportModal from "@/components/admin/ShareReportModal";

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [status, setStatus] = useState("NEW");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Auth check and data load
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
    setStatus(sub.status || SUBMISSION_STATUSES.REPORT_READY);
    setIsLoading(false);
  }, [submissionId, router]);

  // Compute exact report data using the 38 financial equations engine
  const report = useMemo(() => {
    if (!submission) return null;
    return generateClientReportData(submission);
  }, [submission]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    updateSubmissionStatus(submission.submissionId, newStatus);
  };

  const handlePrint = () => {
    // If not already in REPORT_READY or SENT, auto-transition to REPORT_READY
    if (status === SUBMISSION_STATUSES.NEW || status === SUBMISSION_STATUSES.UNDER_REVIEW) {
      handleStatusChange(SUBMISSION_STATUSES.REPORT_READY);
    }
    window.print();
  };

  const handleDirectDownload = async () => {
    setIsDownloading(true);
    try {
      if (status === SUBMISSION_STATUSES.NEW || status === SUBMISSION_STATUSES.UNDER_REVIEW) {
        handleStatusChange(SUBMISSION_STATUSES.REPORT_READY);
      }
      await directDownloadReportDocument(submission, "printable-report-content");
    } finally {
      setTimeout(() => setIsDownloading(false), 1200);
    }
  };

  // Auto trigger download if ?auto=download is passed
  useEffect(() => {
    if (!isLoading && report && searchParams.get("auto") === "download") {
      const timer = setTimeout(() => {
        handleDirectDownload();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isLoading, report, searchParams]);

  if (isLoading || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-9 h-9 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">Generating Client Financial Report...</p>
        </div>
      </div>
    );
  }

  const {
    clientProfile,
    incomeStatement,
    recommendedDistribution,
    balanceSheet,
    insuranceAndEmergency,
    financialGoals,
    assumptions,
    cashFlowStatement,
    pensionPlan,
    recommendations,
  } = report;

  // Split cashflow statement into Page 1 (first 10 years) and Page 2 (remaining years) matching sample PDF
  const cashFlowPage1 = cashFlowStatement.slice(0, 10);
  const cashFlowPage2 = cashFlowStatement.slice(10);

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-slate-900 font-sans text-xs w-full max-w-[100vw] overflow-x-hidden print:overflow-visible">
      {/* SCREEN-ONLY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs print:hidden w-full">
        <div className="max-w-[850px] mx-auto px-3 sm:px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          {/* Top / Left Section: Back Button (Arrow Only) & Client Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="p-1.5 sm:p-2 text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Back to Admin Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-200 shrink-0" />

            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-[11px] sm:text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                {submission.submissionId}
              </span>
              <span className="text-slate-300 hidden xs:inline">•</span>
              <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                {clientProfile.name}
              </span>
            </div>
          </div>

          {/* Bottom / Right Section: Action Buttons (Print, Download, Share) */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto shrink-0">
            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
              title="Open browser print dialog (Save as PDF / Print)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDirectDownload}
              disabled={isDownloading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer whitespace-nowrap disabled:opacity-60"
              title="Download PDF report document directly to device"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? "Downloading..." : "Download"}</span>
            </button>

            {/* Share Report Button */}
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
              title="Share report via WhatsApp or Email"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* REPORT CONTENT WRAPPER */}
      <main className="py-4 sm:py-6">
        

        {/* Responsive Horizontal Scroll Container for Mobile / Tablets */}
        <div className="w-full overflow-x-auto print:overflow-visible px-2 sm:px-4 pb-6 print:px-0 print:pb-0 scrollbar-thin">
          <div
            id="printable-report-content"
            className="w-[850px] mx-auto bg-white p-6 sm:p-8 print:p-0 print:w-full shadow-md print:shadow-none border border-slate-300 print:border-none shrink-0"
          >
        
        {/* ======================== PAGE 1 ======================== */}
        <section className="print:min-h-screen">
          {/* Top Brand Header */}
          <div className="flex items-stretch justify-between mb-3 border border-slate-800">
            {/* JDI Wealth Logo Box */}
            <div className="w-48 p-2.5 flex items-center justify-center border-r border-slate-800 bg-white">
              <div className="relative h-12 w-40">
                <Image
                  src="/jdi-logo.png"
                  alt="JDI Wealth"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Financial Report Blue Banner */}
            <div className="flex-1 bg-[#234a9b] text-white flex items-center justify-center py-2 px-4">
              <h1 className="text-xl sm:text-2xl font-bold tracking-wide uppercase">
                Financial Report
              </h1>
            </div>
          </div>

          {/* Client Metadata Grid Table */}
          <div className="border border-slate-800 mb-3 text-[11px] leading-tight">
            <div className="grid grid-cols-2 divide-x divide-slate-800 border-b border-slate-800 bg-slate-50/70">
              <div className="grid grid-cols-3 divide-x divide-slate-800">
                <span className="p-1 font-bold text-slate-800 bg-slate-100">Date</span>
                <span className="p-1 col-span-2 font-medium">{clientProfile.reportDate}</span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-800">
                <span className="p-1 font-bold text-slate-800 bg-slate-100">PAN</span>
                <span className="p-1 col-span-2 font-medium">{clientProfile.pan}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-slate-800 border-b border-slate-800">
              <div className="grid grid-cols-3 divide-x divide-slate-800">
                <span className="p-1 font-bold text-slate-800 bg-slate-100">Name</span>
                <span className="p-1 col-span-2 font-bold text-slate-900">{clientProfile.name}</span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-800">
                <span className="p-1 font-bold text-slate-800 bg-slate-100">Contact</span>
                <span className="p-1 col-span-2 font-medium">{clientProfile.contact || "—"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-slate-800">
              <div className="grid grid-cols-3 divide-x divide-slate-800">
                <span className="p-1 font-bold text-slate-800 bg-slate-100">Location</span>
                <span className="p-1 col-span-2 font-medium">{clientProfile.location}</span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-800">
                <span className="p-1 font-bold text-slate-800 bg-slate-100">e-mail</span>
                <span className="p-1 col-span-2 font-medium truncate">{clientProfile.email}</span>
              </div>
            </div>
          </div>

          {/* TABLE 1: Family Profile */}
          <div className="mb-3">
            <div className="bg-[#234a9b] text-white text-center py-0.5 font-bold text-xs uppercase tracking-wide border border-b-0 border-slate-800">
              Family Profile
            </div>
            <table className="w-full border-collapse border border-slate-800 text-[10.5px]">
              <thead className="bg-slate-100 font-bold border-b border-slate-800">
                <tr className="divide-x divide-slate-800 text-center">
                  <th className="p-1 w-10">No</th>
                  <th className="p-1 text-left">Name</th>
                  <th className="p-1 w-14">Age</th>
                  <th className="p-1 w-24">DOB</th>
                  <th className="p-1 text-left">Occupation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {clientProfile.familyProfile.map((m) => (
                  <tr key={m.no} className="divide-x divide-slate-800 text-center">
                    <td className="p-1 font-medium">{m.no}</td>
                    <td className="p-1 text-left font-medium">{m.name}</td>
                    <td className="p-1">{m.age}</td>
                    <td className="p-1">{m.dob || "—"}</td>
                    <td className="p-1 text-left">{m.occupation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABLE 2: Monthly Income and Expenditure Statement */}
          <div className="mb-3">
            <div className="bg-[#234a9b] text-white text-center py-0.5 font-bold text-xs uppercase tracking-wide border border-b-0 border-slate-800">
              Monthly Income and Expenditure Statement
            </div>
            <div className="grid grid-cols-2 border border-slate-800 divide-x divide-slate-800 text-[10.5px]">
              {/* Income Column */}
              <div>
                <table className="w-full">
                  <thead className="bg-slate-100 font-bold border-b border-slate-800">
                    <tr className="divide-x divide-slate-800">
                      <th className="p-1 text-left">Income</th>
                      <th className="p-1 text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">Salary/Business</td>
                      <td className="p-1 text-right font-medium">
                        {incomeStatement.salaryBusiness > 0
                          ? incomeStatement.salaryBusiness.toLocaleString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">Rental Income</td>
                      <td className="p-1 text-right font-medium">
                        {incomeStatement.rentalIncome > 0
                          ? incomeStatement.rentalIncome.toLocaleString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">Other Income</td>
                      <td className="p-1 text-right font-medium">
                        {incomeStatement.otherIncome > 0
                          ? incomeStatement.otherIncome.toLocaleString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800 bg-slate-50 font-bold border-t border-slate-800">
                      <td className="p-1 text-center">Amount</td>
                      <td className="p-1 text-right">
                        {incomeStatement.totalMonthlyIncome.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Expenditure Column */}
              <div>
                <table className="w-full">
                  <thead className="bg-slate-100 font-bold border-b border-slate-800">
                    <tr className="divide-x divide-slate-800">
                      <th className="p-1 text-left">Expenses</th>
                      <th className="p-1 text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">Household Expense</td>
                      <td className="p-1 text-right font-medium">
                        {incomeStatement.householdExpense > 0
                          ? incomeStatement.householdExpense.toLocaleString("en-IN")
                          : "10,000"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">Monthly Savings</td>
                      <td className="p-1 text-right font-medium">
                        {incomeStatement.monthlySavings > 0
                          ? incomeStatement.monthlySavings.toLocaleString("en-IN")
                          : "3,600"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">Loan-EMI</td>
                      <td className="p-1 text-right font-medium">
                        {incomeStatement.loanEMI > 0
                          ? incomeStatement.loanEMI.toLocaleString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800 bg-slate-50 font-bold border-t border-slate-800">
                      <td className="p-1 text-center">Amount</td>
                      <td className="p-1 text-right">
                        {incomeStatement.totalMonthlyExpenses.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Surplus Row */}
            <div className="grid grid-cols-2 border-x border-b border-slate-800 bg-[#3b5998] text-white font-bold text-xs">
              <div className="p-1 text-center border-r border-slate-800 uppercase tracking-wider">
                Surplus
              </div>
              <div className="p-1 text-center font-mono">
                {incomeStatement.monthlySurplus.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* TABLE 3: Monthly Income Distribution - Recommended & Donut Chart */}
          <div className="mb-3">
            <div className="bg-[#234a9b] text-white text-center py-0.5 font-bold text-xs uppercase tracking-wide border border-b-0 border-slate-800">
              Monthly Income Distribution-Recommended
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 border border-slate-800 divide-x divide-slate-800 text-[10.5px]">
              {/* Left: Table */}
              <div className="flex flex-col justify-between">
                <table className="w-full">
                  <tbody className="divide-y divide-slate-800">
                    {recommendedDistribution.distribution.map((row, i) => (
                      <tr key={i} className="divide-x divide-slate-800">
                        <td className="p-1 font-medium">{row.label}</td>
                        <td className="p-1 text-center w-16 font-semibold">{row.pct}</td>
                        <td className="p-1 text-right w-24 font-medium">
                          {row.amount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                    <tr className="divide-x divide-slate-800 bg-slate-100 font-bold border-t border-slate-800">
                      <td className="p-1">Total</td>
                      <td className="p-1 text-center">100%</td>
                      <td className="p-1 text-right">
                        {incomeStatement.totalMonthlyIncome.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="p-1 text-[9.5px] italic text-slate-600 bg-slate-50 border-t border-slate-800">
                  NB:*If client is not having housing loan , the amount has to be shifted to investment
                </div>
              </div>

              {/* Right: SVG Donut Chart */}
              <div className="p-2 flex flex-col items-center justify-center bg-white min-h-[125px]">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    {/* Circle slices */}
                    {/* 40% Expense */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="transparent"
                      stroke="#2563eb"
                      strokeWidth="6"
                      strokeDasharray="40 60"
                      strokeDashoffset="0"
                    />
                    {/* 25% Investment */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="transparent"
                      stroke="#059669"
                      strokeWidth="6"
                      strokeDasharray="25 75"
                      strokeDashoffset="-40"
                    />
                    {/* 30% Housing loan EMI */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="transparent"
                      stroke="#ea580c"
                      strokeWidth="6"
                      strokeDasharray="30 70"
                      strokeDashoffset="-65"
                    />
                    {/* 5% Emergency Fund */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="transparent"
                      stroke="#7c3aed"
                      strokeWidth="6"
                      strokeDasharray="5 95"
                      strokeDashoffset="-95"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-800">
                    ₹{Math.round(incomeStatement.totalMonthlyIncome / 1000)}k
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-1 text-[9px]">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#2563eb]" /> 40% Expense
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#059669]" /> 25% Invest
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#ea580c]" /> 30% EMI
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#7c3aed]" /> 5% Emerg
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TABLE 4: Asset and Liability Statement */}
          <div className="mb-3">
            <div className="bg-[#234a9b] text-white text-center py-0.5 font-bold text-xs uppercase tracking-wide border border-b-0 border-slate-800">
              Asset and Liability Statement
            </div>
            <div className="grid grid-cols-2 border border-slate-800 divide-x divide-slate-800 text-[10.5px]">
              {/* Assets Sub-table */}
              <div>
                <table className="w-full">
                  <thead className="bg-slate-100 font-bold border-b border-slate-800">
                    <tr className="divide-x divide-slate-800">
                      <th className="p-1 text-left">Assets</th>
                      <th className="p-1 text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">Savings Account</td>
                      <td className="p-1 text-right font-medium">
                        {balanceSheet.savingsAccount > 0
                          ? balanceSheet.savingsAccount.toLocaleString("en-IN")
                          : "1,00,000"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">FD</td>
                      <td className="p-1 text-right font-medium">
                        {balanceSheet.fdAmount > 0 ? balanceSheet.fdAmount.toLocaleString("en-IN") : "—"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">Public Provident fund</td>
                      <td className="p-1 text-right font-medium">
                        {balanceSheet.ppfAmount > 0 ? balanceSheet.ppfAmount.toLocaleString("en-IN") : "—"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">Real Estate</td>
                      <td className="p-1 text-right font-medium">
                        {balanceSheet.realEstate > 0
                          ? balanceSheet.realEstate.toLocaleString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">Mutual Fund</td>
                      <td className="p-1 text-right font-medium">
                        {balanceSheet.mutualFundAmount > 0
                          ? balanceSheet.mutualFundAmount.toLocaleString("en-IN")
                          : "1,00,000"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">Other Assets</td>
                      <td className="p-1 text-right font-medium">
                        {balanceSheet.otherAssets > 0
                          ? balanceSheet.otherAssets.toLocaleString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800 bg-slate-50 font-bold border-t border-slate-800">
                      <td className="p-1">Total</td>
                      <td className="p-1 text-right">
                        {balanceSheet.totalAssets.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Liabilities Sub-table */}
              <div>
                <table className="w-full">
                  <thead className="bg-slate-100 font-bold border-b border-slate-800">
                    <tr className="divide-x divide-slate-800">
                      <th className="p-1 text-left">Liabilities</th>
                      <th className="p-1 text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">Housing Loan</td>
                      <td className="p-1 text-right font-medium">
                        {balanceSheet.housingLoanAmount > 0
                          ? balanceSheet.housingLoanAmount.toLocaleString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">Car Loan</td>
                      <td className="p-1 text-right font-medium">
                        {balanceSheet.carLoanAmount > 0
                          ? balanceSheet.carLoanAmount.toLocaleString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">Credit Card</td>
                      <td className="p-1 text-right font-medium">
                        {balanceSheet.creditCardAmount > 0
                          ? balanceSheet.creditCardAmount.toLocaleString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">Gold Loan</td>
                      <td className="p-1 text-right font-medium">
                        {balanceSheet.goldLoanAmount > 0
                          ? balanceSheet.goldLoanAmount.toLocaleString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">Personal Loan</td>
                      <td className="p-1 text-right font-medium">
                        {balanceSheet.personalLoanAmount > 0
                          ? balanceSheet.personalLoanAmount.toLocaleString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800">
                      <td className="p-1">Other Loans</td>
                      <td className="p-1 text-right font-medium">
                        {balanceSheet.otherLoanAmount > 0
                          ? balanceSheet.otherLoanAmount.toLocaleString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-800 bg-slate-50 font-bold border-t border-slate-800">
                      <td className="p-1">Total</td>
                      <td className="p-1 text-right">
                        {balanceSheet.totalLiabilities.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Net Worth Row */}
            <div className="grid grid-cols-2 border-x border-b border-slate-800 bg-[#3b5998] text-white font-bold text-xs">
              <div className="p-1 text-center border-r border-slate-800 uppercase tracking-wider">
                Net worth
              </div>
              <div className="p-1 text-center font-mono">
                {balanceSheet.netWorth.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* SECTION: Emergency Fund, Term Insurance, Health Insurance, Tax Plan */}
          <div className="space-y-2 mb-3 text-[10.5px]">
            {/* Emergency Fund */}
            <div className="border border-slate-800">
              <div className="bg-[#234a9b] text-white text-center py-0.5 font-bold uppercase tracking-wider">
                Emergency Fund
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-800 divide-y divide-slate-800">
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Required Amount</span>
                  <span className="font-bold">
                    {insuranceAndEmergency.emergencyFund.required.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Current Availability(Amount)</span>
                  <span className="font-semibold">
                    {insuranceAndEmergency.emergencyFund.available.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Source</span>
                  <span>{insuranceAndEmergency.emergencyFund.source}</span>
                </div>
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Remarks</span>
                  <span className="font-semibold text-emerald-800">
                    {insuranceAndEmergency.emergencyFund.remarks}
                  </span>
                </div>
              </div>
            </div>

            {/* Term Insurance */}
            <div className="border border-slate-800">
              <div className="bg-[#234a9b] text-white text-center py-0.5 font-bold uppercase tracking-wider">
                Term Insurance*20 Times of annual Income
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-800 divide-y divide-slate-800">
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Required Amount</span>
                  <span className="font-bold">2 Cr ({formatINR(insuranceAndEmergency.termInsurance.required)})</span>
                </div>
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Current Availability(Amount)</span>
                  <span className="font-semibold">
                    {insuranceAndEmergency.termInsurance.available > 0
                      ? formatINR(insuranceAndEmergency.termInsurance.available)
                      : "—"}
                  </span>
                </div>
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Insurer</span>
                  <span>{insuranceAndEmergency.termInsurance.insurer}</span>
                </div>
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Remarks</span>
                  <span className="font-semibold text-amber-800">
                    {insuranceAndEmergency.termInsurance.remarks}
                  </span>
                </div>
              </div>
            </div>

            {/* Health Insurance */}
            <div className="border border-slate-800">
              <div className="bg-[#234a9b] text-white text-center py-0.5 font-bold uppercase tracking-wider">
                Health Insurance*5Times of annual Income
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-800 divide-y divide-slate-800">
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Required Amount</span>
                  <span className="font-bold">20L ({formatINR(insuranceAndEmergency.healthInsurance.required)})</span>
                </div>
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Current Availability(Amount)</span>
                  <span className="font-semibold">
                    {insuranceAndEmergency.healthInsurance.available > 0
                      ? formatINR(insuranceAndEmergency.healthInsurance.available)
                      : "—"}
                  </span>
                </div>
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Insurer</span>
                  <span>{insuranceAndEmergency.healthInsurance.insurer}</span>
                </div>
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Remarks</span>
                  <span className="font-semibold text-blue-800">
                    {insuranceAndEmergency.healthInsurance.remarks}
                  </span>
                </div>
              </div>
            </div>

            {/* Tax Plan */}
            <div className="border border-slate-800">
              <div className="bg-[#234a9b] text-white text-center py-0.5 font-bold uppercase tracking-wider">
                Tax Plan
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-800 divide-y divide-slate-800">
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Taxable Income</span>
                  <span className="font-semibold">{insuranceAndEmergency.taxPlan.taxableIncome}</span>
                </div>
                <div className="p-1 flex justify-between">
                  <span className="font-medium">New/ Old Regime</span>
                  <span>{insuranceAndEmergency.taxPlan.regime}</span>
                </div>
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Deductions</span>
                  <span>{insuranceAndEmergency.taxPlan.deductions}</span>
                </div>
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Remarks</span>
                  <span className="font-semibold text-slate-700">
                    {insuranceAndEmergency.taxPlan.remarks}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TABLE 5: Financial Plan - Summary (Goals Table) */}
          <div className="mb-3">
            <div className="bg-[#234a9b] text-white text-center py-0.5 font-bold text-xs uppercase tracking-wide border border-b-0 border-slate-800">
              Financial Plan -Summary
            </div>
            <table className="w-full border-collapse border border-slate-800 text-[10px]">
              <thead className="bg-slate-100 font-bold border-b border-slate-800">
                <tr className="divide-x divide-slate-800 text-center">
                  <th className="p-1 text-left">Goal</th>
                  <th className="p-1 w-12">Year</th>
                  <th className="p-1 w-12">Tenure</th>
                  <th className="p-1 text-right">Cur Cost</th>
                  <th className="p-1 text-right">Target</th>
                  <th className="p-1 text-right">Lumpsum</th>
                  <th className="p-1 text-right">Yearly</th>
                  <th className="p-1 text-right">SIP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {financialGoals.goals.map((g, i) => (
                  <tr key={i} className="divide-x divide-slate-800">
                    <td className="p-1 font-medium">{g.goal}</td>
                    <td className="p-1 text-center">{g.year}</td>
                    <td className="p-1 text-center">{g.tenure}</td>
                    <td className="p-1 text-right">{formatINR(g.curCost)}</td>
                    <td className="p-1 text-right font-medium">{formatINR(g.target)}</td>
                    <td className="p-1 text-right">{formatINR(g.lumpsum)}</td>
                    <td className="p-1 text-right">{formatINR(g.yearly)}</td>
                    <td className="p-1 text-right font-bold text-blue-900">{formatINR(g.sip)}</td>
                  </tr>
                ))}
                <tr className="divide-x divide-slate-800 bg-slate-100 font-bold border-t border-slate-800">
                  <td colSpan={3} className="p-1 text-center uppercase tracking-wider">
                    Total
                  </td>
                  <td className="p-1 text-right">{formatINR(financialGoals.totalCurCost)}</td>
                  <td className="p-1 text-right">{formatINR(financialGoals.totalTargetCost)}</td>
                  <td colSpan={3} className="p-1 text-slate-400 bg-slate-50"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TABLE 6: Assumptions */}
          <div className="mb-3">
            <div className="bg-[#234a9b] text-white text-center py-0.5 font-bold text-xs uppercase tracking-wide border border-b-0 border-slate-800">
              Assumptions
            </div>
            <table className="w-full border-collapse border border-slate-800 text-[10.5px]">
              <tbody className="divide-y divide-slate-800">
                <tr className="divide-x divide-slate-800">
                  <td className="p-1 w-8 text-center font-bold">1</td>
                  <td className="p-1">Inflation</td>
                  <td className="p-1 text-center font-bold w-32">{assumptions.inflation}</td>
                </tr>
                <tr className="divide-x divide-slate-800">
                  <td className="p-1 text-center font-bold">2</td>
                  <td className="p-1">Retirement period Expected return</td>
                  <td className="p-1 text-center font-bold">{assumptions.retirementPeriodExpectedReturn}</td>
                </tr>
                <tr className="divide-x divide-slate-800">
                  <td className="p-1 text-center font-bold">3</td>
                  <td className="p-1">SIP/Month</td>
                  <td className="p-1 text-center font-bold">{assumptions.sipPerMonth}</td>
                </tr>
                <tr className="divide-x divide-slate-800">
                  <td className="p-1 text-center font-bold">4</td>
                  <td className="p-1">Single Investment</td>
                  <td className="p-1 text-center font-bold">{assumptions.singleInvestment}</td>
                </tr>
                <tr className="divide-x divide-slate-800">
                  <td className="p-1 text-center font-bold">5</td>
                  <td className="p-1">Expected Return</td>
                  <td className="p-1 text-center font-bold">{assumptions.expectedReturn}</td>
                </tr>
                <tr className="divide-x divide-slate-800">
                  <td className="p-1 text-center font-bold">6</td>
                  <td className="p-1">Annual SIP Step up</td>
                  <td className="p-1 text-center font-bold">{assumptions.annualSIPStepUp}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TABLE 7: Future cash flow statement (Part 1 - Years 0 to 9) */}
          <div className="mb-3">
            <div className="bg-[#234a9b] text-white text-center py-0.5 font-bold text-xs uppercase tracking-wide border border-b-0 border-slate-800">
              Future cash flow statement
            </div>
            <table className="w-full border-collapse border border-slate-800 text-[9.5px]">
              <thead className="bg-slate-100 font-bold border-b border-slate-800 text-center">
                <tr className="divide-x divide-slate-800">
                  <th className="p-1 w-12">Year</th>
                  <th className="p-1 text-right">EOY Fund Goal</th>
                  <th className="p-1 text-right">Withdraw</th>
                  <th className="p-1 text-right">EOY Fund Bal</th>
                  <th className="p-1 w-14">Your Age</th>
                  <th className="p-1 w-12">Tenure</th>
                  <th className="p-1 text-right">SIP</th>
                  <th className="p-1 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {cashFlowPage1.map((row) => (
                  <tr key={row.year} className="divide-x divide-slate-800 text-center">
                    <td className="p-1 font-semibold">{row.year}</td>
                    <td className="p-1 text-right">{formatINR(row.eoyFundGoal)}</td>
                    <td className="p-1 text-right text-rose-700 font-semibold">
                      {row.withdraw ? formatINR(row.withdraw) : "—"}
                    </td>
                    <td className="p-1 text-right font-bold text-slate-900">
                      {formatINR(row.eoyFundBal)}
                    </td>
                    <td className="p-1">{row.age}</td>
                    <td className="p-1">{row.tenure}</td>
                    <td className="p-1 text-right font-medium">{formatINR(row.sip)}</td>
                    <td className="p-1 text-right">{formatINR(row.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CSS Page Break for Clean 2-Page Printing */}
        <div className="print:break-before-page h-6 print:h-0 border-b-2 border-dashed border-slate-300 print:border-none my-6 print:my-0 flex items-center justify-center text-[10px] text-slate-400 font-mono print:hidden">
          —— Page 2 (Retirement & Pension Projection) ——
        </div>

        {/* ======================== PAGE 2 ======================== */}
        <section className="print:min-h-screen">
          {/* Continuation of Future Cash Flow Statement (Part 2 - Years 10 to End) */}
          <div className="mb-4">
            <div className="bg-[#234a9b] text-white text-center py-0.5 font-bold text-xs uppercase tracking-wide border border-b-0 border-slate-800">
              Future cash flow statement (Continued)
            </div>
            <table className="w-full border-collapse border border-slate-800 text-[9.5px]">
              <thead className="bg-slate-100 font-bold border-b border-slate-800 text-center">
                <tr className="divide-x divide-slate-800">
                  <th className="p-1 w-12">Year</th>
                  <th className="p-1 text-right">EOY Fund Goal</th>
                  <th className="p-1 text-right">Withdraw</th>
                  <th className="p-1 text-right">EOY Fund Bal</th>
                  <th className="p-1 w-14">Your Age</th>
                  <th className="p-1 w-12">Tenure</th>
                  <th className="p-1 text-right">SIP</th>
                  <th className="p-1 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {cashFlowPage2.map((row) => (
                  <tr key={row.year} className="divide-x divide-slate-800 text-center">
                    <td className="p-1 font-semibold">{row.year}</td>
                    <td className="p-1 text-right">{formatINR(row.eoyFundGoal)}</td>
                    <td className="p-1 text-right text-rose-700 font-semibold">
                      {row.withdraw ? formatINR(row.withdraw) : "—"}
                    </td>
                    <td className="p-1 text-right font-bold text-slate-900">
                      {formatINR(row.eoyFundBal)}
                    </td>
                    <td className="p-1">{row.age}</td>
                    <td className="p-1">{row.tenure}</td>
                    <td className="p-1 text-right font-medium">{formatINR(row.sip)}</td>
                    <td className="p-1 text-right">{formatINR(row.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABLE 8: PENSION PLAN */}
          <div className="mb-4">
            <div className="bg-[#234a9b] text-white text-center py-0.5 font-bold text-xs uppercase tracking-wide border border-b-0 border-slate-800">
              PENSION PLAN
            </div>

            {/* Pension Metadata Grid */}
            <div className="border border-slate-800 divide-y divide-slate-800 text-[10.5px]">
              <div className="grid grid-cols-2 divide-x divide-slate-800">
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Investment</span>
                  <span className="font-bold">{pensionPlan.investment}</span>
                </div>
                <div className="p-1 flex justify-between bg-slate-50">
                  <span className="font-bold text-slate-800">Retirement Fund</span>
                  <span className="font-bold text-blue-900">{formatINR(pensionPlan.retirementFund)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-800">
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Inflation /Pension Rate</span>
                  <span className="font-bold">{pensionPlan.inflationPensionRate}</span>
                </div>
                <div className="p-1 flex justify-between">
                  <span className="font-medium">Return</span>
                  <span className="font-bold">{pensionPlan.returnRate}</span>
                </div>
              </div>
            </div>

            {/* 30-Year Pension Projection Schedule */}
            <table className="w-full border-collapse border border-slate-800 text-[9px] mt-2">
              <thead className="bg-slate-100 font-bold border-b border-slate-800 text-center">
                <tr className="divide-x divide-slate-800">
                  <th className="p-1 w-12">Age</th>
                  <th className="p-1 w-12">Years</th>
                  <th className="p-1 text-right">Monthly Pension</th>
                  <th className="p-1 text-right">Total Pension Received</th>
                  <th className="p-1 text-right">Value of corpus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {pensionPlan.schedule.map((p) => (
                  <tr key={p.years} className="divide-x divide-slate-800 text-center">
                    <td className="p-1 font-semibold">{p.age}</td>
                    <td className="p-1">{p.years}</td>
                    <td className="p-1 text-right font-medium text-emerald-800">
                      {formatINR(p.monthlyPension)}
                    </td>
                    <td className="p-1 text-right text-slate-700">
                      {formatINR(p.totalPensionReceived)}
                    </td>
                    <td className="p-1 text-right font-bold text-slate-900">
                      {formatINR(p.valueOfCorpus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommendations Box */}
          <div className="border border-slate-800 mb-4">
            <div className="bg-[#234a9b] text-white text-center py-0.5 font-bold text-xs uppercase tracking-wide">
              Recommendations
            </div>
            <div className="p-2.5 text-xs text-slate-800 font-medium leading-relaxed bg-slate-50">
              {recommendations.summary}
            </div>
          </div>

          {/* Document Footer Sign-off */}
          <div className="pt-3 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
            <div>
              <span>JDI Wealth Management • Confidential Financial Advisory Document</span>
            </div>
            <div className="text-right">
              <span>Prepared for {clientProfile.name} • {clientProfile.reportDate}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>

      {/* Share Report Modal (WhatsApp & Email) */}
      <ShareReportModal
        submission={submission}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

export default function AdminReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
          <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  );
}
