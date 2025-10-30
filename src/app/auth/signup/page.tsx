import {Suspense} from "react";
import Loading from "@/components/Loading";
import SignUpView from "@/views/auth/SignUpView";

export default function SignUpPage() {
  return (
      <Suspense fallback={<Loading />}>
        <SignUpView />
      </Suspense>
  )
}