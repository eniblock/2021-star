import { ParametersType } from '../../enums/ParametersType';
import { DataObjArgument } from '../../model/arguments/dataObjArgument';
import { IdArgument } from '../../model/arguments/idArgument';
import { DataReference } from '../../model/dataReference';
import { STARParameters } from '../../model/starParameters';
import { HLFServices } from './HLFservice';

export class StarPrivateDataService {

    public static async getObj(
        params: STARParameters,
        arg: IdArgument): Promise<any> {
        params.logger.debug('============= START : getObj %s %s %s ===========', arg.docType, arg.collection, arg.id);

        arg.collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, arg.collection);

        let dataObj: any = null;

        const poolKey = arg.id;

        const dataRef: Map<string, DataReference> = params.getFromMemoryPool(poolKey);
        if (dataRef
            && dataRef.get(arg.collection)
            && dataRef.get(arg.collection).data
            && (dataRef.get(arg.collection).docType === arg.docType || !arg.docType || arg.docType.length === 0)
            ) {
            dataObj = dataRef.get(arg.collection).data;
        }

        if (!dataObj) {
            const dataAsBytes: Uint8Array = await StarPrivateDataService.getRaw(params, arg);
            if (dataAsBytes) {
                try {
                    dataObj = JSON.parse(dataAsBytes.toString());

                    const poolRef: DataReference = {collection: arg.collection, docType: arg.docType, data: dataObj};
                    params.addInMemoryPool(poolKey, poolRef);
                } catch (error) {
                    params.logger.debug('=============  END  : getObj with Error ===========');
                    throw new Error(`ERROR ${arg.docType} -> Input string NON-JSON value`);
                }
            }

        }
        params.logger.debug('=============  END  : getObj %s %s %s ===========', arg.docType, arg.collection, arg.id);
        return dataObj;
    }

    public static async getObjRefbyId(
        params: STARParameters,
        arg: IdArgument): Promise<Map<string, DataReference>> {
        params.logger.debug('============= START : getObjRefbyId %s %s %s ===========',
            arg.docType, arg.collection, arg.id);

        // params.logger.debug("----------------------------------")
        // params.logger.debug("id:",arg.id)

        const poolKey = arg.id;
        let result: Map<string, DataReference> = params.getFromMemoryPool(poolKey);

        // params.logger.debug("result: ", JSON.stringify([...result]))

        if (!result || !result.values().next().value) {
            result = new Map();
            let target: string[] = [];
            if (arg.collection && arg.collection.length > 0) {
                target = [arg.collection];
            } else {
                target =
                    await HLFServices.getCollectionsFromParameters(
                        params, ParametersType.DATA_TARGET, ParametersType.ALL);
            }

            const collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET, target);

            // params.logger.debug("target:",JSON.stringify(target))
            // params.logger.debug("collections:",JSON.stringify(collections))
            // params.logger.debug("- - - - - - - - - - - - - - - - -")

            if (collections) {
                for (const collection of collections) {
                    let collectionResult: any;
                    // params.logger.debug("collection:",collection)
                    try {
                        collectionResult =
                            await StarPrivateDataService.getObj(params, {id: arg.id, collection, docType: arg.docType});
                    } catch (error) {
                        if (error && error.message && error.message.includes('NON-JSON')) {
                            params.logger.debug('=============  END  : getObjRefbyId with Error ===========');
                            throw error;
                        }
                        error = null;
                    }

                    // params.logger.debug("collectionResult:",JSON.stringify(collectionResult))

                    if (collectionResult) {
                        const elt  = {
                            collection,
                            data: collectionResult,
                            docType: arg.docType,
                        };
                        result.set(collection, elt);

                        params.addInMemoryPool(poolKey, elt);
                    }

                    // params.logger.debug("result:",JSON.stringify([...result]))
                    // params.logger.debug("- - - - - - - - - - - - - - - - -")
                }
            }
        }

        // params.logger.debug("result:",JSON.stringify([...result]))
        // params.logger.debug("- - - - - - - - - - - - - - - - -")

        if (!result || !result.values().next().value) {
            // params.logger.debug("EeErRrOoOrRr")
            // params.logger.debug("values: ", JSON.stringify(result.values()))
            // params.logger.debug("next: ", JSON.stringify(result.values().next()))
            // params.logger.debug("value: ", JSON.stringify(result.values().next().value))
            params.logger.debug('=============  END  : getObjRefbyId with Error ===========');
            throw new Error(`${arg.docType} : ${arg.id} does not exist (not found in any collection).`);
        }

        params.logger.debug('=============  END  : getObjRefbyId %s %s %s ===========',
            arg.docType, arg.collection, arg.id);
        return result;
    }

    public static async write(
        params: STARParameters,
        arg: DataObjArgument): Promise<void> {

        params.logger.debug('============= START : WritePrivateData %s %s %s ===========',
            arg.dataObj.docType, arg.collection, arg.id);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, arg.collection);
        await params.ctx.stub.putPrivateData(collection, arg.id, Buffer.from(JSON.stringify(arg.dataObj)));

        const poolRef: DataReference = {collection, docType: arg.dataObj.docType, data: arg.dataObj};

        const poolKey = arg.id;
        params.addInMemoryPool(poolKey, poolRef);

        params.logger.debug('=============  END  : WritePrivateData %s %s %s ===========',
            arg.dataObj.docType, collection, arg.id);
    }

    private static async getRaw(
        params: STARParameters,
        arg: IdArgument): Promise<Uint8Array> {

        params.logger.debug('============= START : getPrivateData %s %s %s ===========',
            arg.docType, arg.collection, arg.id);

        let dataAsBytes: Uint8Array;
        try {
            dataAsBytes = await params.ctx.stub.getPrivateData(arg.collection, arg.id);
        } catch (error) {
            params.logger.debug('=============  END  : getPrivateData error ===========');
            throw new Error(`${arg.docType} : ${arg.id} does not exist (error)`);
        }
        if (!dataAsBytes || dataAsBytes.length === 0) {
            params.logger.debug('=============  END  : getPrivateData empty ===========');
            throw new Error(`${arg.docType} : ${arg.id} does not exist (empty)`);
        }

        params.logger.debug('=============  END  : getPrivateData %s %s %s ===========',
            arg.docType, arg.collection, arg.id);
        return dataAsBytes;
    }

}
