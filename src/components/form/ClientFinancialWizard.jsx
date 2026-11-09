"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  clientFinancialFormSchema,
  STEP_FIELDS,
  WIZARD_STEPS,
} from "@/lib/validations/clientFormSchema";
import {
  defaultFormValues,
  saveDraftToStorage,
  loadDraftFromStorage,
  submitFinancialForm,
} from "@/lib/services/formStorage";
import { sampleClientData } from "@/lib/services/mockData";
import {
  calculateTotalMonthlyIncome,
  calculateTotalMonthlyExpenses,
  calculateSurplus,
  calculateTotalAssets,
  calculateTotalLiabilities,
  calculateNetWorth,
} from "@/lib/utils/calculations";

// Step UI Components
import StepIndicator from "./StepIndicator";
import NavigationButtons from "./NavigationButtons";
import StepPersonal from "./StepPersonal";
import StepFamily from "./StepFamily";
import StepIncome from "./StepIncome";
import StepExpenses from "./StepExpenses";
import StepAssets from "./StepAssets";
import StepLiabilities from "./StepLiabilities";
import StepInvestments from "./StepInvestments";
import StepGoals from "./StepGoals";
import StepRetirement from "./StepRetirement";
import StepAdditional from "./StepAdditional";
import StepReview from "./StepReview";
import SubmissionSuccess from "./SubmissionSuccess";

export default function ClientFinancialWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [draftSavedTime, setDraftSavedTime] = useState("");
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState(null);

  // Initialize React Hook Form
  const form = useForm({
    resolver: zodResolver(clientFinancialFormSchema),
    defaultValues: defaultFormValues,
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = form;

  // Watch form values for dynamic calculations and real-time updates
  const watchedValues = watch();
  const incomes = watchedValues.incomes || [];
  const expenses = watchedValues.expenses || {};
  const assets = watchedValues.assets || [];
  const liabilities = watchedValues.liabilities || [];
  const investments = watchedValues.investments || [];
  const goals = watchedValues.goals || [];
  const familyMembers = watchedValues.familyMembers || [];

  // Live Calculation Engine metrics for banner & stepper
  const financialSummary = useMemo(() => {
    const totalIncome = calculateTotalMonthlyIncome(incomes);
    const totalExpenses = calculateTotalMonthlyExpenses(expenses);
    const surplus = calculateSurplus(totalIncome, totalExpenses);
    const totalAssets = calculateTotalAssets(assets);
    const totalLiab = calculateTotalLiabilities(liabilities);
    const netWorth = calculateNetWorth(totalAssets, totalLiab);

    return {
      monthlyIncome: totalIncome,
      monthlyExpenses: totalExpenses,
      surplus,
      totalAssets,
      totalLiabilities: totalLiab,
      netWorth,
    };
  }, [incomes, expenses, assets, liabilities]);

  // Load draft from localStorage on initial mount
  useEffect(() => {
    const draft = loadDraftFromStorage();
    if (draft && draft.formData) {
      reset(draft.formData);
      if (draft.currentStep && draft.currentStep >= 1 && draft.currentStep <= 11) {
        setCurrentStep(draft.currentStep);
        // Mark all steps up to draft.currentStep - 1 as completed
        const prevCompleted = Array.from({ length: draft.currentStep - 1 }, (_, i) => i + 1);
        setCompletedSteps(prevCompleted);
      }
      if (draft.savedAt) {
        setDraftSavedTime(new Date(draft.savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    }
  }, [reset]);

  // Save draft helper
  const handleSaveDraft = () => {
    setIsDraftSaving(true);
    const currentValues = form.getValues();
    saveDraftToStorage(currentValues, currentStep);
    setTimeout(() => {
      setIsDraftSaving(false);
      setDraftSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 300);
  };

  // One-click mock data loader for easy testing
  const handleFillMockData = () => {
    reset(sampleClientData);
    setCompletedSteps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    saveDraftToStorage(sampleClientData, currentStep);
    setDraftSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  };

  // Next step handler with scoped step validation and green tick recording
  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep];
    if (fieldsToValidate && fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) {
        window.scrollTo({ top: 120, behavior: "smooth" });
        return;
      }
    }

    // Mark current step as completed (will show green tick)
    setCompletedSteps((prev) => Array.from(new Set([...prev, currentStep])));

    // Pre-populate retirement age from personal info age if empty
    if (currentStep === 1) {
      const ageVal = form.getValues("age");
      if (ageVal && !form.getValues("currentAge")) {
        setValue("currentAge", ageVal);
      }
    }

    // Auto-save draft on step transition
    const currentValues = form.getValues();
    saveDraftToStorage(currentValues, currentStep + 1);

    setCurrentStep((prev) => Math.min(11, prev + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Back step handler
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Jump to specific step from stepper or Review screen
  const handleJumpToStep = (stepNumber) => {
    setCurrentStep(stepNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Dynamic Array Handlers for Step 2: Family
  const handleAddFamilyMember = () => {
    const current = form.getValues("familyMembers") || [];
    setValue(
      "familyMembers",
      [
        ...current,
        {
          id: `fam-${Date.now()}`,
          name: "",
          relationship: "Spouse",
          age: "",
          occupation: "",
          isDependent: true,
        },
      ],
      { shouldDirty: true }
    );
  };

  const handleRemoveFamilyMember = (index) => {
    const current = form.getValues("familyMembers") || [];
    setValue(
      "familyMembers",
      current.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  const handleUpdateFamilyMember = (index, field, value) => {
    const current = [...(form.getValues("familyMembers") || [])];
    if (current[index]) {
      current[index] = { ...current[index], [field]: value };
      setValue("familyMembers", current, { shouldDirty: true });
    }
  };

  // Dynamic Array Handlers for Step 3: Income
  const handleAddIncome = () => {
    const current = form.getValues("incomes") || [];
    setValue(
      "incomes",
      [
        ...current,
        {
          id: `inc-${Date.now()}`,
          type: "Salary",
          frequency: "monthly",
          amount: "",
          description: "",
        },
      ],
      { shouldDirty: true }
    );
  };

  const handleRemoveIncome = (index) => {
    const current = form.getValues("incomes") || [];
    if (current.length <= 1) return;
    setValue(
      "incomes",
      current.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  const handleUpdateIncome = (index, field, value) => {
    const current = [...(form.getValues("incomes") || [])];
    if (current[index]) {
      current[index] = { ...current[index], [field]: value };
      setValue("incomes", current, { shouldDirty: true });
    }
  };

  // Dynamic Array Handlers for Step 5: Assets
  const handleAddAsset = () => {
    const current = form.getValues("assets") || [];
    setValue(
      "assets",
      [
        ...current,
        {
          id: `ast-${Date.now()}`,
          type: "Savings Account",
          institution: "",
          currentValue: "",
          description: "",
        },
      ],
      { shouldDirty: true }
    );
  };

  const handleRemoveAsset = (index) => {
    const current = form.getValues("assets") || [];
    setValue(
      "assets",
      current.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  const handleUpdateAsset = (index, field, value) => {
    const current = [...(form.getValues("assets") || [])];
    if (current[index]) {
      current[index] = { ...current[index], [field]: value };
      setValue("assets", current, { shouldDirty: true });
    }
  };

  // Dynamic Array Handlers for Step 6: Liabilities
  const handleAddLiability = () => {
    const current = form.getValues("liabilities") || [];
    setValue(
      "liabilities",
      [
        ...current,
        {
          id: `lia-${Date.now()}`,
          type: "Home Loan",
          lender: "",
          outstandingAmount: "",
          emi: "",
          interestRate: "",
          remainingTenureMonths: "",
        },
      ],
      { shouldDirty: true }
    );
  };

  const handleRemoveLiability = (index) => {
    const current = form.getValues("liabilities") || [];
    setValue(
      "liabilities",
      current.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  const handleUpdateLiability = (index, field, value) => {
    const current = [...(form.getValues("liabilities") || [])];
    if (current[index]) {
      current[index] = { ...current[index], [field]: value };
      setValue("liabilities", current, { shouldDirty: true });
    }
  };

  // Dynamic Array Handlers for Step 7: Investments
  const handleAddInvestment = () => {
    const current = form.getValues("investments") || [];
    setValue(
      "investments",
      [
        ...current,
        {
          id: `inv-${Date.now()}`,
          type: "Mutual Funds",
          name: "",
          currentValue: "",
          monthlySIP: "",
          initialInvestment: "",
          expectedReturn: 12,
          linkedGoal: "Unallocated / Flexible",
          maturityDate: "",
        },
      ],
      { shouldDirty: true }
    );
  };

  const handleRemoveInvestment = (index) => {
    const current = form.getValues("investments") || [];
    setValue(
      "investments",
      current.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  const handleUpdateInvestment = (index, field, value) => {
    const current = [...(form.getValues("investments") || [])];
    if (current[index]) {
      current[index] = { ...current[index], [field]: value };
      setValue("investments", current, { shouldDirty: true });
    }
  };

  // Dynamic Array Handlers for Step 8: Goals
  const handleAddGoalWithPreset = (preset) => {
    const current = form.getValues("goals") || [];
    const currentYear = new Date().getFullYear();
    const targetYear = currentYear + (preset.category === "Retirement" ? 25 : 5);

    setValue(
      "goals",
      [
        ...current,
        {
          id: `gol-${Date.now()}`,
          category: preset.category,
          goalName: preset.defaultName,
          beneficiary: "Self",
          currentCost: preset.defaultCost || 1000000,
          targetYear,
          yearsRemaining: targetYear - currentYear,
          inflationRate: preset.inflation || 6,
          expectedReturn: preset.expReturn || 12,
          allocatedInvestment: 0,
          priority: "High",
        },
      ],
      { shouldDirty: true }
    );
  };

  const handleRemoveGoal = (index) => {
    const current = form.getValues("goals") || [];
    setValue(
      "goals",
      current.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  const handleUpdateGoal = (index, field, value) => {
    const current = [...(form.getValues("goals") || [])];
    if (current[index]) {
      current[index] = { ...current[index], [field]: value };
      setValue("goals", current, { shouldDirty: true });
    }
  };

  // Final Submission Handler (Strictly only permitted on Step 11: Review)
  const onSubmit = async (data) => {
    // HARD GUARD: Never auto-submit if user is on Steps 1 to 10
    if (currentStep < 11) {
      handleNext();
      return;
    }

    if (!data.confirmationAgreed) {
      await trigger(["confirmationAgreed"]);
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const record = submitFinancialForm(data);
      setSubmittedRecord(record);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onValidationError = (validationErrors) => {
    console.warn("Validation errors on submit:", validationErrors);
    const errorKeys = Object.keys(validationErrors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      let foundStep = 1;
      for (const [stepNum, fields] of Object.entries(STEP_FIELDS)) {
        if (fields.some((f) => firstKey.startsWith(f.split(".")[0]))) {
          foundStep = parseInt(stepNum, 10);
          break;
        }
      }
      if (foundStep < 11 && currentStep === 11) {
        alert(
          `Please check Step ${foundStep} - some required fields need to be completed before submitting.`
        );
        handleJumpToStep(foundStep);
      }
    }
  };

  // Reset form to start a new submission
  const handleStartNew = () => {
    setSubmittedRecord(null);
    setCurrentStep(1);
    setCompletedSteps([]);
    reset(defaultFormValues);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If successfully submitted, show final confirmation screen
  if (submittedRecord) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <StepIndicator
          currentStep={11}
          totalSteps={11}
          completedSteps={Array.from({ length: 11 }, (_, i) => i + 1)}
          onStepClick={() => {}}
          draftSavedTime=""
          onSaveDraft={() => {}}
          financialSummary={financialSummary}
        />
        <main className="flex-1">
          <SubmissionSuccess submission={submittedRecord} onStartNew={handleStartNew} />
        </main>
        <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
          <a
            href="https://www.jdiwealth.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-slate-600 font-medium"
          >
            JDI Wealth
          </a>{" "}
          • Confidential Client Financial Information Form
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Sticky Step Indicator & Header */}
      <StepIndicator
        currentStep={currentStep}
        totalSteps={11}
        completedSteps={completedSteps}
        onStepClick={handleJumpToStep}
        draftSavedTime={draftSavedTime}
        onSaveDraft={handleSaveDraft}
        onFillMockData={handleFillMockData}
        financialSummary={financialSummary}
      />

      {/* Main Form Body (Clean Paper Sheet Layout) */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <form
          onSubmit={handleSubmit(onSubmit, onValidationError)}
          onKeyDown={(e) => {
            // Prevent accidental submit when pressing Enter in input fields before step 11
            if (e.key === "Enter" && e.target.tagName === "INPUT" && currentStep !== 11) {
              e.preventDefault();
            }
          }}
          noValidate
        >
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            {currentStep === 1 && (
              <StepPersonal
                register={register}
                watch={watch}
                setValue={setValue}
                errors={errors}
              />
            )}

            {currentStep === 2 && (
              <StepFamily
                familyMembers={familyMembers}
                onAddMember={handleAddFamilyMember}
                onRemoveMember={handleRemoveFamilyMember}
                onUpdateMember={handleUpdateFamilyMember}
              />
            )}

            {currentStep === 3 && (
              <StepIncome
                incomes={incomes}
                onAddIncome={handleAddIncome}
                onRemoveIncome={handleRemoveIncome}
                onUpdateIncome={handleUpdateIncome}
                errors={errors}
              />
            )}

            {currentStep === 4 && (
              <StepExpenses
                register={register}
                watch={watch}
                incomes={incomes}
                errors={errors}
              />
            )}

            {currentStep === 5 && (
              <StepAssets
                assets={assets}
                onAddAsset={handleAddAsset}
                onRemoveAsset={handleRemoveAsset}
                onUpdateAsset={handleUpdateAsset}
              />
            )}

            {currentStep === 6 && (
              <StepLiabilities
                liabilities={liabilities}
                assets={assets}
                onAddLiability={handleAddLiability}
                onRemoveLiability={handleRemoveLiability}
                onUpdateLiability={handleUpdateLiability}
              />
            )}

            {currentStep === 7 && (
              <StepInvestments
                investments={investments}
                onAddInvestment={handleAddInvestment}
                onRemoveInvestment={handleRemoveInvestment}
                onUpdateInvestment={handleUpdateInvestment}
              />
            )}

            {currentStep === 8 && (
              <StepGoals
                goals={goals}
                onAddGoalWithPreset={handleAddGoalWithPreset}
                onRemoveGoal={handleRemoveGoal}
                onUpdateGoal={handleUpdateGoal}
                errors={errors}
              />
            )}

            {currentStep === 9 && (
              <StepRetirement register={register} watch={watch} errors={errors} />
            )}

            {currentStep === 10 && (
              <StepAdditional register={register} watch={watch} setValue={setValue} />
            )}

            {currentStep === 11 && (
              <StepReview
                formData={watchedValues}
                onJumpToStep={handleJumpToStep}
                register={register}
                errors={errors}
                isSubmitting={isSubmitting}
              />
            )}
          </div>

          {/* Wizard Navigation Controls */}
          <NavigationButtons
            currentStep={currentStep}
            totalSteps={11}
            onBack={handleBack}
            onNext={handleNext}
            onSaveDraft={handleSaveDraft}
            isSubmitting={isSubmitting}
            isDraftSaving={isDraftSaving}
          />
        </form>
      </main>

      {/* Clean User Footer (No Admin Dashboard Button) */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            <span>
              © 2026{" "}
              <a
                href="https://www.jdiwealth.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 font-medium hover:underline"
              >
                JDI Wealth
              </a>
              . All client financial data is confidential & securely stored.
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            <span>AMFI-Registered Mutual Fund Distributor</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
