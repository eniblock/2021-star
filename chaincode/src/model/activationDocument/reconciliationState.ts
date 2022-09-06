import * as Yup from 'yup';
import { DataReference } from '../dataReference';

export class ReconciliationState {

    public static readonly schema = Yup.object().shape({
        updateOrders: Yup.array().of(Yup.object()).required('updateOrders is a compulsory DataReference[].').typeError('updateOrders must be a DataReference[]'),
    });

    public updateOrders: DataReference[];
    public remainingParents?: DataReference[];

    public remainingParentsMap?: Map<string,DataReference[]>;
    public remainingChilds?: DataReference[];

    public endStateRefsMap?: Map<string,DataReference[]>;

}
