/**
 * Realistic Mock Data for One-Click Form Testing
 */

export const sampleClientData = {
  // Step 1: Personal
  fullName: "Rajesh Kumar Sharma",
  dob: "1988-06-15",
  age: 38,
  gender: "Male",
  mobile: "9876543210",
  email: "rajesh.sharma@example.com",
  address: "Flat 402, Green Acres Residency, MG Road",
  city: "Trivandrum",
  state: "Kerala",
  occupation: "Senior Technical Architect",

  // Step 2: Family
  familyMembers: [
    {
      id: "fam-1",
      name: "Pooja Sharma",
      relationship: "Spouse",
      age: 36,
      occupation: "Teacher",
      isDependent: false,
    },
    {
      id: "fam-2",
      name: "Aarav Sharma",
      relationship: "Child / Son",
      age: 10,
      occupation: "Student",
      isDependent: true,
    },
    {
      id: "fam-3",
      name: "Ramesh Sharma",
      relationship: "Father",
      age: 68,
      occupation: "Retired",
      isDependent: true,
    },
  ],

  // Step 3: Income
  incomes: [
    {
      id: "inc-1",
      type: "Salary",
      frequency: "monthly",
      amount: "185000",
      description: "Primary employment - IT Software",
    },
    {
      id: "inc-2",
      type: "Rental",
      frequency: "monthly",
      amount: "22000",
      description: "2BHK rental apartment in Kochi",
    },
  ],

  // Step 4: Expenses
  expenses: {
    household: "45000",
    education: "18000",
    medical: "5000",
    rent: "0",
    loanEMI: "38000",
    insurance: "6000",
    travel: "8000",
    other: "12000",
  },

  // Step 5: Assets
  assets: [
    {
      id: "ast-1",
      type: "Savings Account",
      institution: "HDFC Bank Ltd",
      currentValue: "350000",
      description: "Emergency liquid savings",
    },
    {
      id: "ast-2",
      type: "Fixed Deposit (FD)",
      institution: "SBI",
      currentValue: "500000",
      description: "Matures Nov 2027",
    },
    {
      id: "ast-3",
      type: "Real Estate",
      institution: "Residential Apartment Trivandrum",
      currentValue: "7500000",
      description: "Self-occupied property",
    },
    {
      id: "ast-4",
      type: "Gold",
      institution: "Physical & SGB Holdings",
      currentValue: "800000",
      description: "Sovereign Gold Bonds + Jewelry",
    },
    {
      id: "ast-5",
      type: "EPF / PF",
      institution: "Employees Provident Fund",
      currentValue: "1800000",
      description: "Accumulated EPF with employer match",
    },
  ],

  // Step 6: Liabilities
  liabilities: [
    {
      id: "lia-1",
      type: "Home Loan",
      lender: "SBI Home Finance",
      outstandingAmount: "3200000",
      emi: "32000",
      interestRate: "8.5",
      remainingTenureMonths: "140",
    },
    {
      id: "lia-2",
      type: "Car/Vehicle Loan",
      lender: "ICICI Bank",
      outstandingAmount: "450000",
      emi: "6000",
      interestRate: "9.2",
      remainingTenureMonths: "36",
    },
  ],

  // Step 7: Existing Investments
  investments: [
    {
      id: "inv-1",
      type: "Mutual Funds",
      name: "Parag Parikh Flexi Cap Fund",
      currentValue: "1200000",
      monthlySIP: "25000",
      initialInvestment: "400000",
      expectedReturn: 13,
      linkedGoal: "Children's Higher Education",
      maturityDate: "",
    },
    {
      id: "inv-2",
      type: "Direct Equity",
      name: "Bluechip Portfolio (Nifty 50 Stocks)",
      currentValue: "850000",
      monthlySIP: "10000",
      initialInvestment: "500000",
      expectedReturn: 12,
      linkedGoal: "Retirement",
      maturityDate: "",
    },
    {
      id: "inv-3",
      type: "PPF/EPF",
      name: "Public Provident Fund (PPF)",
      currentValue: "950000",
      monthlySIP: "12500",
      initialInvestment: "300000",
      expectedReturn: 7.1,
      linkedGoal: "Retirement",
      maturityDate: "2032-03-31",
    },
  ],

  // Step 8: Goals
  goals: [
    {
      id: "gol-1",
      category: "Education",
      goalName: "Aarav's Overseas Higher Education",
      beneficiary: "Aarav (Son)",
      currentCost: "4000000",
      targetYear: 2034,
      yearsRemaining: 8,
      inflationRate: 8,
      expectedReturn: 12,
      allocatedInvestment: "1200000",
      priority: "High",
    },
    {
      id: "gol-2",
      category: "Retirement",
      goalName: "Financial Independence Retirement Corpus",
      beneficiary: "Self & Spouse",
      currentCost: "25000000",
      targetYear: 2046,
      yearsRemaining: 20,
      inflationRate: 6,
      expectedReturn: 11,
      allocatedInvestment: "2750000",
      priority: "High",
    },
    {
      id: "gol-3",
      category: "Vacation",
      goalName: "European Family Vacation",
      beneficiary: "Family",
      currentCost: "600000",
      targetYear: 2028,
      yearsRemaining: 2,
      inflationRate: 6,
      expectedReturn: 8,
      allocatedInvestment: "200000",
      priority: "Medium",
    },
  ],

  // Step 9: Retirement
  currentAge: 38,
  retirementAge: 58,
  currentRetirementSavings: "2750000",
  desiredMonthlyIncome: "100000",
  existingPension: "0",
  expectedPensionIncrease: "5",
  lifeExpectancy: 85,
  otherRetirementNotes: "Wish to do part-time consulting or charity teaching post-58.",

  // Step 10: Additional
  lifeInsuranceCover: "15000000",
  healthInsuranceCover: "1500000",
  hasWill: false,
  hasEmergencyFund: true,
  plannerNotes: "Want to review whether prepaying home loan is better than equity SIP in current market.",
  documentNames: ["SalarySlip_Oct2026.pdf", "CAS_Statement_2026.pdf"],

  // Step 11: Confirmation (Unchecked so user must confirm on Review step)
  confirmationAgreed: false,
};
