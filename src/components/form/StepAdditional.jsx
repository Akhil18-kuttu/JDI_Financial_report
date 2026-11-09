"use client";

import React, { useState } from "react";
import { UploadCloud, X, FileText } from "lucide-react";

export default function StepAdditional({ register, watch, setValue }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadError, setUploadError] = useState("");

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadError("");

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`"${file.name}" exceeds 5MB size limit.`);
        return;
      }
    }

    const newFiles = files.map((f) => ({
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
    }));

    const updated = [...uploadedFiles, ...newFiles];
    setUploadedFiles(updated);
    setValue("documentNames", updated.map((item) => item.name), { shouldValidate: true });
  };

  const removeFile = (index) => {
    const updated = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updated);
    setValue("documentNames", updated.map((item) => item.name), { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Additional Information & Insurance</h2>
        <p className="text-sm text-slate-500 mt-1">
          Provide your insurance coverage details and any notes for your financial planner.
        </p>
      </div>

      {/* Insurance Protection Inputs */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-semibold text-slate-800">Insurance & Protection</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Term Life Insurance Cover (₹)
            </label>
            <div className="relative flex rounded-lg border border-slate-300 overflow-hidden focus-within:border-blue-500">
              <span className="inline-flex items-center px-3 bg-slate-50 text-slate-500 text-xs font-semibold border-r border-slate-300">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="50000"
                placeholder="e.g. 10000000 (1 Crore)"
                {...register("lifeInsuranceCover")}
                className="w-full px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Health Insurance Cover (₹)
            </label>
            <div className="relative flex rounded-lg border border-slate-300 overflow-hidden focus-within:border-blue-500">
              <span className="inline-flex items-center px-3 bg-slate-50 text-slate-500 text-xs font-semibold border-r border-slate-300">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="50000"
                placeholder="e.g. 1000000 (10 Lakhs)"
                {...register("healthInsuranceCover")}
                className="w-full px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              {...register("hasEmergencyFund")}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">3 to 6 months emergency fund maintained</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              {...register("hasWill")}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">Registered will / estate plan executed</span>
          </label>
        </div>
      </div>

      {/* Planner Notes */}
      <div className="pt-2">
        <label className="block text-sm font-semibold text-slate-800 mb-1">
          Special Notes or Questions for Your Financial Planner
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Would like guidance on tax planning under the new tax regime, and whether to prepay my home loan early."
          {...register("plannerNotes")}
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Document Upload */}
      <div className="pt-2">
        <label className="block text-sm font-semibold text-slate-800 mb-1">
          Upload Documents (Optional)
        </label>
        <p className="text-xs text-slate-500 mb-2">
          Attach portfolio statements, ITR, or loan statements (PDF, Excel, images up to 5MB).
        </p>

        <label className="block border border-dashed border-slate-300 hover:border-blue-400 rounded-lg p-5 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/20 transition-colors">
          <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
          <span className="text-xs font-semibold text-blue-600">Choose files to upload</span>
          <span className="text-xs text-slate-400 block mt-0.5">PDF, Excel, PNG, JPG</span>
          <input
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {uploadError && <p className="text-xs text-rose-600 mt-2">{uploadError}</p>}

        {uploadedFiles.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {uploadedFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 bg-slate-100 rounded-md text-xs text-slate-700"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>{f.name}</span>
                  <span className="text-slate-400">({f.size})</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
