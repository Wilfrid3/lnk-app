// This layout will be applied only to the post detail page
import { Suspense } from 'react'
import Loading from '@/components/Loading'

export default function PostDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  )
}
