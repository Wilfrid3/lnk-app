'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PublishLayout from '@/components/layouts/PublishLayout'
import StepIndicator from '@/components/StepIndicator'
import ServicesStep from '@/components/publish-steps/ServicesStep'
import MediaStep from '@/components/publish-steps/MediaStep'
import DetailsStep from '@/components/publish-steps/DetailsStep'
import LocationStep from '@/components/publish-steps/LocationStep'
import PreferencesStep from '@/components/publish-steps/PreferencesStep'
import apiClient from '@/lib/axios'
import { AxiosError } from '@/types/global'
import { ClientType, TravelOption } from '@/types/enums'

// Define the form data structure
interface FormData {
  services: { service: string; price: string }[];
  title: string;
  description: string;
  mainPhoto: File | null;
  additionalPhotos: File[];
  videos: File[];
  clientType: string;
  appearance: string;
  offerings: string[];
  city: string;
  neighborhood: string;
  travelOption: string;
  phoneNumber: string;
  whatsappNumber: string;
}

export default function PublishView() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+237");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    services: [{ service: '', price: '' }],
    title: '',
    description: '',
    mainPhoto: null,
    additionalPhotos: [],
    videos: [],
    clientType: '',
    appearance: '',
    offerings: [],
    city: '',
    neighborhood: '',
    travelOption: '',
    phoneNumber: '',
    whatsappNumber: '',
  });

  const steps = [
    'Services',
    'Médias',
    'Détails',
    'Localisation',
    'Préférences',
  ];  // Form submission handler
  const handleSubmit = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    
    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Map clientType to one of the valid enum values
      let clientTypeValue: string;
      switch (formData.clientType.toLowerCase()) {
        case 'homme':
        case 'hommes':
          clientTypeValue = ClientType.HOMME; // 'homme'
          break;
        case 'femme':
        case 'femmes':
          clientTypeValue = ClientType.FEMME; // 'femme'
          break;
        case 'couple':
        case 'couples':
          clientTypeValue = ClientType.COUPLE; // 'couple'
          break;
        default:
          clientTypeValue = ClientType.TOUS; // 'tous'
          break;
      }
      
      // Map travelOption to one of the valid enum values
      let travelOptionValue: string;
      switch (formData.travelOption.toLowerCase()) {
        case 'reçoit':
        case 'recoit':
        case 'reçois':
        case 'recois':
          travelOptionValue = TravelOption.RECOIT; // 'reçoit'
          break;
        case 'se déplace':
        case 'se deplace':
          travelOptionValue = TravelOption.SE_DEPLACE; // 'se déplace'
          break;
        case 'les deux':
          travelOptionValue = TravelOption.LES_DEUX; // 'les deux'
          break;
        default:
          travelOptionValue = TravelOption.AUCUN; // 'aucun'
          break;
      }
      
      // Prepare post data with the correct enum values
      const postData = {
        title: formData.title,
        description: formData.description,
        services: formData.services
          .map(s => ({
            service: s.service,
            price: parseFloat(s.price) || 0
          }))
          .filter(s => s.service.trim() !== ''),
        clientType: clientTypeValue,
        appearance: formData.appearance,
        offerings: formData.offerings,
        city: formData.city,
        neighborhood: formData.neighborhood,
        travelOption: travelOptionValue,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: countryCode + formData.whatsappNumber.replace(/^0+/, ''),
        isActive: true
      };
      
      // Add the JSON string of post data to the FormData
      formDataToSend.append('postData', JSON.stringify(postData));
      
      // Handle photo organization: if no main photo but additional photos exist,
      // use the first additional photo as main photo
      let mainPhotoToSend = formData.mainPhoto;
      let additionalPhotosToSend = formData.additionalPhotos;
      
      if (!mainPhotoToSend && additionalPhotosToSend && additionalPhotosToSend.length > 0) {
        // Move first additional photo to main photo
        mainPhotoToSend = additionalPhotosToSend[0];
        additionalPhotosToSend = additionalPhotosToSend.slice(1);
      }
      
      // Add main photo if available
      if (mainPhotoToSend) {
        formDataToSend.append('mainPhoto', mainPhotoToSend);
      }
      
      // Add remaining additional photos if available
      if (additionalPhotosToSend && additionalPhotosToSend.length > 0) {
        additionalPhotosToSend.forEach(photo => {
          formDataToSend.append('additionalPhotos', photo);
        });
      }
      
      // Add videos if available
      if (formData.videos && formData.videos.length > 0) {
        formData.videos.forEach(video => {
          formDataToSend.append('videos', video);
        });
      }
      
      // Make the API call using apiClient
      await apiClient.post('/posts', formDataToSend, {
        headers: {
          // Override the default content type for FormData
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Redirect to success page or show confirmation
      router.push('/publish/success');
    } catch (error: unknown) { // Using unknown as the most type-safe approach
      console.error('Error submitting form:', error);
        // Type guard for axios errors
      
      
      // Handle Axios errors specifically
      if (typeof error === 'object' && error !== null && 'isAxiosError' in error) {
        const axiosError = error as AxiosError;
        // Extract message from the Axios error response data if available
        const errorMessage = axiosError.response?.data?.message 
          || axiosError.message 
          || 'Une erreur est survenue lors de la création de l\'annonce';
        setErrorMessage(errorMessage);
      } else {
        // For non-axios errors
        const errMsg = error instanceof Error 
          ? error.message 
          : 'Une erreur est survenue lors de la création de l\'annonce';
        setErrorMessage(errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update form data 
  const updateFormData = (field: keyof FormData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Navigation between steps
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Check if current step is valid
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 0: // Services step
        return formData.services.length > 0 && 
               formData.services.some(s => s.service.trim() !== '');
      case 1: // Media step
        return true; // Media are optional
      case 2: // Details step
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 3: // Location step
        return formData.city !== '' && formData.phoneNumber.trim() !== '';
      case 4: // Preferences step
        return formData.clientType !== '';
      default:
        return true;
    }
  };

  // Skip step option for services
  const handleSkipStep = () => {
    if (currentStep === 0) {
      // If skipping services step, set an empty array
      updateFormData('services', []);
    }
    goToNextStep();
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ServicesStep 
            services={formData.services}
            onUpdate={(services) => updateFormData('services', services)} 
          />
        );
      case 1:
        return (
          <MediaStep
            mainPhoto={formData.mainPhoto}
            additionalPhotos={formData.additionalPhotos}
            videos={formData.videos}
            onUpdateMainPhoto={(photo) => updateFormData('mainPhoto', photo)}
            onUpdateAdditionalPhotos={(photos) => updateFormData('additionalPhotos', photos)}
            onUpdateVideos={(videos) => updateFormData('videos', videos)}
          />
        );
      case 2:
        return (
          <DetailsStep
            title={formData.title}
            description={formData.description}
            onUpdateTitle={(title) => updateFormData('title', title)}
            onUpdateDescription={(desc) => updateFormData('description', desc)}
          />
        );
      case 3:
        return (
          <LocationStep
            city={formData.city}
            neighborhood={formData.neighborhood}
            travelOption={formData.travelOption}
            phoneNumber={formData.phoneNumber}
            whatsappNumber={formData.whatsappNumber}
            countryCode={countryCode}
            handleCountryCodeChange={(code) => setCountryCode(code)}
            onUpdateCity={(city) => updateFormData('city', city)}
            onUpdateNeighborhood={(n) => updateFormData('neighborhood', n)}
            onUpdateTravelOption={(opt) => updateFormData('travelOption', opt)}
            onUpdatePhoneNumber={(num) => updateFormData('phoneNumber', num)}
            onUpdateWhatsappNumber={(num) => updateFormData('whatsappNumber', num)}
          />
        );
      case 4:
        return (
          <PreferencesStep
            clientType={formData.clientType}
            appearance={formData.appearance}
            offerings={formData.offerings}
            onUpdateClientType={(type) => updateFormData('clientType', type)}
            onUpdateAppearance={(app) => updateFormData('appearance', app)}
            onUpdateOfferings={(off) => updateFormData('offerings', off)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PublishLayout>
      <div className="px-4 sm:px-6 md:px-8 max-w-2xl mx-auto pb-24">
        <h1 className="text-2xl font-bold text-center my-6">Créez votre annonce</h1>
        
        <StepIndicator steps={steps} currentStep={currentStep} />
        
        {renderStep()}
      </div>
        {/* Error message display */}
      {errorMessage && (
        <div className="mb-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <span className="material-icons mr-2">error_outline</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}
      
      {/* Fixed Navigation Buttons at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-40">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            {currentStep > 0 ? (
              <button 
                onClick={goToPreviousStep}
                disabled={isLoading}
                className="py-2 px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Retour
              </button>
            ) : (
              currentStep === 0 && !isLoading && (
                <button
                  onClick={handleSkipStep}
                  className="py-2 px-6 text-primary-500 underline"
                >
                  Sauter cette étape
                </button>
              )
            )}
          </div>
          
          <button
            onClick={goToNextStep}
            disabled={!isCurrentStepValid() || isLoading}
            className={`py-2 px-6 bg-primary-500 text-white rounded-lg transition-colors flex items-center justify-center min-w-[100px] ${
              isCurrentStepValid() && !isLoading
                ? 'hover:bg-primary-600' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <span className="material-icons animate-spin mr-2 text-sm">autorenew</span>
                <span>{currentStep < steps.length - 1 ? 'Chargement...' : 'Publication...'}</span>
              </>
            ) : (
              currentStep < steps.length - 1 ? 'Suivant' : 'Publier'
            )}
          </button>
        </div>
      </div>
    </PublishLayout>
  )
}

