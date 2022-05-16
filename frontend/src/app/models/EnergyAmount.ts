export interface FormulaireEnergyAmountFile {
  files: File[];
}

export interface FormulaireEnergyAmount {
  activationDocumentMrid: string;
  revisionNumber: string;
  processType: string;
  businessType: string;
  classificationType: string;
  quantity: number;
  measurementUnitName: string;
  timeInterval: string;
}
