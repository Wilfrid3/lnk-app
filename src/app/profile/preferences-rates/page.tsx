import { Suspense } from "react";
import PreferencesRatesView from "@/views/profile/PreferencesRatesView";
import AuthGuard from "@/components/auth/AuthGuard";

export default function PreferencesRatesPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div>Loading preferences and rates...</div>}>
        <PreferencesRatesView />
      </Suspense>
    </AuthGuard>
  );
}
