"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, Printer, RotateCcw } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";

export default function SubmissionSuccess({ submission, onStartNew }) {
  if (!submission) return null;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 text-center">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-xs">
        {/* JDI Wealth Logo */}
        <div className="flex justify-center mb-6">
          <a href="https://www.jdiwealth.com/" target="_blank" rel="noopener noreferrer">
            <div className="relative h-10 w-40">
              <Image
                src="/jdi-logo.png"
                alt="JDI Wealth"
                fill
                sizes="160px"
                className="object-contain"
                priority
              />
            </div>
          </a>
        </div>

        {/* Checkmark */}
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Personal Details Submitted
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
          Your personal details have been submitted successfully. Our advisory team has received your information.
        </p>

        {/* Reference Details */}
        <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Submission Reference ID:</span>
            <span className="font-mono font-bold text-blue-700">{submission.submissionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Client Name:</span>
            <span className="font-semibold text-slate-800">{submission.clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date & Time:</span>
            <span className="text-slate-700">{formatDate(submission.submittedAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">

          <button
            type="button"
            onClick={onStartNew}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Another Form</span>
          </button>
        </div>
      </div>
    </div>
  );
}
