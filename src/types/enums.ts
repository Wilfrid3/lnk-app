// Define enums to match API expected values exactly
export enum ClientType {
  HOMME = 'homme',
  FEMME = 'femme',
  COUPLE = 'couple',
  TOUS = 'tous',
}

export enum TravelOption {
  RECOIT = 'reçoit',
  SE_DEPLACE = 'se déplace',
  LES_DEUX = 'les deux',
  AUCUN = 'aucun',
}

// Maps for user-friendly display values
export const clientTypeLabels: Record<ClientType, string> = {
  [ClientType.HOMME]: 'Hommes',
  [ClientType.FEMME]: 'Femmes',
  [ClientType.COUPLE]: 'Couples',
  [ClientType.TOUS]: 'Tous',
};

export const travelOptionLabels: Record<TravelOption, string> = {
  [TravelOption.RECOIT]: 'Reçois',
  [TravelOption.SE_DEPLACE]: 'Se déplace',
  [TravelOption.LES_DEUX]: 'Les deux',
  [TravelOption.AUCUN]: 'Aucun',
};

// Convert display labels back to enum values
export const getClientTypeFromLabel = (label: string): ClientType => {
  const entry = Object.entries(clientTypeLabels).find(([, labelValue]) => labelValue === label);
  return entry ? entry[0] as ClientType : ClientType.TOUS;
};

export const getTravelOptionFromLabel = (label: string): TravelOption => {
  const entry = Object.entries(travelOptionLabels).find(([, labelValue]) => labelValue === label);
  return entry ? entry[0] as TravelOption : TravelOption.AUCUN;
};