/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Yup from 'yup';
import { DataReference } from './dataReference';

export class STARParameters {
    public static readonly schema = Yup.object().shape({
        docType: Yup.string().notRequired(),
        values: Yup.object().required(),
    });

    public docType?: string;
    public values: Map<string,any>;


    /*
    * Memory Pool Management
    */
    private memoryPool: Map<string, Map<string, DataReference>> = new Map();

    public addInMemoryPool(key:string, dataReference: DataReference) {
        var poolelt = this.memoryPool.get(key);
        if (!poolelt) {
            poolelt = new Map();
        }
        poolelt.set(dataReference.collection, dataReference);

        this.memoryPool.set(key, poolelt);
    }

    public getFromMemoryPool(key:string): Map<string, DataReference> {
        return this.memoryPool.get(key);
    }
}
