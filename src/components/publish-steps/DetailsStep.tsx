import React, { useState } from 'react';

interface DetailsStepProps {
  title: string;
  description: string;
  onUpdateTitle: (title: string) => void;
  onUpdateDescription: (description: string) => void;
}

const DetailsStep: React.FC<DetailsStepProps> = ({
  title,
  description,
  onUpdateTitle,
  onUpdateDescription
}) => {
  const maxTitleLength = 40;
  const maxDescriptionLength = 1000;

  const [titleCharsLeft, setTitleCharsLeft] = useState(maxTitleLength - title.length);
  const [descriptionCharsLeft, setDescriptionCharsLeft] = useState(
    maxDescriptionLength - description.length
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value.slice(0, maxTitleLength);
    onUpdateTitle(newTitle);
    setTitleCharsLeft(maxTitleLength - newTitle.length);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value.slice(0, maxDescriptionLength);
    onUpdateDescription(newDescription);
    setDescriptionCharsLeft(maxDescriptionLength - newDescription.length);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <label htmlFor="title" className="block text-lg font-medium">
            Titre de l&apos;annonce
          </label>
          <span 
            className={`text-xs ${
              titleCharsLeft < 10 
                ? 'text-warning-500' 
                : titleCharsLeft < 5 
                  ? 'text-error-500' 
                  : 'text-gray-500'
            }`}
          >
            {titleCharsLeft} caractères restants
          </span>
        </div>
        <input
          id="title"
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Entrez le titre"
          maxLength={maxTitleLength}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <label htmlFor="description" className="block text-lg font-medium">
            Description de l&apos;annonce
          </label>
          <span 
            className={`text-xs ${
              descriptionCharsLeft < 100 
                ? 'text-warning-500' 
                : descriptionCharsLeft < 50 
                  ? 'text-error-500' 
                  : 'text-gray-500'
            }`}
          >
            {descriptionCharsLeft} caractères restants
          </span>
        </div>
        <textarea
          id="description"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Entrez le titre"
          maxLength={maxDescriptionLength}
          rows={10}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 resize-none"
        ></textarea>
      </div>
    </div>
  );
};

export default DetailsStep;
