import { Suspense } from 'react';
import VerifyPhoneView from "@/views/auth/VerifyPhoneView";

export default function VerifyPhonePage() {
  return (
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyPhoneView />
      </Suspense>
  );
}
