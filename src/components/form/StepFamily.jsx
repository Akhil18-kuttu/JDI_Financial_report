"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";

export default function StepFamily({
  familyMembers = [],
  onAddMember,
  onRemoveMember,
  onUpdateMember,
}) {
  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Family & Dependents</h2>
          <p className="text-sm text-slate-500 mt-1">
            Add your spouse, children, and any other financial dependents.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddMember}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Member</span>
        </button>
      </div>

      {familyMembers.length === 0 ? (
        <div className="text-center py-8 px-4 border border-slate-200 rounded-xl bg-slate-50/60">
          <p className="text-sm text-slate-600 mb-2">No family members added yet.</p>
          <button
            type="button"
            onClick={onAddMember}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Click here to add a family member</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Table Header on medium+ screens */}
          <div className="hidden md:grid md:grid-cols-12 gap-3 px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
            <span className="col-span-3">Full Name</span>
            <span className="col-span-3">Relationship</span>
            <span className="col-span-2">Age</span>
            <span className="col-span-2">Occupation</span>
            <span className="col-span-1 text-center">Dependent</span>
            <span className="col-span-1 text-right">Action</span>
          </div>

          {/* Member Rows */}
          {familyMembers.map((member, index) => (
            <div
              key={member.id || index}
              className="p-3 bg-white border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
            >
              <div className="md:col-span-3">
                <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ananya"
                  value={member.name || ""}
                  onChange={(e) => onUpdateMember(index, "name", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                  Relationship
                </label>
                <select
                  value={member.relationship || "Spouse"}
                  onChange={(e) => onUpdateMember(index, "relationship", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Child / Son">Child / Son</option>
                  <option value="Child / Daughter">Child / Daughter</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other Dependent</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  min="0"
                  max="110"
                  placeholder="e.g. 10"
                  value={member.age ?? ""}
                  onChange={(e) => onUpdateMember(index, "age", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Student"
                  value={member.occupation || ""}
                  onChange={(e) => onUpdateMember(index, "occupation", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-1 flex items-center justify-between md:justify-center">
                <span className="md:hidden text-xs font-medium text-slate-600">Dependent?</span>
                <input
                  type="checkbox"
                  checked={member.isDependent !== false}
                  onChange={(e) => onUpdateMember(index, "isDependent", e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => onRemoveMember(index)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <button
              type="button"
              onClick={onAddMember}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add another family member</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
