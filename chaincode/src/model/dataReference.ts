import * as Yup from 'yup';

export class DataReference {
    public static readonly schema = Yup.object().shape({
        collection: Yup.string().required('collection is a compulsory string.')
            .typeError('collection must be a string'),
        data: Yup.object().required('data is a compulsory object.'),
        dataAction: Yup.string().notRequired().typeError('dataAction must be a string'),
        docType: Yup.string().required('docType is a compulsory string.').typeError('docType must be a string'),
        previousCollection: Yup.string().notRequired().typeError('previousCollection must be a string'),
    });

    public docType: string;
    public collection: string;
    public data: any;
    public previousCollection?: string;
    public dataAction?: string;
}
