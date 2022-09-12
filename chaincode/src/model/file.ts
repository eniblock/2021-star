import * as Yup from 'yup';

export class FileWithStatus {
    public file: File;
    public status: string;
}

export class File {
    public static readonly schema = Yup.object().shape({
        docType: Yup.string().notRequired().typeError('docType must be a string'),
        fileId: Yup.string().required('fileId is a compulsory string.').typeError('fileId must be a string'),
        fileContent: Yup.string().required('fileContent is a compulsory string.').typeError('fileId must be a string'),
    });

    public docType?: string;
    public fileId: string;
    public fileContent: string;
}
