import { Context } from "fabric-contract-api";
import { STARParameters } from '../../model/starParameters';
import { ParametersType } from "../../enums/ParametersType";
import { ActivationDocument } from "../../model/activationDocument/activationDocument";
import { QueryStateService } from "./QueryStateService";
import { HLFServices } from "./HLFservice";
import { DataReference } from "../../model/dataReference";
import { DocType } from "../../enums/DocType";

export class ActivationDocumentService {
    private static async getRaw(
        ctx: Context,
        collection: string,
        id: string): Promise<Uint8Array> {
        console.debug('============= START : getRaw %s / %s ActivationDocumentService ===========', collection, id);

        let activationDocumentAsBytes: Uint8Array;
        try {
            activationDocumentAsBytes = await ctx.stub.getPrivateData(collection, id);
        } catch (error) {
            throw new Error(`ActivationDocument : ${id} does not exist`);
        }
        if (!activationDocumentAsBytes || activationDocumentAsBytes.length === 0) {
            throw new Error(`ActivationDocument : ${id} does not exist`);
        }

        console.debug('============= END : getRaw ActivationDocumentService ===========');
        return activationDocumentAsBytes;
    }


    public static async getObj(
        ctx: Context,
        params: STARParameters,
        id: string,
        target: string = ''): Promise<ActivationDocument> {

        var activationDocumentObj:ActivationDocument;
        var pool:Map<string, DataReference> = params.getFromMemoryPool(id);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, target);

        if (pool && pool.has(collection)) {
            const activationDocumentReference = pool.get(collection);
            activationDocumentObj = activationDocumentReference.data;
        } else {
            var activationDocumentAsBytes: Uint8Array = await ActivationDocumentService.getRaw(ctx, collection, id);
            activationDocumentObj = ActivationDocument.formatString(activationDocumentAsBytes.toString());
        }

        return activationDocumentObj;
    }

    public static async getObjRefbyId(
        ctx: Context,
        params: STARParameters,
        id: string): Promise<Map<string, DataReference>> {

        // console.info("----------------------------------")
        // console.info("id:",id)
        var result:Map<string, DataReference> = params.getFromMemoryPool(id);

        if (!result) {
            result = new Map();
            const target: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
            const collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET, target);

            // console.info("target:",JSON.stringify(target))
            // console.info("collections:",JSON.stringify(collections))
            // console.info("- - - - - - - - - - - - - - - - -")

            if (collections) {
                for (const collection of collections) {
                    let collectionResult:ActivationDocument;
                    // console.info("collection:",collection)
                    try {
                        collectionResult = await ActivationDocumentService.getObj(ctx, params, id, collection);
                    } catch (error) {
                        if (error && error.message && error.message.includes("NON-JSON")) {
                            throw error;
                        }
                    }

                    // console.info("collectionResult:",JSON.stringify(collectionResult))

                    if (collectionResult && collectionResult.activationDocumentMrid == id) {
                        const elt  = {
                            collection: collection,
                            docType: DocType.ACTIVATION_DOCUMENT,
                            data: collectionResult
                        }
                        result.set(collection, elt);
                    }

                    // console.info("result:",JSON.stringify([...result]))
                    // console.info("- - - - - - - - - - - - - - - - -")
                }
            }
        }

        // console.info("result:",JSON.stringify([...result]))
        // console.info("- - - - - - - - - - - - - - - - -")

        if (!result || ! result.keys().next().value) {
            throw new Error(`ActivationDocument : ${id} does not exist`);
        }

        // console.info("----------------------------------")
        return result;
    }

    public static async write(
        ctx: Context,
        params: STARParameters,
        activationDocumentInput: ActivationDocument,
        target: string = ''): Promise<void> {
        console.debug('============= START : Write %s ActivationDocumentService ===========', activationDocumentInput.activationDocumentMrid);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, target);

        activationDocumentInput.docType = DocType.ACTIVATION_DOCUMENT;

        await ctx.stub.putPrivateData(collection,
            activationDocumentInput.activationDocumentMrid,
            Buffer.from(JSON.stringify(activationDocumentInput)));

        console.debug('============= END : Write %s ActivationDocumentService ===========', activationDocumentInput.activationDocumentMrid);
    }

    public static async delete(
        ctx: Context,
        params: STARParameters,
        activationDocumentMrid: string,
        target: string = ''): Promise<void> {
        console.debug('============= START : Delete %s ActivationDocumentService ===========', activationDocumentMrid);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, target);

        await ctx.stub.deletePrivateData(collection, activationDocumentMrid);

        console.debug('============= END : Delete %s ActivationDocumentService ===========', activationDocumentMrid);
    }

    public static async getQueryArrayResult(
        ctx: Context,
        params: STARParameters,
        query: string,
        target: string[] = []): Promise<any[]>  {
        console.debug('============= START : getQueryResult ActivationDocumentService ===========');

        const collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET, target);
        var allResults: any[] = [];

        if (collections) {
            for (const collection of collections) {
                const collectionResults = await QueryStateService.getPrivateQueryArrayResult(ctx, query, collection);
                allResults = [].concat(allResults, collectionResults);
            }
        }

        console.debug('============= END : getQueryResult ActivationDocumentService ===========');
        return allResults;
    }


    public static dataReferenceArrayToMap(dataReferenceArray:DataReference[]): Map<string, DataReference> {
        const returnedMap: Map<string, DataReference> = new Map();

        for (var dataReference of dataReferenceArray) {
            var data: ActivationDocument = dataReference.data;
            returnedMap.set(data.activationDocumentMrid, dataReference);
        }

        return returnedMap;
    }
}
