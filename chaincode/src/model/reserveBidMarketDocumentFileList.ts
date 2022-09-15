import * as Yup from 'yup';
import { AttachmentFile } from './attachmentFile';

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
            if (reserveBidObj.attachmentFileList) {
                for (var attachmentFile of reserveBidObj.attachmentFileList) {
                    AttachmentFile.schema.validateSync(
                        attachmentFile,
                        {strict: true, abortEarly: false},
                    )
                }
            }
        } catch (error) {
            throw error;
        }
        return reserveBidObj;
    }

    public static readonly schema = Yup.object().shape({
        reserveBidMrid: Yup.string().required('reserveBidMrid is a compulsory string.').typeError('reserveBidMrid must be a string'),
        attachmentFileList: Yup.array().notRequired(),
    });


    public reserveBidMrid: string;

    public attachmentFileList?: AttachmentFile[];
}
