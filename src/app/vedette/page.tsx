import {Suspense} from "react";
import Loading from "@/components/Loading";
import VedetteView from "@/views/VedetteView";

export default function VedettePage() {
  return (
      <Suspense fallback={<Loading />}>
        <VedetteView />
      </Suspense>
  )
}