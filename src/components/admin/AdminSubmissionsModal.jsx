"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  X,
  Eye,
  Trash2,
  Calendar,
  User,
  ArrowRight,
  Database,
  CheckCircle2,
} from "lucide-react";
import { getAllSubmissions, STORAGE_KEYS } from "@/lib/services/formStorage";
import { formatINR, formatDate } from "@/lib/utils/formatters";

export default function AdminSubmissionsModal({ isOpen, onClose }) {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSubmissions(getAllSubmissions());
    }
  }, [isOpen]);

  const clearAllSubmissions = () => {
    if (confirm("Are you sure you want to clear all test submissions from localStorage?")) {
      localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
      setSubmissions([]);
      setSelectedSubmission(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Admin Submissions Dashboard ({submissions.length})
              </h3>
              <p className="text-xs text-slate-400">Stored locally in browser (prototype)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {submissions.length > 0 && (
              <button
                type="button"
                onClick={clearAllSubmissions}
                className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg border border-rose-900/50 hover:bg-rose-950/30 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {submissions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Database className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No client submissions found yet.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Complete and submit the client form to generate records in localStorage.
              </p>
            </div>
          ) : selectedSubmission ? (
            /* Detailed Submission Inspector */
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-2"
              >
                ← Back to All Submissions
              </button>

              <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {selectedSubmission.submissionId}
                  </span>
                  <h4 className="text-lg font-bold text-slate-900">
                    {selectedSubmission.clientName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {selectedSubmission.email} • +91 {selectedSubmission.mobile}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold bg-indigo-600 text-white px-3 py-1 rounded-full uppercase">
                    {selectedSubmission.status}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Submitted: {formatDate(selectedSubmission.submittedAt)}
                  </p>
                </div>
              </div>

              {/* Data Snapshot JSON View */}
              <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-96">
                <pre>{JSON.stringify(selectedSubmission.data, null, 2)}</pre>
              </div>
            </div>
          ) : (
            /* Submissions List */
            <div className="divide-y divide-slate-100">
              {submissions.map((sub, i) => (
                <div
                  key={sub.submissionId || i}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-3 rounded-xl transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600">
                        {sub.submissionId}
                      </span>
                      <span className="text-xs font-bold text-slate-800">• {sub.clientName}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      Submitted on {formatDate(sub.submittedAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                      {sub.status || "NEW"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedSubmission(sub)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Payload</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>In production, this feeds into the Planner Admin Portal via secure API.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white font-semibold rounded-xl text-xs hover:bg-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
