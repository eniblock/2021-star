import * as Yup from 'yup';

export class ReserveBidMarketDocumentFileList {
    public static formatString(inputString: string) : ReserveBidMarketDocumentFileList {
        let reserveBidObj: ReserveBidMarketDocumentFileList;
        try {
            reserveBidObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR -> Input string NON-JSON value`);
        }

        try {
            ReserveBidMarketDocumentFileList.schema.validateSync(
                reserveBidObj,
                {strict: true, abortEarly: false},
            );
        } catch (error) {
            throw error;
        }
        return reserveBidObj;
    }

    public static formatListString(inputString: string) : ReserveBidMarketDocumentFileList[] {
        let reserveBidList: ReserveBidMarketDocumentFileList[] = [];
        try {
            reserveBidList = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR -> Input string NON-JSON value`);
        }

        if (reserveBidList && reserveBidList.length > 0) {
            for (var reserveBidObj of reserveBidList) {
                try {
                    ReserveBidMarketDocumentFileList.schema.validateSync(
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
        ReserveBidMrid: Yup.string().required('ReserveBidMrid is a compulsory string.').typeError('ReserveBidMrid must be a string'),
        attachments: Yup.array().of(Yup.string()).notRequired(),
    });


    public ReserveBidMrid: string;

    public attachments?: string[];
}
