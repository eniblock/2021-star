import { Context } from "fabric-contract-api";
import { Parameters } from '../../model/parameters';
import { ParametersType } from "../../enums/ParametersType";
import { ActivationDocument } from "../../model/activationDocument";
import { QueryStateService } from "./QueryStateService";

export class ActivationDocumentService {
    // public static async getRaw(
    //     ctx: Context,
    //     prodId: string): Promise<Uint8Array> {
    //     console.debug('============= START : getRaw %s ActivationDocumentService ===========', prodId);

    //     const prodAsBytes = await ctx.stub.getState(prodId);
    //     if (!prodAsBytes || prodAsBytes.length === 0) {
    //         throw new Error(`ActivationDocument : ${prodId} does not exist`);
    //     }

    //     console.debug('============= END : getRaw %s ActivationDocumentService ===========', prodId);
    //     return prodAsBytes;
    // }


    public static async write(
        ctx: Context,
        params: Parameters,
        activationDocumentInput: ActivationDocument,
        target: string = ''): Promise<void> {
        console.debug('============= START : Write %s ActivationDocumentService ===========', activationDocumentInput.activationDocumentMrid);

        const collectionMap: Map<string, string[]> = params.values.get(ParametersType.ACTIVATION_DOCUMENT);
        var collection: string;
        if (collectionMap.has(target)) {
            collection = collectionMap.get(target)[0];
        } else {
            collection = collectionMap.get(ParametersType.DEFAULT)[0];
        }

        activationDocumentInput.docType = 'activationDocument';

        await ctx.stub.putPrivateData(collection,
            activationDocumentInput.activationDocumentMrid,
            Buffer.from(JSON.stringify(activationDocumentInput)));

        console.debug('============= END : Write %s ActivationDocumentService ===========', activationDocumentInput.activationDocumentMrid);
    }

    public static async getQueryArrayResult(
        ctx: Context,
        params: Parameters,
        query: string,
        target: string = ''): Promise<any[]>  {
        console.debug('============= START : getQueryResult ActivationDocumentService ===========');

        const collectionMap: Map<string, string[]> = params.values.get(ParametersType.ACTIVATION_DOCUMENT);
        var collections: string[];
        var allResults: any[] = [];

        if (collectionMap) {
            if (collectionMap.has(target)) {
                collections = collectionMap.get(target);
            } else {
                collections = collectionMap.get(ParametersType.DEFAULT);
            }

            for (const collection of collections) {
                const collectionResults = await QueryStateService.getPrivateQueryArrayResult(ctx, query, collection);
                allResults = [].concat(allResults, collectionResults);
            }
        }

        console.debug('============= END : getQueryResult ActivationDocumentService ===========');
        return allResults;
    }



}
