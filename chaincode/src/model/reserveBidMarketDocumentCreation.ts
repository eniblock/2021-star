import { AttachmentFile } from './attachmentFile';
import { ReserveBidMarketDocument } from './reserveBidMarketDocument';

export class ReserveBidMarketDocumentCreation {
    public static formatString(inputString: string) : ReserveBidMarketDocumentCreation {
        let reserveBidCreationObj: ReserveBidMarketDocumentCreation;
        try {
            reserveBidCreationObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR -> Input string NON-JSON value`);
        }

        try {
            ReserveBidMarketDocument.schema.validateSync(
                reserveBidCreationObj.reserveBid,
                {strict: true, abortEarly: false},
            );
            if (reserveBidCreationObj.attachmentFileList) {
                for (var attachmentFile of reserveBidCreationObj.attachmentFileList) {
                    AttachmentFile.schema.validateSync(
                        attachmentFile,
                        {strict: true, abortEarly: false},
                    )
                }
            }
        } catch (error) {
            throw error;
        }
        return reserveBidCreationObj;
    }


    public reserveBid: ReserveBidMarketDocument;
    public attachmentFileList?: AttachmentFile[];
}
