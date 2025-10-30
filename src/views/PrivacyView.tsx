'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useAgeVerification } from '@/contexts/AgeVerificationContext'

export default function PrivacyView() {
  const { setTempExempt } = useAgeVerification();
  const router = useRouter();

  // Keep the temp exemption active while viewing the privacy policy
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Politique de Confidentialité</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Dernière mise à jour : {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose dark:prose-invert max-w-none prose-headings:text-primary-500 prose-headings:font-medium prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-li:text-gray-600 dark:prose-li:text-gray-300">
          <p className="text-lg mb-6">
            La protection de vos données personnelles est importante pour nous. Cette Politique de Confidentialité 
            explique comment nous collectons, utilisons, divulguons et prot e9geons vos informations lorsque vous
            utilisez notre application mobile et site web YamoZone (ci-apr e8s &quot;l&apos;Application&quot;).
          </p>

          <h2 className="text-xl mt-8 mb-4">1. Informations que nous collectons</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>Nous collectons les types d&apos;informations suivants:</p>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">1.1 Informations que vous nous fournissez</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><span className="font-medium">Informations d&apos;inscription:</span> nom, prénom, âge, numéro de téléphone, adresse email, mot de passe.</li>
              <li><span className="font-medium">Informations de profil:</span> photos, descriptions, préférences, localisation.</li>
              <li><span className="font-medium">Communications:</span> messages que vous échangez avec d&apos;autres utilisateurs via l&apos;Application.</li>
              <li><span className="font-medium">Contenu utilisateur:</span> annonces, commentaires et autres contenus que vous publiez.</li>
              <li><span className="font-medium">Informations de transaction:</span> données relatives aux achats effectués sur l&apos;Application.</li>
            </ul>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">1.2 Informations collectées automatiquement</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><span className="font-medium">Données d&apos;utilisation:</span> comment vous interagissez avec l&apos;Application, fréquence et durée d&apos;utilisation.</li>
              <li><span className="font-medium">Informations sur l&apos;appareil:</span> modèle, système d&apos;exploitation, identifiants uniques, réseau mobile.</li>
              <li><span className="font-medium">Données de localisation:</span> localisation précise avec votre consentement, ou localisation approximative basée sur l&apos;adresse IP.</li>
              <li><span className="font-medium">Cookies et technologies similaires:</span> données collectées via cookies, pixels et technologies similaires.</li>
            </ul>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">2. Utilisation des informations</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>Nous utilisons vos informations pour:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              <div className="flex items-start">
                <span className="material-icons text-primary-500 mr-2 mt-0.5">check_circle</span>
                <p>Fournir, maintenir et améliorer l&apos;Application</p>
              </div>
              <div className="flex items-start">
                <span className="material-icons text-primary-500 mr-2 mt-0.5">check_circle</span>
                <p>Créer et maintenir votre compte</p>
              </div>
              <div className="flex items-start">
                <span className="material-icons text-primary-500 mr-2 mt-0.5">check_circle</span>
                <p>Traiter vos transactions</p>
              </div>
              <div className="flex items-start">
                <span className="material-icons text-primary-500 mr-2 mt-0.5">check_circle</span>
                <p>Vous permettre de communiquer avec d&apos;autres utilisateurs</p>
              </div>
              <div className="flex items-start">
                <span className="material-icons text-primary-500 mr-2 mt-0.5">check_circle</span>
                <p>Personnaliser votre expérience</p>
              </div>
              <div className="flex items-start">
                <span className="material-icons text-primary-500 mr-2 mt-0.5">check_circle</span>
                <p>Vous envoyer des notifications importantes</p>
              </div>
              <div className="flex items-start">
                <span className="material-icons text-primary-500 mr-2 mt-0.5">check_circle</span>
                <p>Surveiller et analyser les tendances d&apos;utilisation</p>
              </div>
              <div className="flex items-start">
                <span className="material-icons text-primary-500 mr-2 mt-0.5">check_circle</span>
                <p>Détecter et prévenir les activités frauduleuses</p>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">3. Partage des informations</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p className="mb-3">Nous pouvons partager vos informations avec:</p>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                <p className="font-medium text-gray-900 dark:text-white mb-1">Autres utilisateurs :</p>
                <p className="text-sm">Les informations de votre profil et contenu que vous rendez publics sont visibles par d&apos;autres utilisateurs conformément à vos paramètres de confidentialité.</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                <p className="font-medium text-gray-900 dark:text-white mb-1">Prestataires de services :</p>
                <p className="text-sm">Nous partageons vos informations avec des fournisseurs tiers qui fournissent des services en notre nom (traitement des paiements, hébergement, analyses, etc.).</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                <p className="font-medium text-gray-900 dark:text-white mb-1">Partenaires commerciaux :</p>
                <p className="text-sm">Nous pouvons partager des informations limitées avec nos partenaires commerciaux pour offrir certains produits, services ou promotions.</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                <p className="font-medium text-gray-900 dark:text-white mb-1">Conformité légale :</p>
                <p className="text-sm">Nous pouvons divulguer vos informations si nous y sommes légalement obligés, pour protéger nos droits, votre sécurité ou celle d&apos;autrui, pour enquêter sur une fraude ou répondre à une demande gouvernementale.</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                <p className="font-medium text-gray-900 dark:text-white mb-1">Transfert d&apos;entreprise :</p>
                <p className="text-sm">En cas de fusion, acquisition, ou vente de tout ou partie de nos actifs, vos informations peuvent faire partie des actifs transférés.</p>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">4. Sécurité des données</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger 
              vos informations contre la perte, l&apos;accès non autorisé, la divulgation ou la modification. Cependant,
              aucune méthode de transmission sur Internet ou de stockage électronique n&apos;est totalement sécurisée.
              Par conséquent, nous ne pouvons garantir une sécurité absolue.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mt-3">
              <div className="flex items-start">
                <span className="material-icons text-warning-500 mr-2">info</span>
                <p className="text-sm">
                  Bien que nous prenions des mesures pour protéger vos informations, nous vous encourageons à prendre des précautions pour protéger vos données personnelles, notamment en utilisant un mot de passe fort et unique.
                </p>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">5. Conservation des données</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              Nous conservons vos informations aussi longtemps que nécessaire pour fournir les services que vous avez 
              demandés, ou pour d&apos;autres fins essentielles telles que se conformer à nos obligations légales, résoudre
              les litiges et appliquer nos politiques. Les périodes de conservation spécifiques varient selon le type 
              d&apos;information et les exigences applicables.
            </p>
            
            <p className="mt-3">
              Vous pouvez demander la suppression de votre compte à tout moment. Veuillez noter que certaines informations peuvent être conservées même après la suppression de votre compte, dans la mesure permise ou requise par la loi.
            </p>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">6. Vos droits</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              Selon votre lieu de résidence, vous pouvez avoir certains droits concernant vos informations personnelles:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <span className="material-icons text-primary-500 mr-2">check_circle</span>
                <span>Accéder à vos informations personnelles</span>
              </div>
              <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <span className="material-icons text-primary-500 mr-2">check_circle</span>
                <span>Corriger les informations inexactes</span>
              </div>
              <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <span className="material-icons text-primary-500 mr-2">check_circle</span>
                <span>Supprimer vos informations</span>
              </div>
              <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <span className="material-icons text-primary-500 mr-2">check_circle</span>
                <span>Restreindre le traitement de vos données</span>
              </div>
              <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <span className="material-icons text-primary-500 mr-2">check_circle</span>
                <span>La portabilité des données</span>
              </div>
              <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <span className="material-icons text-primary-500 mr-2">check_circle</span>
                <span>Retirer votre consentement</span>
              </div>
            </div>
            <p className="mt-4">
              Pour exercer ces droits, veuillez nous contacter via les coordonnées fournies à la fin de cette politique.
            </p>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">7. Transferts internationaux de données</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              Vos informations peuvent être transférées et traitées dans des pays autres que celui dans lequel vous 
              résidez. Ces pays peuvent avoir des lois sur la protection des données différentes des lois de votre pays. 
              Lorsque nous transférons des informations à l&apos;international, nous prenons des mesures pour assurer que
              vos informations bénéficient d&apos;une protection adéquate.
            </p>
            
            <p className="mt-3">
              En utilisant notre Application, vous reconnaissez et acceptez que vos informations puissent être transférées vers et traitées dans d&apos;autres pays.
            </p>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">8. Protection de la vie privée des mineurs</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start">
              <span className="material-icons text-red-500 mr-2 mt-0.5">warning</span>
              <div>
                <p className="font-semibold text-red-600 dark:text-red-400">Important :</p>
                <p>
                  L&apos;Application n&apos;est pas destinée aux personnes de moins de 18 ans. Nous ne collectons pas sciemment des
                  informations personnelles auprès de personnes de moins de 18 ans. Si nous apprenons que nous avons collecté 
                  des informations personnelles d&apos;une personne de moins de 18 ans, nous prendrons des mesures pour supprimer
                  ces informations de nos serveurs.
                </p>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">9. Liens vers d&apos;autres sites</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              L&apos;Application peut contenir des liens vers d&apos;autres sites qui ne sont pas exploités par nous. Si vous
              cliquez sur un lien tiers, vous serez dirigé vers le site de ce tiers. Nous vous conseillons vivement de 
              consulter la politique de confidentialité de chaque site que vous visitez. Nous n&apos;avons aucun contrôle et
              n&apos;assumons aucune responsabilité pour le contenu, les politiques de confidentialité ou les pratiques des
              sites ou services tiers.
            </p>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">10. Modifications de la politique de confidentialité</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              Nous pouvons mettre à jour notre politique de confidentialité de temps à autre. Nous vous informerons de 
              tout changement en publiant la nouvelle politique de confidentialité sur cette page et en vous informant 
              via une notification dans l&apos;Application. Il vous est conseillé de consulter périodiquement cette politique
              de confidentialité pour prendre connaissance des modifications.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mt-3">
              <p className="text-sm">
                La date de dernière mise à jour indiquée en haut de cette page vous permet de savoir quand cette politique a été révisée pour la dernière fois.
              </p>
            </div>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">11. Non-responsabilité pour les actions des utilisateurs</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              Nous ne pouvons pas contrôler les actions des autres utilisateurs avec lesquels vous partagez vos 
              informations. Nous ne pouvons pas et ne garantissons pas que votre contenu ne sera pas consulté par des 
              personnes non autorisées. Vous comprenez et reconnaissez que, même après la suppression, des copies de 
              votre contenu peuvent rester visibles dans des pages mises en cache et archivées, ou si d&apos;autres utilisateurs
              ont copié ou stocké votre contenu.
            </p>
          </div>
          
          <h2 className="text-xl mt-8 mb-4">12. Contact</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
            <p>
              Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter à:
            </p>
            <div className="mt-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-md flex items-center">
              <span className="material-icons text-primary-500 mr-2">email</span>
              <a href="mailto:privacy@leyamo.com" className="text-primary-500 hover:underline">privacy@leyamo.com</a>
            </div>
            
            <p className="mt-4 font-medium">
              En utilisant l&apos;Application, vous consentez à la collecte et à l&apos;utilisation de vos informations comme
              décrit dans cette Politique de Confidentialité.
            </p>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}
