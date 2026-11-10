import { Suspense } from "react";
import ClientFinancialWizard from "@/components/form/ClientFinancialWizard";

export const metadata = {
  title: "Client Information Form | JDI Wealth",
  description: "Client personal details form.",
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
