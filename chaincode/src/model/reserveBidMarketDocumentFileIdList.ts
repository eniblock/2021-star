import * as Yup from 'yup';

export class ReserveBidMarketDocumentFileIdList {

    public static readonly schema = Yup.object().shape({
        attachmentFileIdList: Yup.array().of(Yup.string()).notRequired(),
        reserveBidMrid: Yup.string().required('reserveBidMrid is a compulsory string.').typeError('reserveBidMrid must be a string'),
    });

    public static formatString(inputString: string): ReserveBidMarketDocumentFileIdList {
        let reserveBidObj: ReserveBidMarketDocumentFileIdList;
        try {
            reserveBidObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR -> Input string NON-JSON value`);
        }

        try {
            ReserveBidMarketDocumentFileIdList.schema.validateSync(
                reserveBidObj,
                {strict: true, abortEarly: false},
            );
        } catch (error) {
            throw error;
        }
        return reserveBidObj;
    }

    public reserveBidMrid: string;

    public attachmentFileIdList?: string[];
}
