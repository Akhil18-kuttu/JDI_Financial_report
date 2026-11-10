/**
 * Utility for direct report downloading and sharing via WhatsApp & Email
 */

/**
 * Triggers a direct browser file download for a given Blob or string content
 * @param {Blob|string} content 
 * @param {string} fileName 
 * @param {string} mimeType 
 */
export function triggerFileDownload(content, fileName, mimeType = "application/pdf") {
  if (typeof window === "undefined") return;

  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const downloadUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 2000);
}

/**
 * Generates a self-contained printable report document and triggers direct download
 * @param {object} submission 
 * @param {string} elementId 
 */
export function directDownloadReportDocument(submission, elementId = "printable-report-content") {
  if (typeof window === "undefined") return;

  const subId = submission?.submissionId || "REPORT";
  const clientName = submission?.clientName || submission?.data?.fullName || "Client";
  const fileName = `JDI-Financial-Report-${subId}.pdf`;

  const reportElement = document.getElementById(elementId);
  const reportHtml = reportElement ? reportElement.outerHTML : "<div>Report content</div>";

  // Create standalone document with all Tailwind & Print styling
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JDI Wealth Financial Report - ${subId}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page { size: A4; margin: 10mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; color: #0f172a; margin: 0; padding: 20px; }
    @media print {
      body { padding: 0; }
      .print\\:break-before-page { page-break-before: always; }
      .print\\:min-h-screen { min-height: 100vh; }
    }
  </style>
</head>
<body>
  ${reportHtml}
</body>
</html>`;

  // Download directly as an interactive document
  triggerFileDownload(fullHtml, fileName, "application/pdf");
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
