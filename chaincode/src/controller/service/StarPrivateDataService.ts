import { Context } from "fabric-contract-api";
import { ParametersType } from "../../enums/ParametersType";
import { DataObjArgument } from "../../model/arguments/dataObjArgument";
import { IdArgument } from "../../model/arguments/idArgument";
import { DataReference } from "../../model/dataReference";
import { STARParameters } from "../../model/starParameters";
import { HLFServices } from "./HLFservice";

export class StarPrivateDataService {
    private static async getRaw(
        params: STARParameters,
        arg: IdArgument): Promise<Uint8Array> {

        console.debug('============= START : getPrivateData %s %s %s ===========', arg.docType, arg.collection, arg.id);

        let dataAsBytes: Uint8Array;
        try {
            dataAsBytes = await params.ctx.stub.getPrivateData(arg.collection, arg.id);
        } catch (error) {
            throw new Error(`Site : ${arg.id} does not exist`);
        }
        if (!dataAsBytes || dataAsBytes.length === 0) {
            throw new Error(`Site : ${arg.id} does not exist`);
        }

        console.debug('============= END : getPrivateData %s %s %s ===========', arg.docType, arg.collection, arg.id);
        return dataAsBytes;
    }


    public static async getObj(
        params: STARParameters,
        arg: IdArgument): Promise<any> {

        arg.collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, arg.collection);


        var dataObj:any = null;

        const dataRef = params.getFromMemoryPool(arg.id);
        if (dataRef
            && dataRef.get(arg.collection)
            && dataRef.get(arg.collection).data
            && (dataRef.get(arg.collection).docType === arg.docType || !arg.docType || arg.docType.length == 0)
            ) {
            dataObj = dataRef.get(arg.collection).data;
        }

        if (!dataObj) {
            const dataAsBytes: Uint8Array = await StarPrivateDataService.getRaw(params, arg);
            if (dataAsBytes) {
                try {
                    dataObj = JSON.parse(dataAsBytes.toString());
                } catch (error) {
                    throw new Error(`ERROR ${arg.docType} -> Input string NON-JSON value`);
                }
            }

        }
        return dataObj;
    }


    public static async getObjRefbyId(
        params: STARParameters,
        arg: IdArgument): Promise<Map<string, DataReference>> {

        // console.info("----------------------------------")
        // console.info("id:",id)
        var result:Map<string, DataReference> = params.getFromMemoryPool(arg.id);

        if (!result || !result.values().next().value) {
            result = new Map();
            const target: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
            const collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET, target);

            // console.info("target:",JSON.stringify(target))
            // console.info("collections:",JSON.stringify(collections))
            // console.info("- - - - - - - - - - - - - - - - -")

            if (collections) {
                for (const collection of collections) {
                    let collectionResult:any;
                    // console.info("collection:",collection)
                    try {
                        collectionResult = await StarPrivateDataService.getObj(params, {id: arg.id, collection: collection, docType: arg.docType});
                    } catch (error) {
                        if (error && error.message && error.message.includes("NON-JSON")) {
                            throw error;
                        }
                        error = null;
                    }

                    // console.info("collectionResult:",JSON.stringify(collectionResult))

                    if (collectionResult && collectionResult.meteringPointMrid == arg.id) {
                        const elt  = {
                            collection: collection,
                            docType: arg.docType,
                            data: collectionResult
                        }
                        result.set(collection, elt);
                        params.addInMemoryPool(arg.id, elt);
                    }

                    // console.info("result:",JSON.stringify([...result]))
                    // console.info("- - - - - - - - - - - - - - - - -")
                }
            }
        }

        // console.info("result:",JSON.stringify([...result]))
        // console.info("- - - - - - - - - - - - - - - - -")

        if (!result || ! result.keys().next().value) {
            throw new Error(`${arg.docType} : ${arg.id} does not exist (not found in any collection).`);
        }

        // console.info("----------------------------------")
        return result;
    }


    public static async write(
        params: STARParameters,
        arg: DataObjArgument): Promise<void> {

        console.debug('============= START : WritePrivateData %s %s %s ===========', arg.dataObj.docType, arg.collection, arg.id);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, arg.collection);
        await params.ctx.stub.putPrivateData(collection, arg.id, Buffer.from(JSON.stringify(arg.dataObj)));

        const poolRef : DataReference = {collection: collection, docType: arg.dataObj.docType, data: arg.dataObj};
        params.addInMemoryPool(arg.id, poolRef);

        console.debug('============= END : WritePrivateData %s %s %s ===========', arg.dataObj.docType, collection, arg.id);
    }

}
