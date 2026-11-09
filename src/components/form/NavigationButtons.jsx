"use client";

import React from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export default function NavigationButtons({
  currentStep,
  totalSteps = 11,
  onBack,
  onNext,
  onSaveDraft,
  isSubmitting = false,
  isDraftSaving = false,
}) {
  const isFirstStep = currentStep === 1;
  const isReviewStep = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-8">
      {/* Back Button */}
      <div>
        {!isFirstStep && (
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}
      </div>

      {/* Primary Actions: Save Draft and Save & Continue */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSubmitting || isDraftSaving}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 px-3 py-2 transition-colors"
        >
          {isDraftSaving ? "Saving..." : "Save Draft"}
        </button>

        {!isReviewStep ? (
          <button
            type="button"
            onClick={onNext}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <span>{currentStep === 10 ? "Save & Proceed to Review" : "Save & Continue"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting Form...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Submit Financial Information</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
