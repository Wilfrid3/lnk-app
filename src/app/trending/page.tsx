import ComingSoonView from '@/views/ComingSoonView'

export default function TrendingPage() {
  return (
    <ComingSoonView 
      title="Tendances"
      description="Découvrez les annonces les plus populaires et les tendances du moment. Cette section sera bientôt disponible avec des statistiques en temps réel."
      icon="trending_up"
    />
  )
}

export const metadata = {
  title: 'Tendances | yamohub',
  description: 'Découvrez les annonces les plus populaires et les tendances du moment sur yamohub'
}
