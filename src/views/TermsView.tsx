'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useAgeVerification } from '@/contexts/AgeVerificationContext'

export default function TermsView() {
  const { setTempExempt } = useAgeVerification();
  const router = useRouter();

  // Keep the temp exemption active while viewing the terms
  useEffect(() => {
    // Ensure exemption is set when this component mounts
    setTempExempt(true);
    
    // Clear the exemption when component unmounts
    return () => setTempExempt(false);
  }, [setTempExempt]);

  // Handle return click to maintain exemption
  const handleReturn = (e: React.MouseEvent) => {
    e.preventDefault();
    router.back();
    // No need to clear tempExempt as we want to maintain it when going back
  };

  return (
    <DefaultLayout hideFooter={false}>
      <div className="px-4 sm:px-6 md:px-8 py-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={handleReturn}
            className="inline-flex items-center text-primary-500 hover:underline mb-4"
          >
            <span className="material-icons text-sm mr-1">arrow_back_ios</span>
            Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conditions Générales d&apos;Utilisation</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Dernière mise à jour : {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose dark:prose-invert max-w-none prose-headings:text-primary-500 prose-headings:font-medium prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-li:text-gray-600 dark:prose-li:text-gray-300">
          <p className="text-lg mb-6">Veuillez lire attentivement ces conditions avant d&apos;utiliser notre application.</p>
          
          <h2 className="text-xl mt-8 mb-4">1. Acceptation des conditions</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              En accédant ou en utilisant l&apos;application mobile et le site web yamohub (ci-après &quot;l&apos;Application&quot;),
              vous acceptez d&apos;être lié par ces Conditions Générales d&apos;Utilisation. Si vous n&apos;acceptez pas ces conditions,
              veuillez ne pas utiliser l&apos;Application.
            </p>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">2. Admissibilité</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-white mb-2">Important :</p>
            <p>
              L&apos;utilisation de l&apos;Application est <span className="font-semibold">strictement réservée aux personnes âgées de 18 ans ou plus</span>.
              En utilisant l&apos;Application, vous déclarez et garantissez que vous avez au moins 18 ans. L&apos;Application
              se réserve le droit de demander une preuve d&apos;âge à tout moment et de suspendre ou supprimer votre
              compte si vous ne pouvez pas prouver que vous avez l&apos;âge requis.
            </p>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">3. Création de compte et sécurité</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              Pour utiliser certaines fonctionnalités de l&apos;Application, vous devez créer un compte utilisateur.
              Vous êtes responsable de maintenir la confidentialité de vos informations de connexion et de toutes 
              les activités qui se produisent sous votre compte. Vous vous engagez à:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Fournir des informations exactes, à jour et complètes lors de votre inscription</li>
              <li>Mettre à jour vos informations pour les maintenir exactes et à jour</li>
              <li>Protéger la sécurité de votre compte</li>
              <li>Informer immédiatement l&apos;Application de toute utilisation non autorisée de votre compte</li>
            </ul>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">4. Contenu de l&apos;utilisateur</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              Vous êtes seul responsable du contenu que vous publiez, téléchargez, soumettez ou rendez disponible 
              sur l&apos;Application (&quot;Contenu Utilisateur&quot;). En soumettant du Contenu Utilisateur, vous:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Garantissez que vous possédez tous les droits nécessaires sur ce Contenu Utilisateur</li>
              <li>Accordez à l&apos;Application une licence mondiale, non exclusive, libre de redevances pour utiliser, modifier,
              reproduire, distribuer et afficher ce Contenu Utilisateur</li>
              <li>Comprenez que l&apos;Application n&apos;approuve pas et n&apos;est pas responsable du Contenu Utilisateur</li>
            </ul>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">5. Contenu interdit</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-white mb-2">Interdictions importantes :</p>
            <p>
              Vous vous engagez à ne pas publier, télécharger ou partager du contenu qui:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Est illégal, frauduleux, trompeur ou nuisible</li>
              <li>Contient des informations fausses, trompeuses ou frauduleuses</li>
              <li className="text-red-600 dark:text-red-400 font-medium">Implique ou promeut la prostitution, le trafic d&apos;êtres humains ou toute autre forme d&apos;exploitation sexuelle</li>
              <li className="text-red-600 dark:text-red-400 font-medium">Contient des images ou descriptions de mineurs</li>
              <li>Viole les droits de propriété intellectuelle d&apos;autrui</li>
              <li>Incite à la haine, à la discrimination ou à la violence</li>
              <li>Est diffamatoire, obscène, pornographique ou offensant</li>
              <li>Contient des virus ou d&apos;autres codes malveillants</li>
              <li>Enfreint la vie privée d&apos;autrui</li>
            </ul>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">6. Conduite interdite</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              Vous vous engagez à ne pas:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Utiliser l&apos;Application pour des activités illégales</li>
              <li>Harceler, intimider ou menacer d&apos;autres utilisateurs</li>
              <li>Usurper l&apos;identité d&apos;une autre personne</li>
              <li>Tenter d&apos;obtenir un accès non autorisé à l&apos;Application ou aux systèmes connectés</li>
              <li>Interférer avec le fonctionnement normal de l&apos;Application</li>
              <li>Collecter des informations sur d&apos;autres utilisateurs sans leur consentement</li>
              <li>Utiliser l&apos;Application pour envoyer des messages non sollicités</li>
            </ul>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">7. Droits de modération et suspension de compte</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              L&apos;Application se réserve le droit, à sa seule discrétion, de:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Surveiller, examiner, filtrer, modifier ou supprimer tout Contenu Utilisateur</li>
              <li>Limiter ou refuser l&apos;accès à l&apos;Application à tout utilisateur pour quelque raison que ce soit</li>
              <li>Suspendre ou résilier votre compte en cas de violation des présentes conditions</li>
            </ul>
            <p>
              L&apos;Application n&apos;a aucune obligation de surveiller le contenu et ne garantit pas que le contenu offensant
              ou inapproprié sera supprimé.
            </p>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">8. Limitations de responsabilité</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-white mb-2">Avis important :</p>
            <p>
              Dans toute la mesure permise par la loi applicable:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>L&apos;Application est fournie &quot;telle quelle&quot; sans garantie d&apos;aucune sorte</li>
              <li>Nous déclinons toute garantie explicite ou implicite, y compris, mais sans s&apos;y limiter, les garanties de qualité
              marchande, d&apos;adéquation à un usage particulier et de non-violation</li>
              <li>Nous ne garantissons pas que l&apos;Application sera ininterrompue, sécurisée ou exempte d&apos;erreurs</li>
              <li>Nous ne sommes pas responsables de la conduite des utilisateurs, que ce soit en ligne ou hors ligne</li>
              <li>Nous ne serons pas responsables des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs</li>
            </ul>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">9. Indemnisation</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              Vous acceptez d&apos;indemniser, défendre et dégager de toute responsabilité l&apos;Application, ses affiliés,
              dirigeants, administrateurs, employés et agents contre toute réclamation, responsabilité, dommages, 
              pertes et dépenses, y compris, sans limitation, les frais juridiques et comptables raisonnables, 
              découlant de ou liés à:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Votre utilisation de l&apos;Application</li>
              <li>Votre violation des présentes Conditions</li>
              <li>Votre Contenu Utilisateur</li>
              <li>Votre interaction avec d&apos;autres utilisateurs</li>
            </ul>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">10. Modifications des conditions</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              Nous pouvons modifier ces Conditions à tout moment en publiant les conditions modifiées sur l&apos;Application.
              Votre utilisation continue de l&apos;Application après la publication des conditions modifiées constitue votre
              acceptation de ces modifications.
            </p>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">11. Résiliation</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              Nous pouvons résilier ou suspendre votre accès à l&apos;Application immédiatement, sans préavis ni responsabilité,
              pour quelque raison que ce soit, y compris, sans limitation, si vous violez ces Conditions. Vous pouvez 
              également résilier votre compte à tout moment en nous contactant.
            </p>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">12. Loi applicable et juridiction</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              Ces Conditions sont régies et interprétées conformément aux lois du Cameroun, sans égard aux principes de 
              conflits de lois. Tout litige découlant de ou lié à ces Conditions sera soumis à la juridiction exclusive 
              des tribunaux compétents du Cameroun.
            </p>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">13. Contact</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              Si vous avez des questions concernant ces Conditions, veuillez nous contacter à:
              <br />
              <a href="mailto:contact@leyamo.com" className="text-primary-500 hover:underline">contact@leyamo.com</a>
            </p>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}
