"use client";

import React, { useEffect } from "react";
import { calculateAgeFromDOB } from "@/lib/utils/formatters";

export default function StepPersonal({ register, watch, setValue, errors }) {
  const dobValue = watch("dob");

  useEffect(() => {
    if (dobValue) {
      const calculatedAge = calculateAgeFromDOB(dobValue);
      if (calculatedAge !== null && calculatedAge > 0) {
        setValue("age", calculatedAge, { shouldValidate: true });
        setValue("currentAge", calculatedAge, { shouldValidate: false });
      }
    }
  }, [dobValue, setValue]);

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
        <p className="text-sm text-slate-500 mt-1">
          Please enter your contact details. Required fields are marked with{" "}
          <span className="text-rose-500">*</span>.
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
              errors.fullName ? "border-rose-300 focus:border-rose-500" : "border-slate-300 focus:border-blue-500"
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
              errors.dob ? "border-rose-300 focus:border-rose-500" : "border-slate-300 focus:border-blue-500"
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
            placeholder="Auto-calculated from DOB"
            {...register("age")}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
              errors.age ? "border-rose-300 focus:border-rose-500" : "border-slate-300 focus:border-blue-500"
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
          {errors.gender && <p className="text-xs text-rose-600 mt-1">{errors.gender.message}</p>}
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
                errors.mobile ? "border-rose-300 focus:border-rose-500" : "border-slate-300 focus:border-blue-500"
              }`}
            />
          </div>
          {errors.mobile && <p className="text-xs text-rose-600 mt-1">{errors.mobile.message}</p>}
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
              errors.email ? "border-rose-300 focus:border-rose-500" : "border-slate-300 focus:border-blue-500"
            }`}
          />
          {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>}
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
              errors.occupation ? "border-rose-300 focus:border-rose-500" : "border-slate-300 focus:border-blue-500"
            }`}
          />
          {errors.occupation && <p className="text-xs text-rose-600 mt-1">{errors.occupation.message}</p>}
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Residential Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="House/Flat No., Street, Locality"
            {...register("address")}
            className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
              errors.address ? "border-rose-300 focus:border-rose-500" : "border-slate-300 focus:border-blue-500"
            }`}
          />
          {errors.address && <p className="text-xs text-rose-600 mt-1">{errors.address.message}</p>}
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
              errors.city ? "border-rose-300 focus:border-rose-500" : "border-slate-300 focus:border-blue-500"
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
              errors.state ? "border-rose-300 focus:border-rose-500" : "border-slate-300 focus:border-blue-500"
            }`}
          />
          {errors.state && <p className="text-xs text-rose-600 mt-1">{errors.state.message}</p>}
        </div>
      </div>
    </div>
  );
}
