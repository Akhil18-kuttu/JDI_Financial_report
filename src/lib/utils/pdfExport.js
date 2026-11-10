/**
 * Utility for direct report downloading and sharing via WhatsApp & Email
 */

/**
 * Dynamically loads html2pdf bundle from CDN to compile authentic binary PDF
 * @returns {Promise<any>}
 */
async function loadHtml2PdfLibrary() {
  if (typeof window === "undefined") return null;
  if (window.html2pdf) return window.html2pdf;

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-lib="html2pdf"]');
    if (existing) {
      if (window.html2pdf) {
        resolve(window.html2pdf);
      } else {
        existing.addEventListener("load", () => resolve(window.html2pdf));
        existing.addEventListener("error", reject);
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.setAttribute("data-lib", "html2pdf");
    script.async = true;
    script.onload = () => {
      if (window.html2pdf) {
        resolve(window.html2pdf);
      } else {
        reject(new Error("html2pdf library loaded but not available on window"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load html2pdf from CDN"));
    document.head.appendChild(script);
  });
}

/**
 * Generates an authentic binary PDF document and downloads it directly to device
 * @param {object} submission 
 * @param {string} elementId 
 * @returns {Promise<boolean>}
 */
export async function directDownloadReportDocument(submission, elementId = "printable-report-content") {
  if (typeof window === "undefined") return false;

  const subId = submission?.submissionId || "REPORT";
  const fileName = `JDI-Financial-Report-${subId}.pdf`;

  // 1. Check if the printable report element exists in the current page
  const reportElement = document.getElementById(elementId);

  // If not on report page (e.g. clicked from Admin dashboard modal), open report page with auto-download
  if (!reportElement) {
    const reportUrl = `/admin/report?id=${subId}&auto=download`;
    window.open(reportUrl, "_blank");
    return true;
  }

  // 2. Try compiling genuine binary PDF with html2pdf (jsPDF + html2canvas)
  try {
    const html2pdf = await loadHtml2PdfLibrary();
    if (html2pdf) {
      const opt = {
        margin: [6, 6, 6, 6],
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      };

      await html2pdf().set(opt).from(reportElement).save();
      return true;
    }
  } catch (err) {
    console.warn("Direct html2pdf generation failed or offline. Falling back to browser print:", err);
  }

  // 3. Fallback: Native Browser Print engine (User selects "Save as PDF")
  window.print();
  return true;
}

/**
 * Generates formatted text message for WhatsApp sharing
 * @param {object} submission 
 * @returns {string}
 */
export function getWhatsAppShareText(submission) {
  const name = submission?.clientName || submission?.data?.fullName || "Valued Client";
  const id = submission?.submissionId || "";
  const date = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `📊 *JDI Wealth Management - Financial Planning Report*\n\nDear *${name}*,\n\nYour comprehensive Financial Planning Report (*Ref: ${id}*) dated ${date} has been prepared and approved by our advisory team.\n\n📎 *Attached Document:* JDI-Financial-Report-${id}.pdf\n\nPlease find your financial health metrics, cash-flow projections, and strategic wealth recommendations enclosed.\n\nFor any clarifications, please feel free to connect with our wealth advisory desk.\n\n*Warm regards,*\n*JDI Wealth Management Team*`;
}

/**
 * Generates formatted subject and body for Email sharing
 * @param {object} submission 
 * @returns {{ subject: string, body: string }}
 */
export function getEmailShareContent(submission) {
  const name = submission?.clientName || submission?.data?.fullName || "Valued Client";
  const id = submission?.submissionId || "";

  const subject = `Your Financial Planning Report (${id}) | JDI Wealth Management`;
  const body = `Dear ${name},

We are pleased to present your Comprehensive Financial Planning Report (Reference ID: ${id}) prepared by JDI Wealth Management.

Attached to this communication is your complete PDF advisory document, covering:
- Net Worth & Financial Health Score
- Income & Cash Flow Projections (10-Year Horizon)
- Recommended Asset Allocation & Surplus Deployment
- Retirement Corpus & Goal Funding Strategy

Please review your report document. Should you have any questions or wish to proceed with the recommended allocations, please reach out to us.

Warm regards,

JDI Wealth Management
Financial Advisory & Planning Desk
`;

  return { subject, body };
}
