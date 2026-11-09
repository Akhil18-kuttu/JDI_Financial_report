"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Check, Bookmark, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { WIZARD_STEPS } from "@/lib/validations/clientFormSchema";
import { formatINR } from "@/lib/utils/formatters";

export default function StepIndicator({
  currentStep,
  totalSteps = 11,
  completedSteps = [],
  onStepClick,
  draftSavedTime,
  onSaveDraft,
  onFillMockData,
  financialSummary,
}) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const currentStepObj = WIZARD_STEPS.find((s) => s.id === currentStep) || WIZARD_STEPS[0];
  const completedCount = completedSteps.length;
  const percentComplete = Math.round((completedCount / (totalSteps - 1)) * 100);

  // Check scroll position to show/hide scroll arrows
  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  // AUTO-SCROLL TO ACTIVE STEP:
  // When user clicks "Save & Continue" or jumps step, automatically scroll stepper to center active step!
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const activeEl = container.querySelector('[data-active="true"]');
    if (activeEl) {
      // Calculate scroll offset to center the active button
      const containerWidth = container.clientWidth;
      const elementLeft = activeEl.offsetLeft;
      const elementWidth = activeEl.clientWidth;

      container.scrollTo({
        left: elementLeft - containerWidth / 2 + elementWidth / 2,
        behavior: "smooth",
      });
    }

    setTimeout(checkScroll, 350);
  }, [currentStep]);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      {/* Top Brand Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Official JDI Wealth Logo from jdiwealth.com */}
        <div className="flex items-center gap-3">
          <a
            href="https://www.jdiwealth.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group"
          >
            {/* Logo Image */}
            <div className="relative h-9 w-32 sm:w-36">
              <Image
                src="/jdi-logo.png"
                alt="JDI Wealth"
                fill
                sizes="150px"
                className="object-contain object-left"
                priority
              />
            </div>
          </a>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-slate-800 leading-tight">
              Client Financial Planning Form
            </h1>
            <p className="text-[11px] text-slate-400">Secure & Confidential</p>
          </div>
        </div>

        {/* Live Metrics & Save Draft */}
        <div className="flex items-center gap-3">
          {financialSummary?.monthlyIncome > 0 && (
            <div className="hidden md:flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-500">Monthly Surplus:</span>
              <span
                className={`font-semibold ${
                  financialSummary.surplus >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {formatINR(financialSummary.surplus)}
              </span>
            </div>
          )}

          {/* Fill Mock Data Button for Testing */}
          {onFillMockData && (
            <button
              type="button"
              onClick={onFillMockData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer"
              title="Quickly fill sample financial data across all form sections"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Fill Mock Data</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSaveDraft}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-400" />
            <span>{draftSavedTime ? `Draft Saved ${draftSavedTime}` : "Save Draft"}</span>
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-100 h-1">
        <div
          className="bg-emerald-500 h-full transition-all duration-300"
          style={{ width: `${Math.max(8, percentComplete)}%` }}
        />
      </div>

      {/* Responsive Horizontal Stepper with Auto-Centering and Scroll Arrows */}
      <div className="relative max-w-4xl mx-auto px-2 sm:px-4 py-2">
        {/* Left Scroll Arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={handleScrollLeft}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white/95 hover:bg-white text-slate-700 rounded-full shadow-md border border-slate-200 flex items-center justify-center transition-all cursor-pointer"
            title="Scroll steps left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Right Scroll Arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={handleScrollRight}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white/95 hover:bg-white text-slate-700 rounded-full shadow-md border border-slate-200 flex items-center justify-center transition-all cursor-pointer"
            title="Scroll steps right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable Container with automatic active-item centering */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex items-center gap-1.5 overflow-x-auto scroll-smooth py-1 px-3 no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {WIZARD_STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id) || step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <button
                key={step.id}
                type="button"
                data-active={isCurrent ? "true" : "false"}
                onClick={() => onStepClick(step.id)}
                disabled={!isCompleted && !isCurrent && step.id > currentStep + 1}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isCurrent
                    ? "bg-blue-600 text-white font-bold shadow-xs ring-2 ring-blue-400/40"
                    : isCompleted
                    ? "bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                    : "text-slate-400 hover:text-slate-600 bg-slate-50 border border-transparent opacity-70"
                }`}
              >
                {/* Step badge: Green checkmark for completed, White pill for current, Gray number for upcoming */}
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                    isCurrent
                      ? "bg-white text-blue-700"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : (
                    step.id
                  )}
                </span>

                <span>{step.label}</span>

                {/* Additional green tick badge when completed */}
                {isCompleted && !isCurrent && (
                  <span className="text-emerald-600 text-[11px] font-bold">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Subheader: Always clearly informs the user which step they are on */}
      <div className="bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded text-[11px]">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="font-bold text-slate-900">{currentStepObj.title}</span>
            <span className="text-slate-400 hidden sm:inline">• {currentStepObj.description}</span>
          </div>
          <div className="text-slate-500 font-semibold text-[11px]">
            {percentComplete}% Completed
          </div>
        </div>
      </div>
    </header>
  );
}
