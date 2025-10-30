import { Suspense } from 'react'
import LogoutView from "@/views/auth/LogoutView";

export default function LogoutPage() {
  return (
      <Suspense fallback={<div>Loading logout page…</div>}>
        <LogoutView />
      </Suspense>
  )
}
// export const dynamic = 'force-dynamic'; // This page should always be server-rendered