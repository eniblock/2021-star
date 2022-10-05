export class ReserveBidMarketDocumentAbstract {
    public reserveBidMrid: string;
    public validityPeriodStartDateTime?: string;
}

export class ActivationDocumentAbstract {
    public activationDocumentMrid: string;
    public startCreatedDateTime: string;
}

export class ActivationDocumentDateMax{
    public docType: string
    public dateTime: string;
}

export class EnergyAmountAbstract {
    public energyAmountMarketDocumentMrid: string;
}

export class IndexedData {
    public docType: string;
    public indexId: string;
    public indexedDataAbstractList: any[];
}
