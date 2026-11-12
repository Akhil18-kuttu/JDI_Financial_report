"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { personalInfoSchema } from "@/lib/validations/clientFormSchema";
import {
  submitFinancialForm,
  loadDraftFromStorage,
  saveDraftToStorage,
} from "@/lib/services/formStorage";
import { sampleClientData } from "@/lib/services/mockData";
import { calculateAgeFromDOB } from "@/lib/utils/formatters";
import SubmissionSuccess from "./SubmissionSuccess";

const defaultValues = {
  fullName: "",
  dob: "",
  age: "",
  gender: "Male",
  mobile: "",
  email: "",
  occupation: "",
  address: "",
  city: "",
  state: "",
};

export default function ClientFinancialWizard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues,
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form;

  const dobValue = watch("dob");

  // Auto-calculate age when date of birth is selected
  useEffect(() => {
    if (dobValue) {
      const calculatedAge = calculateAgeFromDOB(dobValue);
      if (calculatedAge !== null && calculatedAge > 0) {
        setValue("age", calculatedAge, { shouldValidate: true });
      }
    }
  }, [dobValue, setValue]);

  // Load draft if available
  useEffect(() => {
    const draft = loadDraftFromStorage();
    if (draft && draft.formData) {
      reset({
        fullName: draft.formData.fullName || "",
        dob: draft.formData.dob || "",
        age: draft.formData.age || "",
        gender: draft.formData.gender || "Male",
        mobile: draft.formData.mobile || "",
        email: draft.formData.email || "",
        occupation: draft.formData.occupation || "",
        address: draft.formData.address || "",
        city: draft.formData.city || "",
        state: draft.formData.state || "",
      });
    }
  }, [reset]);

  // Quick fill sample data for fast testing
  const handleFillSample = () => {
    reset({
      fullName: sampleClientData.fullName,
      dob: sampleClientData.dob,
      age: sampleClientData.age,
      gender: sampleClientData.gender,
      mobile: sampleClientData.mobile,
      email: sampleClientData.email,
      occupation: sampleClientData.occupation,
      address: sampleClientData.address,
      city: sampleClientData.city,
      state: sampleClientData.state,
    });
  };

  // Direct submit handler - passes data to admin dashboard & displays success
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const record = submitFinancialForm(data);
      setSubmittedRecord(record);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to submit another response
  const handleStartNew = () => {
    setSubmittedRecord(null);
    reset(defaultValues);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show "Form Submitted" confirmation screen once submitted
  if (submittedRecord) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <a
              href="https://www.jdiwealth.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
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
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Form Submitted</span>
            </div>
          </div>
        </header>

        <main className="flex-1 py-8">
          <SubmissionSuccess submission={submittedRecord} onStartNew={handleStartNew} />
        </main>

        <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 text-center text-xs text-slate-400">
          © 2026 JDI Wealth • Confidential Client Information
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Brand Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="https://www.jdiwealth.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group"
            >
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
              <h1
                suppressHydrationWarning
                className="text-sm font-semibold text-slate-800 leading-tight"
              >
                Client Information Form
              </h1>
              <p className="text-[11px] text-slate-400">Secure & Confidential</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Populate form with sample personal details"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Fill Sample</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Personal Details Form */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            {/* Title & Description */}
            <div>
              <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Please provide your details below to help us design your personalized financial plan. All information is kept strictly confidential and secure. Required fields are marked with{" "}
                <span className="text-rose-500 font-semibold">*</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  {...register("fullName")}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                    errors.fullName
                      ? "border-rose-300 focus:border-rose-500"
                      : "border-slate-300 focus:border-blue-500"
                  }`}
                />
                {errors.fullName && (
                  <p className="text-xs text-rose-600 mt-1">{errors.fullName.message}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("dob")}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                    errors.dob
                      ? "border-rose-300 focus:border-rose-500"
                      : "border-slate-300 focus:border-blue-500"
                  }`}
                />
                {errors.dob && <p className="text-xs text-rose-600 mt-1">{errors.dob.message}</p>}
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Age (Years) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  placeholder="DOB"
                  {...register("age")}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                    errors.age
                      ? "border-rose-300 focus:border-rose-500"
                      : "border-slate-300 focus:border-blue-500"
                  }`}
                />
                {errors.age && <p className="text-xs text-rose-600 mt-1">{errors.age.message}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register("gender")}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-xs text-rose-600 mt-1">{errors.gender.message}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-xs font-medium text-slate-500 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    {...register("mobile")}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-r-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                      errors.mobile
                        ? "border-rose-300 focus:border-rose-500"
                        : "border-slate-300 focus:border-blue-500"
                    }`}
                  />
                </div>
                {errors.mobile && (
                  <p className="text-xs text-rose-600 mt-1">{errors.mobile.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="rajesh@example.com"
                  {...register("email")}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                    errors.email
                      ? "border-rose-300 focus:border-rose-500"
                      : "border-slate-300 focus:border-blue-500"
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Occupation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer / Business"
                  {...register("occupation")}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                    errors.occupation
                      ? "border-rose-300 focus:border-rose-500"
                      : "border-slate-300 focus:border-blue-500"
                  }`}
                />
                {errors.occupation && (
                  <p className="text-xs text-rose-600 mt-1">{errors.occupation.message}</p>
                )}
              </div>

              {/* Residential Address */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Residential Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="House/Flat No., Street, Locality"
                  {...register("address")}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                    errors.address
                      ? "border-rose-300 focus:border-rose-500"
                      : "border-slate-300 focus:border-blue-500"
                  }`}
                />
                {errors.address && (
                  <p className="text-xs text-rose-600 mt-1">{errors.address.message}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  {...register("city")}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                    errors.city
                      ? "border-rose-300 focus:border-rose-500"
                      : "border-slate-300 focus:border-blue-500"
                  }`}
                />
                {errors.city && <p className="text-xs text-rose-600 mt-1">{errors.city.message}</p>}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  State <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra"
                  {...register("state")}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                    errors.state
                      ? "border-rose-300 focus:border-rose-500"
                      : "border-slate-300 focus:border-blue-500"
                  }`}
                />
                {errors.state && (
                  <p className="text-xs text-rose-600 mt-1">{errors.state.message}</p>
                )}
              </div>
            </div>

            {/* Submit Action Bar */}
            <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your details are encrypted and kept strictly confidential.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Form</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Footer */}
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
              . All client information is confidential & securely stored.
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
