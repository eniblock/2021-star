export interface FormulaireOrdreDebutLimitationFichier {
  files: File[];
}

export interface FormulaireOrdreFinLimitationFichier {
  files: File[];
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
