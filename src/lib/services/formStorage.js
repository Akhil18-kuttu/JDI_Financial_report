/**
 * Form Storage & Submission Service
 * Implements Section 15 (Mock Data / localStorage for Prototype)
 * and Section 16 (Submission Workflow & Status tracking)
 */

export const STORAGE_KEYS = {
  DRAFT: "jdi_client_form_draft",
  SUBMISSIONS: "jdi_client_submissions",
  ADMIN_SESSION: "jdi_admin_session",
};

export const SUBMISSION_STATUSES = {
  NEW: "NEW",
  UNDER_REVIEW: "UNDER REVIEW",
  INFORMATION_REQUIRED: "INFORMATION REQUIRED",
  VERIFIED: "VERIFIED",
  CALCULATING: "CALCULATING",
  REPORT_READY: "REPORT READY",
  SENT: "SENT",
};

/**
 * Initial empty form values matching schema
 */
export const defaultFormValues = {
  // Step 1: Personal
  fullName: "",
  dob: "",
  age: "",
  gender: "Male",
  mobile: "",
  email: "",
  address: "",
  city: "",
  state: "",
  occupation: "",

  // Step 2: Family
  familyMembers: [],

  // Step 3: Income
  incomes: [
    {
      id: "inc-1",
      type: "Salary",
      frequency: "monthly",
      amount: "",
      description: "Primary Salary",
    },
  ],

  // Step 4: Expenses
  expenses: {
    household: "",
    education: "",
    medical: "",
    rent: "",
    loanEMI: "",
    insurance: "",
    travel: "",
    other: "",
  },

  // Step 5: Assets
  assets: [],

  // Step 6: Liabilities
  liabilities: [],

  // Step 7: Existing Investments
  investments: [],

  // Step 8: Goals
  goals: [],

  // Step 9: Retirement
  currentAge: "",
  retirementAge: "60",
  currentRetirementSavings: "",
  desiredMonthlyIncome: "",
  existingPension: "0",
  expectedPensionIncrease: "5",
  lifeExpectancy: "85",
  otherRetirementNotes: "",

  // Step 10: Additional
  lifeInsuranceCover: "",
  healthInsuranceCover: "",
  hasWill: false,
  hasEmergencyFund: false,
  plannerNotes: "",
  documentNames: [],

  // Step 11: Confirmation
  confirmationAgreed: false,
};

/**
 * Saves current form state and active step to localStorage
 * @param {object} formData
 * @param {number} currentStep
 */
export function saveDraftToStorage(formData, currentStep = 1) {
  if (typeof window === "undefined") return false;
  try {
    const payload = {
      formData,
      currentStep,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error("Failed to save draft to localStorage:", err);
    return false;
  }
}

/**
 * Loads draft from localStorage
 * @returns {{ formData: object, currentStep: number, savedAt: string } | null}
 */
export function loadDraftFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DRAFT);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (err) {
    console.error("Failed to load draft from localStorage:", err);
    return null;
  }
}

/**
 * Clears saved draft
 */
export function clearDraftFromStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
  } catch (err) {
    console.error("Failed to clear draft:", err);
  }
}

/**
 * Submits the form data and stores in localStorage submissions array
 * @param {object} formData
 * @returns {object} submission record with ID and timestamp
 */
export function submitFinancialForm(formData) {
  if (typeof window === "undefined") return null;
  try {
    const submissionId = `JDI-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const submissionRecord = {
      submissionId,
      clientName: formData.fullName || "Valued Client",
      email: formData.email,
      mobile: formData.mobile,
      submittedAt: new Date().toISOString(),
      status: SUBMISSION_STATUSES.NEW,
      statusHistory: [
        {
          status: SUBMISSION_STATUSES.NEW,
          timestamp: new Date().toISOString(),
          note: "Form submitted by client for administrative review.",
        },
      ],
      data: formData,
    };

    const existingJson = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    const submissions = existingJson ? JSON.parse(existingJson) : [];
    submissions.unshift(submissionRecord);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));

    // Clear the active draft after successful submission
    clearDraftFromStorage();

    // Real-time notification across tabs and windows
    try {
      window.dispatchEvent(
        new CustomEvent("jdi_new_submission", { detail: submissionRecord })
      );
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("jdi_submissions_channel");
        channel.postMessage({ type: "NEW_SUBMISSION", record: submissionRecord });
        channel.close();
      }
    } catch (_) {}

    return submissionRecord;
  } catch (err) {
    console.error("Submission failed:", err);
    throw new Error("Unable to save submission. Please try again.");
  }
}

/**
 * Retrieves all stored client submissions
 * @returns {Array}
 */
export function getAllSubmissions() {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Failed to fetch submissions:", err);
    return [];
  }
}

/**
 * Retrieves a single submission by ID
 * @param {string} submissionId
 * @returns {object|null}
 */
export function getSubmissionById(submissionId) {
  if (typeof window === "undefined" || !submissionId) return null;
  const submissions = getAllSubmissions();
  return submissions.find((s) => s.submissionId === submissionId) || null;
}

/**
 * Updates full form data and status of an existing submission by Admin
 * @param {string} submissionId
 * @param {object} updatedFormData
 * @param {string} newStatus
 * @returns {boolean}
 */
export function updateSubmissionData(submissionId, updatedFormData, newStatus) {
  if (typeof window === "undefined" || !submissionId) return false;
  try {
    const submissions = getAllSubmissions();
    const index = submissions.findIndex((s) => s.submissionId === submissionId);
    if (index === -1) return false;

    const current = submissions[index];
    const statusToSet = newStatus || current.status || SUBMISSION_STATUSES.UNDER_REVIEW;

    current.data = updatedFormData;
    current.clientName = updatedFormData.fullName || current.clientName;
    current.email = updatedFormData.email || current.email;
    current.mobile = updatedFormData.mobile || current.mobile;
    current.status = statusToSet;
    current.lastModifiedByAdmin = new Date().toISOString();

    current.statusHistory = current.statusHistory || [];
    current.statusHistory.push({
      status: statusToSet,
      timestamp: new Date().toISOString(),
      note: "Client data updated by administrator.",
    });

    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    return true;
  } catch (err) {
    console.error("Failed to update submission data:", err);
    return false;
  }
}

/**
 * Updates status of an existing submission
 * @param {string} submissionId
 * @param {string} newStatus
 * @param {string} note
 * @returns {boolean}
 */
export function updateSubmissionStatus(submissionId, newStatus, note = "") {
  if (typeof window === "undefined") return false;
  try {
    const submissions = getAllSubmissions();
    const index = submissions.findIndex((s) => s.submissionId === submissionId);
    if (index === -1) return false;

    submissions[index].status = newStatus;
    submissions[index].statusHistory = submissions[index].statusHistory || [];
    submissions[index].statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${newStatus} by admin.`,
    });

    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    return true;
  } catch (err) {
    console.error("Failed to update status:", err);
    return false;
  }
}

/**
 * Deletes a submission by ID
 * @param {string} submissionId
 * @returns {boolean}
 */
export function deleteSubmission(submissionId) {
  if (typeof window === "undefined") return false;
  try {
    const submissions = getAllSubmissions();
    const updated = submissions.filter((s) => s.submissionId !== submissionId);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error("Failed to delete submission:", err);
    return false;
  }
}

/**
 * Admin Authentication Helpers
 */
export function setAdminSession(user) {
  if (typeof window === "undefined") return;
  const session = {
    username: user.username,
    email: user.email || user.username,
    role: "ADMINISTRATOR",
    token: `jdi_token_${Date.now()}`,
    loginTime: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
  // Also set cookie so middleware / server components can read if needed
  document.cookie = `jdi_admin_auth=true; path=/; max-age=86400; SameSite=Strict`;
  return session;
}

export function getAdminSession() {
  if (typeof window === "undefined") return null;
  try {
    const sessionStr = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    return sessionStr ? JSON.parse(sessionStr) : null;
  } catch (err) {
    return null;
  }
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  document.cookie = `jdi_admin_auth=; path=/; max-age=0; SameSite=Strict`;
}
