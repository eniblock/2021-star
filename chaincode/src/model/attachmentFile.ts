import * as Yup from 'yup';
import { DocType } from '../enums/DocType';

export class AttachmentFile {

    public static readonly schema = Yup.object().shape({
        docType: Yup.string().notRequired().typeError('docType must be a string'),
        fileContent: Yup.string().required('fileContent is a compulsory string.').typeError('fileId must be a string'),
        fileId: Yup.string().required('fileId is a compulsory string.').typeError('fileId must be a string'),
    });

    public static formatString(inputString: string): AttachmentFile {
        let fileObj: AttachmentFile;
        try {
            fileObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR ${DocType.ATTACHMENT_FILE} -> Input string NON-JSON value`);
        }

        AttachmentFile.schema.validateSync(
            fileObj,
            {strict: true, abortEarly: false},
        );
        return fileObj;
    }

    public static formatListString(inputString: string): AttachmentFile[] {
        let fileList: AttachmentFile[] = [];
        try {
            fileList = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR ${DocType.ATTACHMENT_FILE} by list -> Input string NON-JSON value`);
        }

        if (fileList && fileList.length > 0) {
            for (const fileObj of fileList) {
                AttachmentFile.schema.validateSync(
                    fileObj,
                    {strict: true, abortEarly: false},
                );
            }
        }
        return fileList;
    }

    public docType?: string;
    public fileId: string;
    public fileContent: string;

    // Currently attachement files are only used for Reserve Bid Market Participant
    // If it's needed to be used for any other data, it's needed to add a field linkedData.
    // linkedData wille have to refer to a DocType (enum) value.
}
