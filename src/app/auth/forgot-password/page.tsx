import ForgotPasswordView from "@/views/auth/ForgotPasswordView";
import {Suspense} from "react";
import Loading from "@/components/Loading";

export default function ForgotPasswordPage() {
  return (
      <Suspense fallback={<Loading />}>
        <ForgotPasswordView />
      </Suspense>
  )
}