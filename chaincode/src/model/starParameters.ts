/*
 * SPDX-License-Identifier: Apache-2.0
 */
import { Context } from 'fabric-contract-api';
import * as Yup from 'yup';
import { DataReference } from './dataReference';
import { Logger } from 'winston';

export class STARParameters {
    public static readonly schema = Yup.object().shape({
        docType: Yup.string().notRequired(),
        values: Yup.object().required(),
    });

    public docType?: string;
    public values: Map<string,any>;
    public ctx: Context;
    public loggerMgt: any;
    public logger: Logger;


    /*
    * Memory Pool Management
    */
    private memoryPool: Map<string, Map<string, DataReference>> = new Map();
    //Map< DataId , Map < CollectionId, DataRef > >

    public addInMemoryPool(key:string, dataReference: DataReference) {
        var poolelt = this.memoryPool.get(key);
        if (!poolelt) {
            poolelt = new Map();
        }
        poolelt.set(dataReference.collection, dataReference);

        this.memoryPool.set(key, poolelt);
    }

    public getFromMemoryPool(key:string): Map<string, DataReference> {
        const poolelt = this.memoryPool.get(key);
        return poolelt;
    }
}
