import {Suspense} from "react";
import Loading from "@/components/Loading";
import SearchView from "@/views/SearchView";

export default function SearchPage() {
  return (
      <Suspense fallback={<Loading />}>
        <SearchView />
      </Suspense>
  )
}