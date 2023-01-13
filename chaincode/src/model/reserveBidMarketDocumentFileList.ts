import * as Yup from 'yup';
import { AttachmentFile } from './attachmentFile';

export class ReserveBidMarketDocumentFileList {

    public static readonly schema = Yup.object().shape({
        attachmentFileList: Yup.array().notRequired(),
        reserveBidMrid: Yup.string().required('reserveBidMrid is a compulsory string.').typeError('reserveBidMrid must be a string'),
    });

    public static formatString(inputString: string): ReserveBidMarketDocumentFileList {
        let reserveBidObj: ReserveBidMarketDocumentFileList;
        try {
            reserveBidObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR -> Input string NON-JSON value`);
        }

        ReserveBidMarketDocumentFileList.schema.validateSync(
            reserveBidObj,
            {strict: true, abortEarly: false},
        );
        if (reserveBidObj.attachmentFileList) {
            for (const attachmentFile of reserveBidObj.attachmentFileList) {
                AttachmentFile.schema.validateSync(
                    attachmentFile,
                    {strict: true, abortEarly: false},
                );
            }
        }
        return reserveBidObj;
    }

    public reserveBidMrid: string;

    public attachmentFileList?: AttachmentFile[];
}
