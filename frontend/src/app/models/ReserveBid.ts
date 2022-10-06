export interface ReserveBid {
  reserveBidMrid: string,
  meteringPointMrid: string,
  revisionNumber: string,
  messageType: string,
  processType: string,
  senderMarketParticipantMrid: string,
  receiverMarketParticipantMrid: string,
  createdDateTime: string,
  validityPeriodStartDateTime: string,
  validityPeriodEndDateTime: string,
  businessType: string,
  quantityMeasureUnitName: string,
  priceMeasureUnitName: string,
  currencyUnitName: string,
  flowDirection: string,
  energyPriceAmount: number,
  attachments: string[],
}

export interface FormulaireReserveBid {
  energyPriceAmount: number,
  validityPeriodStartDateTime: string,
  meteringPointMrid: string,
}
