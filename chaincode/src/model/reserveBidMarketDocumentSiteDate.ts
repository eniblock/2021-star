import * as Yup from 'yup';

export class ReserveBidMarketDocumentSiteDate {
    public static formatString(inputString: string) : ReserveBidMarketDocumentSiteDate {
        let reserveBidObj: ReserveBidMarketDocumentSiteDate;
        try {
            reserveBidObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR -> Input string NON-JSON value`);
        }

        try {
            ReserveBidMarketDocumentSiteDate.schema.validateSync(
                reserveBidObj,
                {strict: true, abortEarly: false},
            );
        } catch (error) {
            throw error;
        }
        return reserveBidObj;
    }

    public static formatListString(inputString: string) : ReserveBidMarketDocumentSiteDate[] {
        let reserveBidList: ReserveBidMarketDocumentSiteDate[] = [];
        try {
            reserveBidList = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR -> Input string NON-JSON value`);
        }

        if (reserveBidList && reserveBidList.length > 0) {
            for (var reserveBidObj of reserveBidList) {
                try {
                    ReserveBidMarketDocumentSiteDate.schema.validateSync(
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

    public static readonly schema = Yup.object().shape({
        meteringPointMrid: Yup.string().required('meteringPointMrid is a compulsory string.').typeError('meteringPointMrid must be a string'),
        referenceDateTime: Yup.string().required('referenceDateTime is a compulsory string.').typeError('referenceDateTime must be a string'),
    });


    public meteringPointMrid: string;
    public referenceDateTime?: string;
    public includeNext?: boolean = false;
}
