import * as Yup from 'yup';
import { DataReference } from './dataReference';

export class ConciliationState {

    public static readonly schema = Yup.object().shape({
        updateOrders: Yup.array().of(Yup.object()).required('updateOrders is a compulsory DataReference[].').typeError('updateOrders must be a DataReference[]'),
    });

    public updateOrders: DataReference[];
    public remaining?: DataReference[];
}
