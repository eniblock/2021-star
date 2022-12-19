import * as Yup from 'yup';
import { DocType } from '../enums/DocType';
import { AttachmentFileWithStatus } from './attachmentFileWithStatus';

export class ReserveBidMarketDocument {

    public static readonly schema = Yup.object().shape({
        businessType: Yup.string().notRequired().typeError('businessType must be a string'),
        createdDateTime: Yup.string().required('createdDateTime is a compulsory string.').typeError('createdDateTime must be a string'),
        docType: Yup.string().notRequired().typeError('docType must be a string'),
        messageType: Yup.string().notRequired().typeError('messageType must be a string'),
        meteringPointMrid: Yup.string().required('meteringPointMrid is a compulsory string.').typeError('meteringPointMrid must be a string'),
        processType: Yup.string().notRequired().typeError('processType must be a string'),

        marketType:  Yup.string().notRequired().typeError('marketType must be a string'),

        quantityMeasureUnitName: Yup.string().notRequired().typeError('quantityMeasureUnitName must be a string'),
        receiverMarketParticipantMrid: Yup.string().notRequired().typeError('receiverMarketParticipantMrid must be a string'),
        reserveBidMrid: Yup.string().required('reserveBidMrid is a compulsory string.').typeError('reserveBidMrid must be a string'),
        reserveBidStatus: Yup.string().notRequired().typeError('reserveBidStatus must be a string'),
        revisionNumber: Yup.string().notRequired().typeError('revisionNumber must be a string'),
        senderMarketParticipantMrid: Yup.string().notRequired()
            .typeError('senderMarketParticipantMrid must be a string'),
        validityPeriodEndDateTime: Yup.string().notRequired().typeError('validityPeriodEndDateTime must be a string'),
        validityPeriodStartDateTime: Yup.string().notRequired()
            .typeError('validityPeriodStartDateTime must be a string'),

        currencyUnitName: Yup.string().notRequired().typeError('currencyUnitName must be a string'),
        energyPriceAmount: Yup.number().required('energyPriceAmount is a compulsory number.').typeError('energyPriceAmount must be a number'),
        flowDirection: Yup.string().notRequired().typeError('flowDirection must be a string'),
        priceMeasureUnitName: Yup.string().notRequired().typeError('priceMeasureUnitName must be a string'),

        attachments: Yup.array().of(Yup.string()).notRequired(),

        attachmentsWithStatus: Yup.array().notRequired(),
    });

    public static formatString(inputString: string): ReserveBidMarketDocument {
        let reserveBidObj: ReserveBidMarketDocument;
        try {
            reserveBidObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR ${DocType.RESERVE_BID_MARKET_DOCUMENT} -> Input string NON-JSON value`);
        }

        try {
            ReserveBidMarketDocument.schema.validateSync(
                reserveBidObj,
                {strict: true, abortEarly: false},
            );
        } catch (error) {
            throw error;
        }
        return reserveBidObj;
    }

    public static formatListString(inputString: string): ReserveBidMarketDocument[] {
        let reserveBidList: ReserveBidMarketDocument[] = [];
        try {
            reserveBidList = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR ${DocType.RESERVE_BID_MARKET_DOCUMENT} by list -> Input string NON-JSON value`);
        }

        if (reserveBidList && reserveBidList.length > 0) {
            for (const reserveBidObj of reserveBidList) {
                try {
                    ReserveBidMarketDocument.schema.validateSync(
                        reserveBidObj,
                        {strict: true, abortEarly: false},
                    );
                } catch (error) {
                    throw error;
                }
            }
        }
        return reserveBidList;
    }

    public docType?: string;

    public reserveBidMrid: string;
    public reserveBidStatus?: string;

    public marketType?: string;

    public meteringPointMrid: string;
    public revisionNumber?: string;
    public messageType?: string;
    public processType?: string;
    public senderMarketParticipantMrid?: string;
    public receiverMarketParticipantMrid?: string;
    public createdDateTime: string;
    public validityPeriodStartDateTime?: string;
    public validityPeriodEndDateTime?: string;
    public businessType?: string;
    public quantityMeasureUnitName?: string;
    public priceMeasureUnitName?: string;
    public currencyUnitName?: string;
    public flowDirection: string;
    public energyPriceAmount: number;

    public attachments?: string[];
    public attachmentsWithStatus?: AttachmentFileWithStatus[];
}
