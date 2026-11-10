"use client";

import React, { useState } from "react";
import {
  X,
  Share2,
  Mail,
  Send,
  CheckCircle2,
  Download,
  FileText,
  Sparkles,
} from "lucide-react";


import {
  directDownloadReportDocument,
  getWhatsAppShareText,
  getEmailShareContent,
} from "@/lib/utils/pdfExport";
import { updateSubmissionStatus, SUBMISSION_STATUSES } from "@/lib/services/formStorage";

export default function ShareReportModal({
  submission,
  isOpen,
  onClose,
  onStatusChange,
}) {
  if (!isOpen || !submission) return null;

  const clientName = submission.clientName || submission.data?.fullName || "Valued Client";
  const rawMobile = submission.data?.mobile || submission.mobile || "";
  const rawEmail = submission.data?.email || submission.email || "";
  const submissionId = submission.submissionId || "REPORT";

  // State
  const [activeTab, setActiveTab] = useState("whatsapp"); // 'whatsapp' | 'email'
  const [mobileNumber, setMobileNumber] = useState(rawMobile);
  const [emailAddress, setEmailAddress] = useState(rawEmail);
  const [whatsAppMessage, setWhatsAppMessage] = useState(() => getWhatsAppShareText(submission));
  const [emailContent, setEmailContent] = useState(() => getEmailShareContent(submission));
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [sentSuccess, setSentSuccess] = useState(null); // 'whatsapp' | 'email' | null
  const [isCopied, setIsCopied] = useState(false);

  // Clean phone number for WhatsApp link
  const getCleanPhone = () => {
    const digits = mobileNumber.replace(/[^0-9]/g, "");
    if (!digits) return "";
    return digits.length === 10 ? `91${digits}` : digits;
  };

  // 1. Direct PDF Download
  const handleDownloadPdf = () => {
    directDownloadReportDocument(submission, "printable-report-content");
  };

  // 2. Open WhatsApp Web / App
  const handleOpenWhatsApp = () => {
    const phone = getCleanPhone();
    const text = encodeURIComponent(whatsAppMessage);
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    
    // Auto-update status to SENT in storage
    updateSubmissionStatus(submissionId, SUBMISSION_STATUSES.SENT);
    if (onStatusChange) onStatusChange(SUBMISSION_STATUSES.SENT);

    window.open(url, "_blank");
    setSentSuccess("whatsapp");
  };

  // 3. Simulate Instant WhatsApp API Dispatch
  const handleSimulateWhatsAppDispatch = () => {
    setIsProcessing(true);
    setProcessingStage("Generating PDF attachment (JDI-Report)...");

    setTimeout(() => {
      setProcessingStage("Connecting to WhatsApp Gateway (+91)...");
      setTimeout(() => {
        setProcessingStage("Delivering PDF document to customer...");
        setTimeout(() => {
          setIsProcessing(false);
          setProcessingStage("");
          updateSubmissionStatus(submissionId, SUBMISSION_STATUSES.SENT);
          if (onStatusChange) onStatusChange(SUBMISSION_STATUSES.SENT);
          setSentSuccess("whatsapp");
        }, 600);
      }, 600);
    }, 600);
  };

  // 4. Open Email Client
  const handleOpenEmailClient = () => {
    const mailtoUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(
      emailContent.subject
    )}&body=${encodeURIComponent(emailContent.body)}`;
    
    updateSubmissionStatus(submissionId, SUBMISSION_STATUSES.SENT);
    if (onStatusChange) onStatusChange(SUBMISSION_STATUSES.SENT);

    window.open(mailtoUrl, "_blank");
    setSentSuccess("email");
  };

  // 5. Simulate Instant Email Dispatch
  const handleSimulateEmailDispatch = () => {
    setIsProcessing(true);
    setProcessingStage("Attaching PDF Report document (6 pages)...");

    setTimeout(() => {
      setProcessingStage(`Sending secure email to ${emailAddress}...`);
      setTimeout(() => {
        setProcessingStage("Delivered to inbox successfully!");
        setTimeout(() => {
          setIsProcessing(false);
          setProcessingStage("");
          updateSubmissionStatus(submissionId, SUBMISSION_STATUSES.SENT);
          if (onStatusChange) onStatusChange(SUBMISSION_STATUSES.SENT);
          setSentSuccess("email");
        }, 600);
      }, 600);
    }, 600);
  };

  // // 6. Copy Link
  // const handleCopyLink = () => {
  //   if (typeof window !== "undefined") {
  //     const url = `${window.location.origin}/admin/report?id=${submissionId}`;
  //     navigator.clipboard.writeText(url);
  //     setIsCopied(true);
  //     setTimeout(() => setIsCopied(false), 2500);
  //   }
  // };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-300">
                  {submissionId}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded">
                  Report Ready
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Share Report with {clientName}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client Metadata & PDF Document Attachment Badge */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900">
                JDI-Financial-Report-{submissionId}.pdf
              </div>
              <div className="text-[11px] text-slate-500">
                A4 Document • 6 Pages • Net Worth & Cashflow Projections
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Download PDF</span>
          </button>
        </div>

        {/* Success Toast Banner */}
        {sentSuccess && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-900 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong>Dispatched Successfully!</strong> Report document was shared with{" "}
                <span className="font-semibold">{clientName}</span> via{" "}
                <span className="capitalize font-bold">{sentSuccess}</span>. Status updated to{" "}
                <span className="font-mono font-bold text-emerald-700">SENT</span>.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSentSuccess(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Channel Selection Tabs */}
        <div className="px-6 pt-4 border-b border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("whatsapp")}
            className={`inline-flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "whatsapp"
                ? "border-[#25D366] text-[#128C7E]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#25D366]" />
            <span>WhatsApp Share</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("email")}
            className={`inline-flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "email"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>Email Report</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* ===================== WHATSAPP TAB ===================== */}
          {activeTab === "whatsapp" && (
            <div className="space-y-4 animate-fadeIn">
              {/* WhatsApp Recipient Phone */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer WhatsApp Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] text-slate-400">
                    India (+91)
                  </span>
                </div>
              </div>

              {/* Message Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Message Preview & PDF Attachment
                  </label>
                  <span className="text-[10px] text-slate-400">Formatted for WhatsApp</span>
                </div>
                <textarea
                  rows={6}
                  value={whatsAppMessage}
                  onChange={(e) => setWhatsAppMessage(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs font-sans text-slate-800 bg-slate-50/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#25D366]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  disabled={isProcessing}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Open WhatsApp Web / App</span>
                </button>

                <button
                  type="button"
                  onClick={handleSimulateWhatsAppDispatch}
                  disabled={isProcessing}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Simulate Instant Send</span>
                </button>
              </div>
            </div>
          )}

          {/* ===================== EMAIL TAB ===================== */}
          {activeTab === "email" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Recipient Email */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Email Address
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Email Subject */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={emailContent.subject}
                  onChange={(e) =>
                    setEmailContent((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Email Body */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Body Content
                </label>
                <textarea
                  rows={5}
                  value={emailContent.body}
                  onChange={(e) =>
                    setEmailContent((prev) => ({ ...prev, body: e.target.value }))
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs font-sans text-slate-800 bg-slate-50/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenEmailClient}
                  disabled={isProcessing}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Open in Mail Client</span>
                </button>

                <button
                  type="button"
                  onClick={handleSimulateEmailDispatch}
                  disabled={isProcessing}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Simulate Instant Send</span>
                </button>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin shrink-0" />
              <div className="text-xs font-semibold text-blue-900">
                {processingStage}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">


          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
