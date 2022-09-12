import * as Yup from 'yup';
import { FileWithStatus } from './file';

export class ReserveBidMarketDocument {
    public static readonly schema = Yup.object().shape({
        docType: Yup.string().notRequired().typeError('docType must be a string'),

        ReserveBidMrid: Yup.string().required('ReserveBidMrid is a compulsory string.').typeError('ReserveBidMrid must be a string'),
        meteringPointMrid: Yup.string().required('meteringPointMrid is a compulsory string.').typeError('meteringPointMrid must be a string'),
        revisionNumber: Yup.string().notRequired().typeError('revisionNumber must be a string'),
        messageType: Yup.string().required('messageType is a compulsory string.').typeError('messageType must be a string'),
        processsType: Yup.string().required('processsType is a compulsory string.').typeError('processsType must be a string'),
        senderMarketParticipantMrid: Yup.string().required('senderMarketParticipantMrid is a compulsory string.').typeError('senderMarketParticipantMrid must be a string'),
        receiverMarketParticipantMrid: Yup.string().required('receiverMarketParticipantMrid is a compulsory string.').typeError('receiverMarketParticipantMrid must be a string'),
        createdDateTime: Yup.string().required('createdDateTime is a compulsory string.').typeError('createdDateTime must be a string'),
        validityPeriodStartDateTime: Yup.string().notRequired().typeError('validityPeriodStartDateTime must be a string'),
        validityPeriodEndDateTime: Yup.string().notRequired().typeError('validityPeriodEndDateTime must be a string'),
        businessType: Yup.string().notRequired().typeError('businessType must be a string'),
        quantityMeasureUnitName: Yup.string().notRequired().typeError('quantityMeasureUnitName must be a string'),
        priceMeasureUnitName: Yup.string().required('priceMeasureUnitName is a compulsory string.').typeError('priceMeasureUnitName must be a string'),
        currencyUnitName: Yup.string().required('flowcurrencyUnitNameDirection is a compulsory string.').typeError('currencyUnitName must be a string'),
        flowDirection: Yup.string().notRequired().typeError('flowDirection must be a string'),
        energyPriceAmount: Yup.number().required('energyPriceAmount is a compulsory number.').typeError('energyPriceAmount must be a number'),

        attachments: Yup.array().notRequired(),
    });

    public docType?: string;

    public ReserveBidMrid: string;
    public meteringPointMrid: string;
    public revisionNumber?: string;
    public messageType: string;
    public processsType: string;
    public senderMarketParticipantMrid: string;
    public receiverMarketParticipantMrid: string;
    public createdDateTime: string;
    public validityPeriodStartDateTime?: string;
    public validityPeriodEndDateTime?: string;
    public businessType?: string;
    public quantityMeasureUnitName?: string;
    public priceMeasureUnitName: string;
    public currencyUnitName: string;
    public flowDirection?: string;
    public energyPriceAmount: number;

    public attachments?: FileWithStatus[];
}
