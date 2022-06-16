import * as Yup from 'yup';

export class DataReference {
    public static readonly schema = Yup.object().shape({
        docType: Yup.string().required('docType is a compulsory string.').typeError('docType must be a string'),
        collection: Yup.string().required('collection is a compulsory string.').typeError('collection must be a string'),
        data: Yup.object().required('data is a compulsory object.'),
    });

    public docType: string;
    public collection: string;
    public data: any;
}
