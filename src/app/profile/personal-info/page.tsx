import {Suspense} from "react";
import PersonalInfoView from "@/views/profile/PersonalInfoView";
import AuthGuard from "@/components/auth/AuthGuard";

export default function PersonalInfoPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div>Loading personal information...</div>}>
        <PersonalInfoView />
      </Suspense>
    </AuthGuard>
  );
}