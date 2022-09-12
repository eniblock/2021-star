import * as Yup from 'yup';
import { DocType } from '../enums/DocType';

export class AttachmentFileWithStatus {
    public file: AttachmentFile;
    public status: string;
}

export class AttachmentFile {
    public static formatString(inputString: string) : AttachmentFile {
        let fileObj: AttachmentFile;
        try {
            fileObj = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR ${DocType.FILE} -> Input string NON-JSON value`);
        }

        try {
            AttachmentFile.schema.validateSync(
                fileObj,
                {strict: true, abortEarly: false},
            );
        } catch (error) {
            throw error;
        }
        return fileObj;
    }

    public static formatListString(inputString: string) : AttachmentFile[] {
        let fileList: AttachmentFile[] = [];
        try {
            fileList = JSON.parse(inputString);
        } catch (error) {
            throw new Error(`ERROR ${DocType.FILE} by list -> Input string NON-JSON value`);
        }

        if (fileList && fileList.length > 0) {
            for (var fileObj of fileList) {
                try {
                    AttachmentFile.schema.validateSync(
                        fileObj,
                        {strict: true, abortEarly: false},
                    );
                } catch (error) {
                    throw error;
                }
            }
        }
        return fileList;
    }




    public static readonly schema = Yup.object().shape({
        docType: Yup.string().notRequired().typeError('docType must be a string'),
        fileId: Yup.string().required('fileId is a compulsory string.').typeError('fileId must be a string'),
        fileContent: Yup.string().required('fileContent is a compulsory string.').typeError('fileId must be a string'),
    });

    public docType?: string;
    public fileId: string;
    public fileContent: string;
}
