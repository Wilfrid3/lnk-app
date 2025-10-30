import ChatView from '@/views/messages/ChatView'

interface ChatPageProps {
  readonly params: Promise<{
    readonly id: string
  }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params
  
  return (
    <ChatView 
      userId={id}
      conversationId={id}
    />
  )
}

export const metadata = {
  title: 'Chat | YamoZone',
  description: 'Messagerie privée avec les prestataires de services'
}
