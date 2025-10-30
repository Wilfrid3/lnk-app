import {Suspense} from "react";
import Loading from "@/components/Loading";
import TermsView from "@/views/TermsView";

export default function TermsPage() {
  return (
      <Suspense fallback={<Loading />}>
        <TermsView />
      </Suspense>
  )
}
