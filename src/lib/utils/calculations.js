/**
 * Financial Calculation Engine
 * 
 * Architectural Rule (Spec Section 18):
 * - The form is responsible for collecting & validating client data.
 * - This engine is responsible for calculations and projections.
 */

import { parseINR } from "./formatters";

/**
 * Calculates total monthly income across dynamic income sources.
 * Handles both monthly and annual frequencies.
 * @param {Array<{ amount: number|string, frequency: string }>} incomes
 * @returns {number}
 */
export function calculateTotalMonthlyIncome(incomes = []) {
  if (!Array.isArray(incomes)) return 0;
  return incomes.reduce((total, item) => {
    const amt = parseINR(item?.amount);
    const freq = item?.frequency || "monthly";
    const monthlyAmt = freq === "annual" ? amt / 12 : amt;
    return total + (isNaN(monthlyAmt) ? 0 : monthlyAmt);
  }, 0);
}

/**
 * Calculates total monthly expenses across categories.
 * @param {Object|Array} expenses - Either key-value pairs or array of expense items
 * @returns {number}
 */
export function calculateTotalMonthlyExpenses(expenses) {
  if (!expenses) return 0;
  if (Array.isArray(expenses)) {
    return expenses.reduce((total, item) => {
      const amt = parseINR(item?.amount);
      return total + (isNaN(amt) ? 0 : amt);
    }, 0);
  }
  // If object of categories { household: 20000, rent: 15000, ... }
  return Object.values(expenses).reduce((total, val) => {
    const amt = parseINR(val);
    return total + (isNaN(amt) ? 0 : amt);
  }, 0);
}

/**
 * Calculates Estimated Monthly Surplus = Income - Expenses
 * @param {number} totalMonthlyIncome
 * @param {number} totalMonthlyExpenses
 * @returns {number}
 */
export function calculateSurplus(totalMonthlyIncome, totalMonthlyExpenses) {
  const income = parseINR(totalMonthlyIncome);
  const expenses = parseINR(totalMonthlyExpenses);
  return income - expenses;
}

/**
 * Calculates Total Assets
 * @param {Array<{ currentValue: number|string }>} assets
 * @returns {number}
 */
export function calculateTotalAssets(assets = []) {
  if (!Array.isArray(assets)) return 0;
  return assets.reduce((total, item) => {
    const val = parseINR(item?.currentValue);
    return total + (isNaN(val) ? 0 : val);
  }, 0);
}

/**
 * Calculates Total Liabilities
 * @param {Array<{ outstandingAmount: number|string }>} liabilities
 * @returns {number}
 */
export function calculateTotalLiabilities(liabilities = []) {
  if (!Array.isArray(liabilities)) return 0;
  return liabilities.reduce((total, item) => {
    const val = parseINR(item?.outstandingAmount);
    return total + (isNaN(val) ? 0 : val);
  }, 0);
}

/**
 * Calculates Net Worth = Total Assets - Total Liabilities
 * @param {number} totalAssets
 * @param {number} totalLiabilities
 * @returns {number}
 */
export function calculateNetWorth(totalAssets, totalLiabilities) {
  const assets = parseINR(totalAssets);
  const liabilities = parseINR(totalLiabilities);
  return assets - liabilities;
}

/**
 * Total Existing Investments Current Value
 * @param {Array<{ currentValue: number|string }>} investments
 * @returns {number}
 */
export function calculateTotalInvestments(investments = []) {
  if (!Array.isArray(investments)) return 0;
  return investments.reduce((total, item) => {
    const val = parseINR(item?.currentValue);
    return total + (isNaN(val) ? 0 : val);
  }, 0);
}

/**
 * Total Ongoing Monthly SIP across investments
 * @param {Array<{ monthlySIP: number|string }>} investments
 * @returns {number}
 */
export function calculateTotalMonthlySIP(investments = []) {
  if (!Array.isArray(investments)) return 0;
  return investments.reduce((total, item) => {
    const val = parseINR(item?.monthlySIP);
    return total + (isNaN(val) ? 0 : val);
  }, 0);
}

/**
 * Calculates Future Goal Cost based on current cost, years and inflation rate
 * Formula: FV = PV * (1 + r)^n
 * @param {number} currentCost - Present Value (PV)
 * @param {number} years - Years remaining (n)
 * @param {number} inflationRatePercent - Annual inflation rate in % (r)
 * @returns {number}
 */
export function calculateFutureGoalCost(currentCost, years, inflationRatePercent = 6) {
  const pv = parseINR(currentCost);
  const n = Math.max(0, parseFloat(years) || 0);
  const r = (parseFloat(inflationRatePercent) || 0) / 100;
  if (pv <= 0 || n <= 0) return pv;
  return Math.round(pv * Math.pow(1 + r, n));
}

/**
 * Calculates Required Monthly SIP to achieve a target future cost
 * @param {number} futureCost
 * @param {number} years
 * @param {number} expectedReturnPercent
 * @param {number} existingAllocation
 * @returns {number}
 */
export function calculateRequiredMonthlySIP(
  futureCost,
  years,
  expectedReturnPercent = 12,
  existingAllocation = 0
) {
  const fv = parseINR(futureCost);
  const n = Math.max(0, parseFloat(years) || 0);
  const r = (parseFloat(expectedReturnPercent) || 0) / 100;
  const existing = parseINR(existingAllocation);

  if (fv <= 0 || n <= 0) return 0;

  // Net FV required after compounding existing allocation
  const futureExisting = existing > 0 ? existing * Math.pow(1 + r, n) : 0;
  const netFVRequired = Math.max(0, fv - futureExisting);

  if (netFVRequired <= 0) return 0;

  const monthlyRate = r / 12;
  const totalMonths = n * 12;

  if (monthlyRate === 0) {
    return Math.round(netFVRequired / totalMonths);
  }

  // Monthly SIP formula: FV = P * [((1 + i)^n - 1) / i] * (1 + i)
  const sipFactor = ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
  return Math.round(netFVRequired / sipFactor);
}
