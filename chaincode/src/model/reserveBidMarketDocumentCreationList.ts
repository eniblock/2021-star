import { AttachmentFile } from './attachmentFile';
import { ReserveBidMarketDocument } from './reserveBidMarketDocument';

export class ReserveBidMarketDocumentCreationList {
    public static formatString(inputString: string): ReserveBidMarketDocumentCreationList {
        let reserveBidCreationObj: ReserveBidMarketDocumentCreationList;
        try {
            reserveBidCreationObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR -> Input string NON-JSON value`);
        }

        for (const reserveBid of reserveBidCreationObj.reserveBidList) {
            ReserveBidMarketDocument.schema.validateSync(
                reserveBid,
                {strict: true, abortEarly: false},
            );
            }
        if (reserveBidCreationObj.attachmentFileList) {
            for (const attachmentFile of reserveBidCreationObj.attachmentFileList) {
                AttachmentFile.schema.validateSync(
                    attachmentFile,
                    {strict: true, abortEarly: false},
                );
            }
        }
        return reserveBidCreationObj;
    }

    public reserveBidList: ReserveBidMarketDocument[];
    public attachmentFileList?: AttachmentFile[];
}
