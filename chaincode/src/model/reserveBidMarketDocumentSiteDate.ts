import * as Yup from 'yup';

export class reserveBidMarketDocumentSiteDate {
    public static formatString(inputString: string) : reserveBidMarketDocumentSiteDate {
        let reserveBidObj: reserveBidMarketDocumentSiteDate;
        try {
            reserveBidObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR -> Input string NON-JSON value`);
        }

        try {
            reserveBidMarketDocumentSiteDate.schema.validateSync(
                reserveBidObj,
                {strict: true, abortEarly: false},
            );
        } catch (error) {
            throw error;
        }
        return reserveBidObj;
    }

    public static formatListString(inputString: string) : reserveBidMarketDocumentSiteDate[] {
        let reserveBidList: reserveBidMarketDocumentSiteDate[] = [];
        try {
            reserveBidList = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR -> Input string NON-JSON value`);
        }

        if (reserveBidList && reserveBidList.length > 0) {
            for (var reserveBidObj of reserveBidList) {
                try {
                    reserveBidMarketDocumentSiteDate.schema.validateSync(
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
