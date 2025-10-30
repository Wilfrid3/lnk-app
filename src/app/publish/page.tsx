import {Suspense} from "react";
import Loading from "@/components/Loading";
import PublishChoiceView from "@/views/publish/PublishChoiceView";

export default function PublishPage() {
  return (
      <Suspense fallback={<Loading />}>
        <PublishChoiceView />
      </Suspense>
  )
}
