import * as Yup from 'yup';

export class reserveBidMarketDocumentFileIdList {
    public static formatString(inputString: string) : reserveBidMarketDocumentFileIdList {
        let reserveBidObj: reserveBidMarketDocumentFileIdList;
        try {
            reserveBidObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR -> Input string NON-JSON value`);
        }

        try {
            reserveBidMarketDocumentFileIdList.schema.validateSync(
                reserveBidObj,
                {strict: true, abortEarly: false},
            );
        } catch (error) {
            throw error;
        }
        return reserveBidObj;
    }

    public static readonly schema = Yup.object().shape({
        reserveBidMrid: Yup.string().required('reserveBidMrid is a compulsory string.').typeError('reserveBidMrid must be a string'),
        attachmentFileIdList: Yup.array().of(Yup.string()).notRequired(),
    });


    public reserveBidMrid: string;

    public attachmentFileIdList?: string[];
}
