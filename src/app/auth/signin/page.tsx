import {Suspense} from "react";
import Loading from "@/components/Loading";
import SignInView from "@/views/auth/SignInView";

export default function SignInPage() {
  return (
      <Suspense fallback={<Loading />}>
        <SignInView />
      </Suspense>
  )
}