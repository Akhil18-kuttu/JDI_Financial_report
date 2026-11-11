"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Users,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  LogOut,
  ExternalLink,
  Eye,
  Edit3,
  Trash2,
  Search,
  Filter,
  X,
  AlertTriangle,
  Building,
  Target,
  Scale,
  Calendar,
  Landmark,
  RefreshCw,
  Share2,
  Bell,
  UserPlus,
  Plus,
} from "lucide-react";
import ShareReportModal from "@/components/admin/ShareReportModal";
import {
  getAllSubmissions,
  updateSubmissionStatus,
  deleteSubmission,
  getAdminSession,
  clearAdminSession,
  SUBMISSION_STATUSES,
} from "@/lib/services/formStorage";
import { formatINR, formatDate } from "@/lib/utils/formatters";
import {
  calculateTotalMonthlyIncome,
  calculateTotalMonthlyExpenses,
  calculateSurplus,
  calculateTotalAssets,
  calculateTotalLiabilities,
  calculateNetWorth,
} from "@/lib/utils/calculations";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [shareTargetSubmission, setShareTargetSubmission] = useState(null);
  const [newSubmissionAlert, setNewSubmissionAlert] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ref to track known submissions and detect newly submitted records
  const knownSubmissionsRef = useRef(null);

  // Web Audio chime for non-intrusive alert
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (_) {}
  };

  const triggerAlert = (record) => {
    if (!record) return;
    const alertData = {
      submissionId: record.submissionId,
      clientName: record.clientName || record.data?.fullName || "New Applicant",
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      record,
    };
    setNewSubmissionAlert(alertData);
    playNotificationSound();
  };

  const refreshSubmissions = (isPeriodic = false) => {
    const all = getAllSubmissions();
    setSubmissions(all);

    // If we have previous count and new submissions arrived
    if (knownSubmissionsRef.current !== null && all.length > knownSubmissionsRef.current) {
      const newest = all[0];
      triggerAlert(newest);
    }
    knownSubmissionsRef.current = all.length;
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshSubmissions(false);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Authentication check & Real-time Live Submissions Sync across tabs/windows
  useEffect(() => {
    const userSession = getAdminSession();
    if (!userSession) {
      router.replace("/adminlogin");
      return;
    }

    setSession(userSession);
    const initialSubmissions = getAllSubmissions();
    setSubmissions(initialSubmissions);
    knownSubmissionsRef.current = initialSubmissions.length;
    setIsLoaded(true);

    // 1. Cross-tab localStorage updates
    const handleStorage = (e) => {
      if (!e.key || e.key === "jdi_client_submissions") {
        refreshSubmissions(true);
      }
    };
    window.addEventListener("storage", handleStorage);

    // 2. Window focus (when switching to the admin tab)
    window.addEventListener("focus", () => refreshSubmissions(true));

    // 3. In-tab custom submission event
    const handleNewSubmissionEvent = (e) => {
      refreshSubmissions(true);
      if (e.detail) {
        triggerAlert(e.detail);
      }
    };
    window.addEventListener("jdi_new_submission", handleNewSubmissionEvent);

    // 4. Cross-tab BroadcastChannel
    let channel = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        channel = new BroadcastChannel("jdi_submissions_channel");
        channel.onmessage = (msg) => {
          refreshSubmissions(true);
          if (msg.data?.type === "NEW_SUBMISSION" && msg.data?.record) {
            triggerAlert(msg.data.record);
          }
        };
      }
    } catch (_) {}

    // 5. Short periodic polling interval (every 2 seconds) for guaranteed zero-reload updates
    const interval = setInterval(() => refreshSubmissions(true), 2000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", () => refreshSubmissions(true));
      window.removeEventListener("jdi_new_submission", handleNewSubmissionEvent);
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, [router]);

  const handleLogout = () => {
    clearAdminSession();
    router.replace("/adminlogin");
  };

  const handleStatusChange = (submissionId, newStatus) => {
    updateSubmissionStatus(submissionId, newStatus);
    setSubmissions(getAllSubmissions());
    if (selectedSubmission && selectedSubmission.submissionId === submissionId) {
      setSelectedSubmission((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleDelete = (submissionId) => {
    if (confirm(`Are you sure you want to delete submission ${submissionId}?`)) {
      deleteSubmission(submissionId);
      setSubmissions(getAllSubmissions());
      if (selectedSubmission?.submissionId === submissionId) {
        setSelectedSubmission(null);
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.submissionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalSubmissions = submissions.length;
  const newSubmissionsCount = submissions.filter((s) => s.status === SUBMISSION_STATUSES.NEW).length;
  const underReviewCount = submissions.filter(
    (s) => s.status === SUBMISSION_STATUSES.UNDER_REVIEW || s.status === SUBMISSION_STATUSES.CALCULATING
  ).length;
  const verifiedCount = submissions.filter(
    (s) => s.status === SUBMISSION_STATUSES.VERIFIED || s.status === SUBMISSION_STATUSES.REPORT_READY
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col w-full max-w-[100vw] overflow-x-hidden">
      {/* Top Admin Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="https://www.jdiwealth.com/" target="_blank" rel="noopener noreferrer">
              <div className="relative h-8 w-32">
                <Image
                  src="/jdi-logo.png"
                  alt="JDI Wealth"
                  fill
                  sizes="130px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </a>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 hidden sm:inline-block">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="/form"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium"
            >
              <span>Open Client Form</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                A
              </div>
              <span className="font-medium text-slate-700 hidden md:inline-block">
                {session?.username || "Administrator"}
              </span>
            </div>

            {/* Real-time Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (submissions.length > 0) {
                    triggerAlert(submissions[0]);
                  }
                }}
                className="relative p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Submission Alert Status"
              >
                <Bell className="w-4 h-4" />
                {newSubmissionAlert && (
                  <>
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-rose-600 font-medium px-2 py-1 rounded transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Real-time New Submission Alert Message */}
        {newSubmissionAlert && (
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-lg border border-blue-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400 flex items-center justify-center shrink-0 text-amber-300 shadow-inner">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                    New Submission Alert
                  </span>
                  <span className="text-xs text-blue-200">{newSubmissionAlert.time}</span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">
                  <span className="text-amber-300 font-extrabold">{newSubmissionAlert.clientName}</span> has just submitted a new personal details form!
                  <span className="font-mono text-xs text-blue-200 ml-2 font-normal">
                    (Ref: {newSubmissionAlert.submissionId})
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Mobile: {newSubmissionAlert.record.mobile || "N/A"} • Email: {newSubmissionAlert.record.email || "N/A"} • Status: NEW
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedSubmission(newSubmissionAlert.record);
                  setNewSubmissionAlert(null);
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                View Client Details
              </button>
              <button
                type="button"
                onClick={() => setNewSubmissionAlert(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Dismiss Alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Page Title & Quick Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Client Submissions Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, verify, and update the status of client financial planning records.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            {/* Manual Refresh Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shadow-2xs cursor-pointer"
              title="Refresh submissions"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
              <span>Refresh</span>
            </button>

            {/* Admin Direct Add Client Button */}
            <a
              href="/admin/edit?id=new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Create new client financial portfolio from scratch"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add New Client</span>
            </a>

            <a
              href="/form"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <span className="hidden sm:inline">Open Client Form</span>
              <span className="sm:hidden">Client Form</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Total Submissions</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{totalSubmissions}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
            <span className="text-xs font-medium text-blue-700 block">New (Action Required)</span>
            <span className="text-2xl font-bold text-blue-600 mt-1 block">{newSubmissionsCount}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
            <span className="text-xs font-medium text-amber-700 block">Under Review</span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">{underReviewCount}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
            <span className="text-xs font-medium text-emerald-700 block">Verified / Ready</span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">{verifiedCount}</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by client name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-500 shrink-0">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              {Object.values(SUBMISSION_STATUSES).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          {filteredSubmissions.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3 px-4">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700 text-sm">No Client Submissions Found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add a new client profile directly as an administrator, or open the client form to enter details.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                <a
                  href="/admin/edit?id=new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 shadow-xs transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add New Client</span>
                </a>
                <a
                  href="/form"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-xs transition-colors"
                >
                  <span>Go to Client Form (/form)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs text-slate-600 min-w-[860px]">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">ID & Date</th>
                    <th className="px-4 py-3">Client Details</th>
                    <th className="px-4 py-3">Financial Profile</th>
                    <th className="px-4 py-3">Workflow Status</th>
                    <th className="px-4 py-3 text-center">Financial Report</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredSubmissions.map((sub) => {
                    const data = sub.data || {};
                    const monthlyIncome = calculateTotalMonthlyIncome(data.incomes);
                    const monthlyExpenses = calculateTotalMonthlyExpenses(data.expenses);
                    const surplus = calculateSurplus(monthlyIncome, monthlyExpenses);
                    const totalAssets = calculateTotalAssets(data.assets);
                    const totalLiabilities = calculateTotalLiabilities(data.liabilities);
                    const netWorth = calculateNetWorth(totalAssets, totalLiabilities);

                    return (
                      <tr key={sub.submissionId} className="hover:bg-slate-50/70 transition-colors">
                        {/* ID & Date */}
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-blue-700 block">
                            {sub.submissionId}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(sub.submittedAt)}
                          </span>
                        </td>

                        {/* Client Details */}
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-900 block text-sm">
                            {sub.clientName}
                          </span>
                          <span className="text-[11px] text-slate-500 block">{sub.email}</span>
                          <span className="text-[11px] text-slate-400">+91 {sub.mobile}</span>
                        </td>

                        {/* Financial Profile */}
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <div>
                              <span className="text-slate-400">Net Worth: </span>
                              <strong className="text-slate-900">{formatINR(netWorth)}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400">Income / Surplus: </span>
                              <span className="font-medium text-slate-700">
                                {formatINR(monthlyIncome)} ({formatINR(surplus)}/mo)
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status Dropdown */}
                        <td className="px-4 py-3">
                          <select
                            value={sub.status || SUBMISSION_STATUSES.NEW}
                            onChange={(e) => handleStatusChange(sub.submissionId, e.target.value)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer ${
                              sub.status === SUBMISSION_STATUSES.NEW
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : sub.status === SUBMISSION_STATUSES.VERIFIED ||
                                  sub.status === SUBMISSION_STATUSES.REPORT_READY
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {Object.values(SUBMISSION_STATUSES).map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Financial Report & Share Column */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <a
                              href={`/admin/report?id=${sub.submissionId}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-2xs"
                              title="Generate / View Client Financial Planning Report"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Report</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => setShareTargetSubmission(sub)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
                              title="Share Report via WhatsApp or Email to this customer"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Share</span>
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {/* View Profile & Edit stacked in a column */}
                            <div className="flex flex-col gap-1.5 min-w-[105px]">
                              <button
                                type="button"
                                onClick={() => setSelectedSubmission(sub)}
                                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Profile</span>
                              </button>

                              <a
                                href={`/admin/edit?id=${sub.submissionId}`}
                                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Data</span>
                              </a>
                            </div>

                            {/* Delete moved last */}
                            <button
                              type="button"
                              onClick={() => handleDelete(sub.submissionId)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                              title="Delete Submission"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Comprehensive Client Profile Drawer / Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                  JD
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-blue-300 font-bold">
                      {selectedSubmission.submissionId}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                      {selectedSubmission.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {selectedSubmission.clientName}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`/admin/report?id=${selectedSubmission.submissionId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Report</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShareTargetSubmission(selectedSubmission)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
                  title="Share Report via WhatsApp or Email"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Report</span>
                </button>

                <a
                  href={`/admin/edit?id=${selectedSubmission.submissionId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Data</span>
                </a>

                <select
                  value={selectedSubmission.status}
                  onChange={(e) =>
                    handleStatusChange(selectedSubmission.submissionId, e.target.value)
                  }
                  className="bg-slate-800 text-white text-xs border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none"
                >
                  {Object.values(SUBMISSION_STATUSES).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Summary KPIs */}
              {(() => {
                const d = selectedSubmission.data || {};
                const inc = calculateTotalMonthlyIncome(d.incomes);
                const exp = calculateTotalMonthlyExpenses(d.expenses);
                const sur = calculateSurplus(inc, exp);
                const ast = calculateTotalAssets(d.assets);
                const liab = calculateTotalLiabilities(d.liabilities);
                const nw = calculateNetWorth(ast, liab);

                return (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Monthly Income</span>
                      <span className="text-sm font-bold text-slate-900">{formatINR(inc)}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Monthly Expenses</span>
                      <span className="text-sm font-bold text-slate-900">{formatINR(exp)}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Monthly Surplus</span>
                      <span className="text-sm font-bold text-emerald-600">{formatINR(sur)}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Net Worth</span>
                      <span className="text-sm font-bold text-blue-700">{formatINR(nw)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* 1. Personal & Contact */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Personal & Demographics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-slate-400 block">DOB / Age:</span>
                    <span className="font-medium text-slate-800">
                      {selectedSubmission.data?.dob} ({selectedSubmission.data?.age} yrs)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Gender:</span>
                    <span className="font-medium text-slate-800">{selectedSubmission.data?.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Occupation:</span>
                    <span className="font-medium text-slate-800">
                      {selectedSubmission.data?.occupation}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Location:</span>
                    <span className="font-medium text-slate-800">
                      {selectedSubmission.data?.city}, {selectedSubmission.data?.state}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Family */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Family Members ({selectedSubmission.data?.familyMembers?.length || 0})
                </h4>
                {selectedSubmission.data?.familyMembers?.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {selectedSubmission.data.familyMembers.map((m, i) => (
                      <div key={i} className="py-1.5 flex justify-between">
                        <span className="font-medium text-slate-800">
                          {m.name} ({m.relationship}, {m.age} yrs)
                        </span>
                        <span className="text-slate-500">
                          {m.isDependent ? "Financial Dependent" : "Self-supporting"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No family members registered.</p>
                )}
              </div>

              {/* 3. Incomes & Expenses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Income Streams
                  </h4>
                  <div className="divide-y divide-slate-100">
                    {selectedSubmission.data?.incomes?.map((inc, i) => (
                      <div key={i} className="py-1.5 flex justify-between">
                        <span>
                          {inc.type} {inc.description ? `• ${inc.description}` : ""}
                        </span>
                        <strong className="text-slate-800">
                          {formatINR(inc.amount)} ({inc.frequency})
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Monthly Expenses
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(selectedSubmission.data?.expenses || {}).map(([k, v]) => (
                      <div key={k} className="p-1.5 bg-slate-50 rounded">
                        <span className="capitalize text-slate-400 block text-[10px]">{k}</span>
                        <span className="font-semibold text-slate-800">{formatINR(v || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Assets & Liabilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Assets ({selectedSubmission.data?.assets?.length || 0})
                  </h4>
                  <div className="divide-y divide-slate-100">
                    {selectedSubmission.data?.assets?.map((a, i) => (
                      <div key={i} className="py-1.5 flex justify-between">
                        <span>
                          {a.institution} ({a.type})
                        </span>
                        <strong className="text-slate-800">{formatINR(a.currentValue)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Loans & Debt ({selectedSubmission.data?.liabilities?.length || 0})
                  </h4>
                  <div className="divide-y divide-slate-100">
                    {selectedSubmission.data?.liabilities?.map((l, i) => (
                      <div key={i} className="py-1.5 flex justify-between">
                        <span>
                          {l.type} {l.lender ? `(${l.lender})` : ""}
                        </span>
                        <strong className="text-rose-600">
                          {formatINR(l.outstandingAmount)} (EMI: {formatINR(l.emi)})
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Financial Goals */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Financial Goals ({selectedSubmission.data?.goals?.length || 0})
                </h4>
                {selectedSubmission.data?.goals?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedSubmission.data.goals.map((g, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex justify-between font-semibold text-slate-900">
                          <span>{g.goalName}</span>
                          <span className="text-blue-700">{g.targetYear}</span>
                        </div>
                        <div className="text-slate-500 mt-1">
                          Today&apos;s Cost: <strong>{formatINR(g.currentCost)}</strong> • Beneficiary:{" "}
                          {g.beneficiary}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No goals registered.</p>
                )}
              </div>

              {/* 6. Retirement & Insurance */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Retirement & Protection
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-slate-400 block">Target Retirement Age:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedSubmission.data?.retirementAge || 60} Years
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Desired Retirement Income:</span>
                    <span className="font-semibold text-slate-800">
                      {formatINR(selectedSubmission.data?.desiredMonthlyIncome)}/mo
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Term Life Cover:</span>
                    <span className="font-semibold text-slate-800">
                      {formatINR(selectedSubmission.data?.lifeInsuranceCover)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Health Insurance:</span>
                    <span className="font-semibold text-slate-800">
                      {formatINR(selectedSubmission.data?.healthInsuranceCover)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Submitted on {formatDate(selectedSubmission.submittedAt)}
              </span>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Report Modal (WhatsApp & Email) */}
      <ShareReportModal
        submission={shareTargetSubmission}
        isOpen={!!shareTargetSubmission}
        onClose={() => setShareTargetSubmission(null)}
        onStatusChange={(newStatus) => {
          if (shareTargetSubmission) {
            handleStatusChange(shareTargetSubmission.submissionId, newStatus);
          }
        }}
      />
    </div>
  );
}
