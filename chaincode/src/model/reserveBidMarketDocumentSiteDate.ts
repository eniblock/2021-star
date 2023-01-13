import * as Yup from 'yup';

export class ReserveBidMarketDocumentSiteDate {

    public static readonly schema = Yup.object().shape({
        meteringPointMrid: Yup.string().required('meteringPointMrid is a compulsory string.').typeError('meteringPointMrid must be a string'),
        referenceDateTime: Yup.string().required('referenceDateTime is a compulsory string.').typeError('referenceDateTime must be a string'),
    });

    public static formatString(inputString: string): ReserveBidMarketDocumentSiteDate {
        let reserveBidObj: ReserveBidMarketDocumentSiteDate;
        try {
            reserveBidObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR -> Input string NON-JSON value`);
        }

        ReserveBidMarketDocumentSiteDate.schema.validateSync(
            reserveBidObj,
            {strict: true, abortEarly: false},
        );
        return reserveBidObj;
    }

    public static formatListString(inputString: string): ReserveBidMarketDocumentSiteDate[] {
        let reserveBidList: ReserveBidMarketDocumentSiteDate[] = [];
        try {
            reserveBidList = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR -> Input string NON-JSON value`);
        }

        if (reserveBidList && reserveBidList.length > 0) {
            for (const reserveBidObj of reserveBidList) {
                ReserveBidMarketDocumentSiteDate.schema.validateSync(
                    reserveBidObj,
                    {strict: true, abortEarly: false},
                );
            }
        }
        return reserveBidList;
    }

    public meteringPointMrid: string;
    public referenceDateTime?: string;
    public includeNext?: boolean = false;
}
