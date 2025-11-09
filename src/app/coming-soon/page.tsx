import ComingSoonView from '@/views/ComingSoonView'

export default function ComingSoonPage() {
  return (
    <ComingSoonView 
      title="Bientôt disponible"
      description="Cette fonctionnalité sera disponible très prochainement. Nous travaillons activement pour vous offrir la meilleure expérience possible."
      icon="construction"
    />
  )
}

export const metadata = {
  title: 'Bientôt disponible | yamohub',
  description: 'Cette fonctionnalité sera bientôt disponible sur yamohub'
}
