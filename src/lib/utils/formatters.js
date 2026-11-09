/**
 * Indian Rupee & Financial Value Formatters
 */

/**
 * Formats a numeric value into Indian Rupee format (e.g. ₹1,50,000 or ₹40,000)
 * @param {number|string} amount
 * @param {boolean} includeSymbol
 * @returns {string}
 */
export function formatINR(amount, includeSymbol = true) {
  if (amount === undefined || amount === null || amount === "" || isNaN(Number(amount))) {
    return includeSymbol ? "₹0" : "0";
  }
  const numeric = Math.round(Number(amount));
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(numeric);

  return includeSymbol ? `₹${formatted}` : formatted;
}

/**
 * Parses user input string (handling commas, ₹ symbol) into a valid number
 * @param {string|number} value
 * @returns {number}
 */
export function parseINR(value) {
  if (typeof value === "number") return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const cleaned = value.toString().replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Calculates age in full years from date of birth string (YYYY-MM-DD)
 * @param {string} dobString
 * @returns {number|null}
 */
export function calculateAgeFromDOB(dobString) {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

/**
 * Formats date into readable Indian standard format (DD/MM/YYYY)
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return "N/A";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
