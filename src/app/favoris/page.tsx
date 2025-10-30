import ComingSoonView from '@/views/ComingSoonView'

export default function FavorisPage() {
  return (
    <ComingSoonView 
      title="Favoris"
      description="Retrouvez ici toutes vos annonces favorites. Cette fonctionnalité sera bientôt disponible pour vous permettre de sauvegarder vos annonces préférées."
      icon="favorite"
    />
  )
}

export const metadata = {
  title: 'Favoris | YamoZone',
  description: 'Retrouvez toutes vos annonces favorites sur YamoZone'
}
