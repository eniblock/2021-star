export interface FormulaireOrdreDebutLimitationFichier {
  fichier: File;
}

export interface FormulaireOrdreFinLimitationFichier {
  fichier: File;
}

export interface FormulaireOrdreFinLimitation {
  originAutomationRegisteredResourceMrid: string;
  registeredResourceMrid: string;
  senderMarketParticipantMrid: string;
  receiverMarketParticipantMrid: string;
  orderValue: string;
  measurementUnitName: string;
  messageType: string;
  businessType: string;
  reasonCode: string;
  endCreatedDateTime: string;
}
