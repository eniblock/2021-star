
export class BalancingDocument {

    public docType: string;

    public balancingDocumentMrid?: string;
    public activationDocumentMrid?: string;
    public energyAmountMarketDocumentMrid?: string;
    public reserveBidMrid?: string;
    public revisionNumber: string;
    public messageType: string;
    public processsType: string;
    public senderMarketParticipantMrid?: string;
    public receiverMarketParticipantMrid?: string;
    public createdDateTime?: string;
    public period?: string;
    public businessType: string;
    public quantityMeasureUnitName?: string;
    public priceMeasureUnitName?: string;
    public currencyUnitName?: string;
    public meteringPointMrid?: string;
    public direction: string;
    public quantity?: number;
    public activationPriceAmount?: number;
    public financialPriceAmount?: number;
}
