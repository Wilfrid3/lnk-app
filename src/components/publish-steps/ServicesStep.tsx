import React, { useState } from 'react';

interface Service {
  service: string;
  price: string;
}

interface ServicesStepProps {
  services: Service[];
  onUpdate: (services: Service[]) => void;
}

const ServicesStep: React.FC<ServicesStepProps> = ({ services, onUpdate }) => {
  // Track validation errors for prices
  const [priceErrors, setPriceErrors] = useState<{[key: number]: string}>({});

  const addService = () => {
    onUpdate([...services, { service: '', price: '' }]);
  };

  const removeService = (index: number) => {
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    onUpdate(updatedServices);
    
    // Clear any errors for this index
    if (priceErrors[index]) {
      const newErrors = { ...priceErrors };
      delete newErrors[index];
      setPriceErrors(newErrors);
    }
  };

  const updateService = (index: number, field: keyof Service, value: string) => {
    const updatedServices = [...services];
    updatedServices[index][field] = value;
    
    // Validate price if the price field is being updated
    if (field === 'price') {
      // Only allow numeric input
      if (value && !/^\d*$/.test(value)) {
        return; // Don't update if not a number
      }
      
      // Clear error if field is empty (allowing user to type)
      if (!value) {
        if (priceErrors[index]) {
          const newErrors = { ...priceErrors };
          delete newErrors[index];
          setPriceErrors(newErrors);
        }
      } 
      // Validate minimum price if there's a value
      else if (parseInt(value) < 1000) {
        setPriceErrors({
          ...priceErrors,
          [index]: 'Min 1000'
        });
      } else {
        // Clear error if price is valid
        if (priceErrors[index]) {
          const newErrors = { ...priceErrors };
          delete newErrors[index];
          setPriceErrors(newErrors);
        }
      }
    }
    
    onUpdate(updatedServices);
  };

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-base">
            Ceci permet d&apos;attirer le client en proposant certains services.
            Il pourra faire une réservation. L&apos;option{' '}
            <span className="text-primary-500">réservation</span> est uniquement disponible pour les membres{' '}
            <span className="text-primary-500">Premium</span>.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-7 font-medium">Services</div>
            <div className="col-span-3 font-medium">Prix</div>
            <div className="col-span-2 font-medium text-center">Action</div>
          </div>
          
          {services.map((service, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 sm:gap-4 items-center">
              <div className="col-span-7">
                <input
                  type="text"
                  value={service.service}
                  onChange={(e) => updateService(index, 'service', e.target.value)}
                  placeholder="Entrez le service"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div className="col-span-3 relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={service.price}
                  onChange={(e) => updateService(index, 'price', e.target.value)}
                  placeholder="Min 1000"
                  className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                    priceErrors[index] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {priceErrors[index] && (
                  <p className="absolute text-xs text-red-500 mt-0.5">{priceErrors[index]}</p>
                )}
              </div>
              <div className="col-span-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"
                >
                  <span className="material-icons">delete</span>
                </button>
              </div>
            </div>
          ))}
          
          <div className="pt-2">
            <button
              type="button"
              onClick={addService}
              className="flex items-center text-primary-500 hover:text-primary-600"
            >
              <span className="material-icons mr-1">add_circle</span>
              <span>Ajouter un service</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center text-primary-500">
        <p>
          Vous pouvez sauter cette étape et publier directement votre annonce
        </p>
      </div>
    </div>
  );
};

export default ServicesStep;
