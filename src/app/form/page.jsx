import { Suspense } from "react";
import ClientFinancialWizard from "@/components/form/ClientFinancialWizard";

export const metadata = {
  title: "Client Financial Planning Form | JDI Wealth",
  description:
    "Confidential client financial planning form for personal, family, income, expenses, assets, liabilities, investments, and retirement modeling.",
};

export default function FormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ClientFinancialWizard />
    </Suspense>
  );
}
