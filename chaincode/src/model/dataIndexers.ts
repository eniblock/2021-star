import * as Yup from 'yup';

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

    public static readonly schema = Yup.object().shape({
        docType: Yup.string().notRequired(),
        indexId: Yup.string().required('indexId is required').typeError('indexId must be a string'),
        indexedDataAbstractList: Yup.array().notRequired()
    });

    public docType?: string;
    public indexId: string;
    public indexedDataAbstractList?: any[];
}
