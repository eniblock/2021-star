import * as Yup from 'yup';

export class ReserveBidMarketDocumentAbstract {
    public static getId(obj: ReserveBidMarketDocumentAbstract): string {
        return obj.reserveBidMrid;
    }

    public reserveBidMrid: string;
    public reserveBidStatus: string;
    public validityPeriodStartDateTime?: string;
    public createdDateTime: string;
}

export class ActivationDocumentAbstract {
    public static getId(obj: ActivationDocumentAbstract): string {
        return obj.activationDocumentMrid;
    }

    public activationDocumentMrid: string;
    public startCreatedDateTime: string;
}

export class ActivationDocumentDateMax{
    public docType: string
    public dateTime: string;
}

export class EnergyAmountAbstract {
    public static getId(obj: EnergyAmountAbstract): string {
        return obj.energyAmountMarketDocumentMrid;
    }

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
