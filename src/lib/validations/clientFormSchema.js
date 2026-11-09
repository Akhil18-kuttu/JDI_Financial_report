import { z } from "zod";

// Regex for valid Indian 10-digit mobile numbers (starting with 6, 7, 8, or 9)
const indianMobileRegex = /^[6-9]\d{9}$/;

// Helper for numeric inputs that can be numbers or strings
const nonNegativeNumber = (fieldName = "Amount") =>
  z.union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === "number") return val;
      if (!val) return 0;
      const parsed = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
      return isNaN(parsed) ? 0 : parsed;
    })
    .pipe(z.number().min(0, `${fieldName} cannot be negative`));

const optionalNonNegativeNumber = (fieldName = "Amount") =>
  z.union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || val === "") return 0;
      const parsed = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
      return isNaN(parsed) ? 0 : parsed;
    })
    .pipe(z.number().min(0, `${fieldName} cannot be negative`));

/**
 * Step 1: Personal Information Schema
 */
export const personalInfoSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required (at least 2 characters)"),
  dob: z.string().min(1, "Date of birth is required"),
  age: z.coerce
    .number()
    .min(18, "Age must be at least 18")
    .max(100, "Please enter a valid age under 100"),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  mobile: z
    .string()
    .trim()
    .regex(indianMobileRegex, "Enter a valid 10-digit Indian mobile number (e.g. 9876543210)"),
  email: z.string().trim().email("Please enter a valid email address"),
  address: z.string().trim().min(5, "Address is required (at least 5 characters)"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  occupation: z.string().trim().min(2, "Occupation is required"),
});

/**
 * Step 2: Family Information Schema
 */
export const familyMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Family member name is required"),
  relationship: z.string().trim().min(1, "Relationship is required"),
  dob: z.string().optional(),
  age: z.coerce.number().min(0, "Age cannot be negative").max(110, "Valid age required"),
  occupation: z.string().trim().optional(),
  isDependent: z.boolean().default(true),
});

export const familyInfoSchema = z.object({
  familyMembers: z.array(familyMemberSchema).default([]),
});

/**
 * Step 3: Income Schema
 */
export const incomeItemSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["Salary", "Business", "Rental", "Pension", "Investments", "Other"], {
    errorMap: () => ({ message: "Select income type" }),
  }).default("Salary"),
  frequency: z.enum(["monthly", "annual"]).default("monthly"),
  amount: optionalNonNegativeNumber("Income amount"),
  description: z.string().trim().optional(),
});

export const incomeSchema = z.object({
  incomes: z.array(incomeItemSchema).default([]),
});

/**
 * Step 4: Expenses Schema
 */
export const expensesSchema = z.object({
  expenses: z.object({
    household: optionalNonNegativeNumber("Household expense"),
    education: optionalNonNegativeNumber("Education expense"),
    medical: optionalNonNegativeNumber("Medical expense"),
    rent: optionalNonNegativeNumber("Rent expense"),
    loanEMI: optionalNonNegativeNumber("Loan EMI"),
    insurance: optionalNonNegativeNumber("Insurance premium"),
    travel: optionalNonNegativeNumber("Travel & Leisure"),
    other: optionalNonNegativeNumber("Other expense"),
  }),
});

/**
 * Step 5: Assets Schema
 */
export const assetItemSchema = z.object({
  id: z.string().optional(),
  type: z.enum(
    ["Savings Account", "Fixed Deposit (FD)", "PPF", "Mutual Funds", "Real Estate", "Gold", "EPF / PF", "Stocks", "Other"],
    { errorMap: () => ({ message: "Select asset type" }) }
  ),
  institution: z.string().trim().min(1, "Institution/asset name is required"),
  currentValue: nonNegativeNumber("Asset value"),
  description: z.string().trim().optional(),
});

export const assetsSchema = z.object({
  assets: z.array(assetItemSchema).default([]),
});

/**
 * Step 6: Liabilities Schema
 */
export const liabilityItemSchema = z.object({
  id: z.string().optional(),
  type: z.enum(
    ["Home Loan", "Car/Vehicle Loan", "Personal Loan", "Gold Loan", "Credit Card", "Education Loan", "Other Loan"],
    { errorMap: () => ({ message: "Select liability type" }) }
  ),
  lender: z.string().trim().optional(),
  outstandingAmount: nonNegativeNumber("Outstanding amount"),
  emi: nonNegativeNumber("Monthly EMI"),
  interestRate: optionalNonNegativeNumber("Interest rate").refine(
    (val) => val >= 0 && val <= 100,
    { message: "Interest rate must be between 0% and 100%" }
  ),
  remainingTenureMonths: optionalNonNegativeNumber("Remaining tenure"),
});

export const liabilitiesSchema = z.object({
  liabilities: z.array(liabilityItemSchema).default([]),
});

/**
 * Step 7: Existing Investments Schema
 */
export const investmentItemSchema = z.object({
  id: z.string().optional(),
  type: z.enum(
    ["Mutual Funds", "Direct Equity", "PPF/EPF", "NPS", "Fixed Deposits / Bonds", "Real Estate", "Gold / Sovereign Gold Bonds", "Cryptocurrency / Alternative", "Other"],
    { errorMap: () => ({ message: "Select investment type" }) }
  ),
  name: z.string().trim().min(1, "Investment scheme/name is required"),
  currentValue: nonNegativeNumber("Current value"),
  monthlySIP: optionalNonNegativeNumber("Monthly SIP"),
  initialInvestment: optionalNonNegativeNumber("Initial lump sum"),
  expectedReturn: optionalNonNegativeNumber("Expected return").refine(
    (val) => val >= 0 && val <= 50,
    { message: "Expected return must be between 0% and 50%" }
  ),
  linkedGoal: z.string().trim().optional(),
  maturityDate: z.string().optional(),
});

export const investmentsSchema = z.object({
  investments: z.array(investmentItemSchema).default([]),
});

/**
 * Step 8: Financial Goals Schema
 */
export const financialGoalItemSchema = z.object({
  id: z.string().optional(),
  category: z.string().default("Other"),
  goalName: z.string().trim().default("Milestone Goal"),
  beneficiary: z.string().trim().default("Self"),
  currentCost: optionalNonNegativeNumber("Current estimated cost"),
  targetYear: z.coerce.number().default(2030),
  yearsRemaining: z.coerce.number().default(5),
  inflationRate: optionalNonNegativeNumber("Inflation rate"),
  expectedReturn: optionalNonNegativeNumber("Expected return"),
  allocatedInvestment: optionalNonNegativeNumber("Allocated existing investment"),
  priority: z.enum(["High", "Medium", "Low"]).default("High"),
});

export const financialGoalsSchema = z.object({
  goals: z.array(financialGoalItemSchema).default([]),
});

/**
 * Step 9: Retirement & Pension Schema
 */
export const retirementBaseSchema = z.object({
  currentAge: z.coerce.number().min(18, "Age must be at least 18").max(90, "Enter valid age").optional().or(z.literal("")),
  retirementAge: z.coerce
    .number()
    .min(40, "Retirement age must be at least 40")
    .max(90, "Retirement age must be under 90")
    .optional()
    .or(z.literal("")),
  currentRetirementSavings: optionalNonNegativeNumber("Retirement savings"),
  desiredMonthlyIncome: optionalNonNegativeNumber("Desired retirement income"),
  existingPension: optionalNonNegativeNumber("Existing pension"),
  expectedPensionIncrease: optionalNonNegativeNumber("Expected pension increase %").refine(
    (val) => val >= 0 && val <= 20,
    { message: "Pension increase rate must be between 0% and 20%" }
  ),
  lifeExpectancy: z.coerce
    .number()
    .min(60, "Life expectancy must be at least 60")
    .max(120, "Enter valid life expectancy")
    .optional()
    .or(z.literal("")),
  otherRetirementNotes: z.string().trim().optional(),
});

export const retirementSchema = retirementBaseSchema
  .refine((data) => !data.currentAge || !data.retirementAge || Number(data.retirementAge) > Number(data.currentAge), {
    message: "Retirement age must be greater than current age",
    path: ["retirementAge"],
  })
  .refine((data) => !data.lifeExpectancy || !data.retirementAge || Number(data.lifeExpectancy) > Number(data.retirementAge), {
    message: "Life expectancy must be greater than retirement age",
    path: ["lifeExpectancy"],
  });

/**
 * Step 10: Additional Information Schema
 */
export const additionalInfoSchema = z.object({
  lifeInsuranceCover: optionalNonNegativeNumber("Life insurance cover"),
  healthInsuranceCover: optionalNonNegativeNumber("Health insurance cover"),
  hasWill: z.boolean().default(false),
  hasEmergencyFund: z.boolean().default(false),
  plannerNotes: z.string().trim().optional(),
  documentNames: z.array(z.string()).default([]),
});

/**
 * Step 11: Review & Confirmation Schema
 */
export const reviewConfirmationSchema = z.object({
  confirmationAgreed: z.literal(true, {
    errorMap: () => ({
      message: "You must confirm that the provided information is accurate before submitting.",
    }),
  }),
});

/**
 * Combined Complete Client Financial Form Schema
 */
export const clientFinancialFormSchema = z
  .object({
    ...personalInfoSchema.shape,
    ...familyInfoSchema.shape,
    ...incomeSchema.shape,
    ...expensesSchema.shape,
    ...assetsSchema.shape,
    ...liabilitiesSchema.shape,
    ...investmentsSchema.shape,
    ...financialGoalsSchema.shape,
    ...retirementBaseSchema.shape,
    ...additionalInfoSchema.shape,
    ...reviewConfirmationSchema.shape,
  })
  .refine((data) => !data.currentAge || !data.retirementAge || Number(data.retirementAge) > Number(data.currentAge), {
    message: "Retirement age must be greater than current age",
    path: ["retirementAge"],
  })
  .refine((data) => !data.lifeExpectancy || !data.retirementAge || Number(data.lifeExpectancy) > Number(data.retirementAge), {
    message: "Life expectancy must be greater than retirement age",
    path: ["lifeExpectancy"],
  });

/**
 * Maps step number (1 - 11) to field keys for scoped step validation
 */
export const STEP_FIELDS = {
  1: ["fullName", "dob", "age", "gender", "mobile", "email", "address", "city", "state", "occupation"],
  2: ["familyMembers"],
  3: ["incomes"],
  4: [
    "expenses.household",
    "expenses.education",
    "expenses.medical",
    "expenses.rent",
    "expenses.loanEMI",
    "expenses.insurance",
    "expenses.travel",
    "expenses.other",
  ],
  5: ["assets"],
  6: ["liabilities"],
  7: ["investments"],
  8: ["goals"],
  9: [
    "currentAge",
    "retirementAge",
    "currentRetirementSavings",
    "desiredMonthlyIncome",
    "existingPension",
    "expectedPensionIncrease",
    "lifeExpectancy",
    "otherRetirementNotes",
  ],
  10: ["lifeInsuranceCover", "healthInsuranceCover", "hasWill", "hasEmergencyFund", "plannerNotes"],
  11: ["confirmationAgreed"],
};

/**
 * Step configuration metadata
 */
export const WIZARD_STEPS = [
  { id: 1, key: "personal", label: "Personal", title: "Personal Information", description: "Your basic contact & professional details" },
  { id: 2, key: "family", label: "Family", title: "Family Details", description: "Spouse, children & other dependents" },
  { id: 3, key: "income", label: "Income", title: "Income Sources", description: "Salary, business, rental & other earnings" },
  { id: 4, key: "expenses", label: "Expenses", title: "Monthly Expenses", description: "Living, household & debt obligations" },
  { id: 5, key: "assets", label: "Assets", title: "Assets & Holdings", description: "Real estate, gold, savings & accounts" },
  { id: 6, key: "liabilities", label: "Liabilities", title: "Liabilities & Loans", description: "Home, auto, personal loans & cards" },
  { id: 7, key: "investments", label: "Investments", title: "Existing Investments", description: "Mutual funds, equity, PF & SIPs" },
  { id: 8, key: "goals", label: "Goals", title: "Financial Goals", description: "Milestones you want to achieve" },
  { id: 9, key: "retirement", label: "Retirement", title: "Retirement & Pension", description: "Retirement corpus & golden years" },
  { id: 10, key: "additional", label: "Additional", title: "Additional Information", description: "Insurance, documents & notes" },
  { id: 11, key: "review", label: "Review", title: "Review & Submit", description: "Verify all details & submit for review" },
];
