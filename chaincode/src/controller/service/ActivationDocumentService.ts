import { Context } from "fabric-contract-api";
import { STARParameters } from '../../model/starParameters';
import { ParametersType } from "../../enums/ParametersType";
import { ActivationDocument } from "../../model/activationDocument";
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

        let prodAsBytes: Uint8Array;
        try {
            prodAsBytes = await ctx.stub.getPrivateData(collection, id);
        } catch (error) {
            throw new Error(`ActivationDocument : ${id} does not exist`);
        }
        if (!prodAsBytes || prodAsBytes.length === 0) {
            throw new Error(`ActivationDocument : ${id} does not exist`);
        }

        console.debug('============= END : getRaw ActivationDocumentService ===========');
        return prodAsBytes;
    }


    public static async getObj(
        ctx: Context,
        params: STARParameters,
        id: string,
        target: string = ''): Promise<ActivationDocument> {

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.ACTIVATION_DOCUMENT, target);

        var activationDocumentAsBytes: Uint8Array = await ActivationDocumentService.getRaw(ctx, collection, id);
        var activationDocumentObj:ActivationDocument = ActivationDocument.formatString(activationDocumentAsBytes.toString());

        return activationDocumentObj;
    }

    public static async getObjRefbyId(
        ctx: Context,
        params: STARParameters,
        id: string,
        target: string[] = []): Promise<DataReference> {

        const collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.ACTIVATION_DOCUMENT, target);

        var result:DataReference = null;
        if (collections) {
            for (const collection of collections) {
                let collectionResult:ActivationDocument;
                try {
                    collectionResult = await ActivationDocumentService.getObj(ctx, params, id, collection);
                } catch (error) {
                    if (error && error.message && error.message.includes("NON-JSON")) {
                        throw error;
                    }
                }
                if (collectionResult && collectionResult.activationDocumentMrid == id) {
                    result  = {
                        collection: collection,
                        docType: ParametersType.ACTIVATION_DOCUMENT,
                        data: collectionResult
                    }
                }
            }
        }

        if (!result || ! result.data) {
            throw new Error(`ActivationDocument : ${id} does not exist`);
        }

        return result;
    }

    public static async write(
        ctx: Context,
        params: STARParameters,
        activationDocumentInput: ActivationDocument,
        target: string = ''): Promise<void> {
        console.debug('============= START : Write %s ActivationDocumentService ===========', activationDocumentInput.activationDocumentMrid);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.ACTIVATION_DOCUMENT, target);

        activationDocumentInput.docType = DocType.ACTIVATION_DOCUMENT;

        await ctx.stub.putPrivateData(collection,
            activationDocumentInput.activationDocumentMrid,
            Buffer.from(JSON.stringify(activationDocumentInput)));

        console.debug('============= END : Write %s ActivationDocumentService ===========', activationDocumentInput.activationDocumentMrid);
    }

    public static async getQueryArrayResult(
        ctx: Context,
        params: STARParameters,
        query: string,
        target: string[] = []): Promise<any[]>  {
        console.debug('============= START : getQueryResult ActivationDocumentService ===========');

        const collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.ACTIVATION_DOCUMENT, target);
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



}
