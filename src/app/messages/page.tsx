import {Suspense} from "react";
import Loading from "@/components/Loading";
import MessagesView from "@/views/messages/MessagesView";

export default function MessagesPage() {
  return (
      <Suspense fallback={<Loading />}>
        <MessagesView />
      </Suspense>
  )
}
