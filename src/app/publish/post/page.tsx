import {Suspense} from "react";
import Loading from "@/components/Loading";
import PublishView from "@/views/publish/PublishView";

export default function PublishPostPage() {
  return (
      <Suspense fallback={<Loading />}>
        <PublishView />
      </Suspense>
  )
}
