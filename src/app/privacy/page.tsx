import {Suspense} from "react";
import Loading from "@/components/Loading";
import PrivacyView from "@/views/PrivacyView";

export default function PrivacyPage() {
  return (
      <Suspense fallback={<Loading />}>
        <PrivacyView />
      </Suspense>
  )
}
