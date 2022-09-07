import { DataReference } from '../dataReference';

export class ReconciliationState {
    public updateOrders: DataReference[] = [];

    public remainingParentsMap?: Map<string,DataReference[]> = new Map();
    public remainingChilds?: DataReference[] = [];

    public endStateRefsMap: Map<string,DataReference[]> = new Map();
    public startState: DataReference[] = [];

}
