import {Suspense} from "react";
import ProfileView from "@/views/auth/ProfileView";

export default function ProfilePage() {
  return (
      <Suspense fallback={<div>Loading profile page…</div>}>
        <ProfileView />
      </Suspense>
  )
}